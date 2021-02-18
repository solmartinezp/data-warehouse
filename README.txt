Data Warehouse

Installation of dependencies
npm install

Preparing the DB
First you need to create a database in your mySQL Server named 'datawarehouse'.
After that you need to run the queries stored in the .mysql files (following that specific order),
which you can find in the database folder.
First you create the tables, and then you should execute specific queries to add some standard data, which you can find in the canales.sql, usuarios.sql, regiones.sql files.
Here, you'll find that some users have been provided (one administrator and one basic profile), some regions and channels. 
Finally you must setup an .env file at the root of the data_warehouse directory (similar to the example.env file)
with the configuration of your mySQL database.

To run locally
To run the service locally, you must run the following command at the root of the data_warehouse directory :

npm run start

Then, open the index.html file in your browser.
In order to login, you can use the following credentials:
ADMIN:
email: sol@gmail.com
password: password1

or
BASIC:
email: juan@gmail.com
password: password2

Swagger
There is a swagger file with the documentation of the API 