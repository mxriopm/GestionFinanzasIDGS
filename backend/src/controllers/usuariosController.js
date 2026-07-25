const modeloUsuario = require('../models/usuarioModel');

function ObtenerUsuarios(req, res){
    modeloUsuario.find()
    .then((usuarios) => {   
        res.status(200).json({usuarios});
    })
    .catch((error) => {
        res.status(400).json({error: error.message});
    });
}

function consultarUsuario(req, res){
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloUsuario.findOne(consulta)
    .then((usuario) => {
        res.status(200).json({usuario});
    })
    .catch((error) => {
            res.status(404).json({message: 'usuario no encontrado'});
    })
}

function eliminarUsuario(req, res){
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloUsuario.findOneAndDelete(consulta)
    .then((usuario) => {
            res.status(200).json({message: 'usuario eliminado correctamente'});
    })
    .catch((error) => {
            res.status(404).json({message: 'usuario no encontrado'});
    })
}

function modificarUsuario(req, res){
    const consulta = {}
    consulta[req.params.key] = req.params.value;
    modeloUsuario.findOneAndUpdate(consulta, req.body, {new: true})
    .then((usuario) => {
            res.status(200).json({message: 'usuario modificado correctamente'});
    })
    .catch((error) => {
            res.status(404).json({message: 'usuario no encontrado'});
    })
}

module.exports = {
    ObtenerUsuarios,
    consultarUsuario,
    eliminarUsuario,
    modificarUsuario
};