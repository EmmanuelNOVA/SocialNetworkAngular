'use strict'

var express = require('express');
var bodyParser= require('body-parser');

var app = express();

//Cargar Rutas
var user_routes = require('./routes/user');

//middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Cors

//Rutas
app.use('/api',user_routes);

//Export
module.exports = app;