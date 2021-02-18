const express= require('express');
const jwt= require('jsonwebtoken');
const jwtPass = process.env.JWT_PASS;
const sequelize= require('../database/connection');
const bodyParser = require('body-parser');
const cors = require('cors');
const md5= require('md5');
const {hashPassword, authenticateUser, isAdmin} = require('../middleware/middlewares');

//CREATE NEW ROUTER
const router= new express.Router();

router.use(express.json());
router.use(cors());
router.use( bodyParser.json() );       
router.use(bodyParser.urlencoded({ extended: false }));


//-------------------------------------USERS---------------------------------------//

// -------------------------------------CREAR USUARIO------------------------------------//
router.post('/usuarios/registro', authenticateUser, isAdmin, hashPassword, (req, res)=> {
    let o = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        email: req.body.email,
        contrasenia: req.body.contrasenia,
        admin: req.body.admin
    }

    let values= {
                nombre: o.nombre,
                apellido: o.apellido,
                email: o.email,
                contrasenia: o.contrasenia, 
                admin: o.admin
            };

    sequelize.query('SELECT * FROM usuarios WHERE email= :email', 
    { replacements: values,
    type: sequelize.QueryTypes.SELECT}
    ).then((projects) => {
        if (projects.length>=1) {
            return res.status(400).json({status_code: 400, message: 'User already exists'});
        } 
        sequelize.query('INSERT INTO USUARIOS (nombre, apellido, email, contrasenia, admin) VALUES (:nombre, :apellido, :email, :contrasenia, :admin)', {
            replacements: values})
        .then((c)=> res.status(201).json({message: 'Nuevo usuario creado'}))
        .catch(err=> console.error(err));
    }) 
})

// //-------------------------------------LOGIN-----------------------------------------//
router.post('/usuarios/login', hashPassword, (req, res)=> {
    let o = {
        email: req.body.email,
       contrasenia: req.body.contrasenia,
    }

    let values= {email: o.email,
                contrasenia: o.contrasenia, 
    };

    sequelize.query('SELECT * FROM usuarios WHERE email= :email', 
    { replacements: values,
    type: sequelize.QueryTypes.SELECT}
    ).then((projects) => {
        if (projects.length>=1) {
            if (projects[0].contrasenia == o.contrasenia) {
                var j = {
                    usuario_id: projects[0].id,
                    admin: projects[0].admin
                }
                var token = jwt.sign( j, jwtPass);
                return res.status(200).json({token: token, admin: j.admin}); //.send si no funciona
            }
        } 
        return res.status(400).json({status_code: 400, message: 'Incorrect email or password'}); 
    }) 
})

//ALL USERS (ADMIN ONLY)
router.get('/usuarios', authenticateUser, isAdmin, (req, res)=> {
    sequelize.query(`SELECT id, CONCAT(nombre, ' ' ,apellido) as nombre, email, admin FROM usuarios`, 
    { type: sequelize.QueryTypes.SELECT}
    ).then(function(projects) {
        res.json(projects);
    })
    .catch(err=> res.status(404).json({status_code: 404}));
})

//ONE USER 
router.get('/usuarios/:id', authenticateUser, isAdmin, (req, res)=> {
    let id= req.params.id;
    let values= [id];
    sequelize.query(`SELECT * FROM usuarios WHERE id= ?`, 
    {replacements: values,
    type: sequelize.QueryTypes.SELECT}
    ).then(function(projects) {
        res.json(projects);
    })
    .catch(err=> res.status(404).json({status_code: 404}));
})

//--------------------------------EDITAR USUARIO------------------------------------------
router.patch('/usuarios/:id', authenticateUser, isAdmin, (req,res)=> {
    let id= req.params.id;
    let o= {};

    if (req.body.admin == "Administrador") {
        req.body.admin= 1;
    } else if (req.body.admin== "Básico") {
        req.body.admin= 0;
    }
    
    if (req.body.contrasenia != '' || req.body.contrasenia.length >1) {
        console.log('contra defined')
        req.body.contrasenia= md5(req.body.contrasenia);
        o.nombre= req.body.nombre;
        o.apellido= req.body.apellido;
        o.email= req.body.email;
        o.admin= req.body.admin;
        o.contrasenia= req.body.contrasenia;
    } else {
        console.log('contra undefined')
        o.nombre= req.body.nombre;
        o.apellido= req.body.apellido;
        o.email= req.body.email;
        o.admin= req.body.admin;
    }

    let a= {};
    for (const property in o) {
        if (o[property]== undefined) {
            console.log('Skip');
        } else {
            a[`${property}`]= o[property];
        }
    }

    let stringOne= 'UPDATE usuarios SET ';
    let stringTwo= [];
    for (const nuevo in a) {
        stringTwo.push(` ${nuevo} = '${a[nuevo]}'`);
    }
    let stringThree= ` WHERE ID= ${id}`

    let stringFour= stringOne + stringTwo + stringThree;

    sequelize.query(stringFour)
    .then((r)=> {
        if (r[0].info.includes('Rows matched: 1')) {
            res.json({message: 'Usuario editado'});     
        } else {
            throw new Error();
        }
    })
    .catch((err)=> res.status(404).json({status_code: 404}));
})


//------------------------------ELIMINAR USUARIO-------------------------------------------
router.delete('/usuarios/:id', authenticateUser, isAdmin, (req, res)=> {
    let id= req.params.id;
    let values= [id];
    sequelize.query(`DELETE FROM USUARIOS WHERE ID= ?`,
    {replacements: values})
    .then((r)=> {
        if (r[0].affectedRows== 0) {
            throw new Error();
        } else {
            res.json({message: 'Usuario eliminado'})
        }
    
    })
    .catch((err)=> res.status(404).json({status_code: 404}));

})



module.exports= router;