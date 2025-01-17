const eventos = require('../../models').eventos;
const proyectos = require('../../models').proyectos;

eventos.belongsTo(proyectos, { foreignKey: 'id_proyecto' });

// crear evento
function create(req, res) {
    var body = req.body;
    eventos.create(body)
        .then(eventos => {
            res.status(200).send({ eventos });
        })
        .catch(err => {
            res.status(500).send({ message: 'Ocurrio error al guardar la evento', err });
        });
}
// actualizar evento
function update(req, res) {
    var id = req.params.id_evento;
    var body = req.body;
    eventos.findByPk(id)
        .then(evento => {
            evento.update(body)
                .then(() => {
                    res.status(200).send({ evento });
                })
                .catch(err => {
                    res.status(500).send({ message: 'Ocurrio un error al actualizar la evento', err });
                });
        })
        .catch(err => {
            res.status(500).send({ message: 'Ocurrio un error al buscar la evento', err });
        });
}
// funcion para mostrar todos eventos
function getAll(req, res) {
    eventos.findAll({
        // where: { estado: true }
    })
    .then(eventos => {
        res.status(200).send({ eventos });
    })
    .catch(err => {
        res.status(500).send({ message: 'Ocurrio un error al buscar las eventos', err });
    })
}
// funcion para mostrar todos eventos
function getAllByEstado(req, res) {
    var status = req.params.estado;
    eventos.findAll({
        where: { estado: status }
    })
    .then(eventos => {
        res.status(200).send({ eventos });
    })
    .catch(err => {
        res.status(500).send({ message: 'Ocurrio un error al buscar las eventos', err });
    })
}
// funcion para evento por id
function getById(req, res) {
    var id = req.params.id_evento;
    eventos.findByPk(id)
    .then(evento => {
        res.status(200).send({ evento });
    })
    .catch(err => {
        res.status(500).send({ message: 'Ocurrio un error al buscar una evento', err});
    })
}
// funcion para buscar y mostrar un eventos por id_proyecto
function getAllByIdProyecto(req, res) {
    var id = req.params.id_proyecto;
    eventos.findAll({
        where: { id_proyecto: id }
    })
    .then(eventos => {
        res.status(200).send({ eventos });
    })
    .catch(err => {
        res.status(500).send({ message: 'Ocurrio un error al buscar un eventos por id_proyecto', err });
    })
}
// funcion para buscar y mostrar un eventos por id_proyecto
function getAllByIdProyectoAndEstado(req, res) {
    var id = req.params.id_proyecto;
    var status = req.params.estado;
    eventos.findAll({
        where: { id_proyecto: id, estado: status }
    })
    .then(eventos => {
        res.status(200).send({ eventos });
    })
    .catch(err => {
        res.status(500).send({ message: 'Ocurrio un error al buscar un eventos por id_proyecto', err });
    })
}
// funcion para contar eventos por id_proyecto
function countByIdProyecto(req, res) {
    var id = req.params.id_proyecto;
    eventos.count({
        where: { id_proyecto: id }
    })
    .then(contador => {
        res.status(200).send({ contador });
    })
    .catch(err => {
        res.status(500).send({ message: 'Ocurrio un error al buscar un eventos por id_proyecto', err });
    })
}
// funcion para contar eventos por id_proyecto
function countByIdProyectoAndEstado(req, res) {
    var id = req.params.id_proyecto;
    var status = req.params.estado;
    eventos.count({
        where: { id_proyecto: id, estado: status }
    })
    .then(contador => {
        res.status(200).send({ contador });
    })
    .catch(err => {
        res.status(500).send({ message: 'Ocurrio un error al buscar un eventos por id_proyecto', err });
    })
}

module.exports = {
    create,
    update,
    getById,
    getAll,
    getAllByIdProyecto,
    countByIdProyecto,

    getAllByEstado,
    getAllByIdProyectoAndEstado,
    countByIdProyectoAndEstado
}