'use strict';

var mongoose = require('mongoose');
var app = require('./app');
var port =  3800;

//Conexión a la base de datos
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/curso_mean_social', { useMongoClient:true })
    .then(()=>{
        console.log('Conexion a la base de datos iniciada');
        //Crear Servidor
        app.listen(port,()=>{
            console.log("Servidor creado en http://localhost:3800");
        });
    })
    .catch(err=> console.log(err));
