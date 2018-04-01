'use strict';
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var mongoosePaginate  = require('mongoose-pagination');

function home(req,res) {
    res.status(200).send({
        message: "Hola mundo"
    });
}

function pruebas(req,res) {
    console.log(req.body);
    res.status(200).send({
        message: "Acción de pruebas en el servidor de NodeJS"
    });
}

//Registro
function saveUser(req, res) {
    var params = req.body;
    var user = new User();
    if(params.name && params.surname && params.email &&
        params.nick && params.password){

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;
        //Comprobar Usuarios Duplicados
        User.find({ $or: [
                        { email: user.email.toLowerCase() },
                        { nick: user.nick.toLowerCase() }
                    ]}).exec((err,users)=>{
                        if(err) return res.status(500).send({ message: 'Error en la petición  de usuarios'});
                        if(users && users.length >=1 ){
                            return res.status(200).send( { message : 'Usuario ya existe'});
                        }else{
                            // Cifrar password y guardar datos
                            bcrypt.hash(params.password,null,null,(err,hash)=>{
                                user.password = hash;
                                user.save((err,userStored)=>{
                                    if(err) return res.status(500).send({message : 'Error al guardar usuario'});
                                    if(userStored){
                                        res.status(200).send({user: userStored});
                                    }else {
                                        res.status(404).send({message: 'No se ha registrado el usuario'})
                                    }
                                });
                            });
                        }
                    });
    }else{
        res.status(200).send({
            message : 'Envia todos los campos necesarios'
        })
    }
}

//Login
function loginUser(req,res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;
    User.findOne( { email: email }, (err,user)=> {
       if(err) return res.status(500).send( { message:'Error en la petición' } );
       if(user){
            bcrypt.compare(password, user.password,(err,check)=>{
               if(check){
                   //devolver datos de usuario
                    if(params.gettoken){
                        //generar y devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        //devolver datos del usuario
                        user.password = undefined;
                        return res.status(200).send({user});
                    }
               }else{
                   return res.status(404).send({ message: 'El usuario no se pudo identificar'});
               }
            });
       }else{
           return res.status(404).send({ message: 'El usuario no se pudo identificar!!'});
       }
    });
}

//Conseguir datos de un usuario
function getUser(req,res) {
    var userId = req.params.id; //Llega por la URL
    User.findById(userId,(err,user)=>{
        if(err) return res.status(500).send( { message:'Error en la petición' });
        if(!user) return res.status(400).send( { message:'El usuario no existe' } );
        return res.status(200).send({user});
    });

}

//Devolver listado de usuarios paginados
function getUsers(req,res) {
    var identity_user_id = req.user.sub;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage,(err, users, total)=>{
       if(err) return res.status(500).send( { message: 'Error en la petición'} );
       if(!users) return res.status(404).send( {message: 'No hay usuarios disponibles'} );
       return res.status(200).send({
            users,
            total,
            page: Math.ceil(total/itemsPerPage)
       });
    });
}

function updateUser(req,res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar la propiedad password
    delete update.password;

    if(userId != req.user.sub){
        return res.status(500).send( { message: 'No tienes permisos para actualizar este usuario'});
    }
    User.findByIdAndUpdate(userId,update,{ new:true },(err, userUpdate)=>{
        if(err) return res.status(500).send( { message: 'Error en la petición de actualizar datos'} );

        if(!userUpdate) return res.status(404).send( { message: 'No se ha actualizado el usuario'});

        return res.status(200).send( { userUpdate });

    });
}

function uploadImage(req,res){
    var userId =req.params.id;
    if(userId != req.user.sub){
        return res.status(500).send( { message: 'No tienes permisos para actualizar este usuario'});
    }
    if(req.files){
        var file_path = req.files.image.path;
        var file_split =file_path.split('\\');
        var file_name = file_split[2];
    }
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage
};