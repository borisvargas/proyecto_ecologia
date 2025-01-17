const comentariosController = require('../../controllers').comentarios;  
const md_auth = require('../../authenticated/authenticated');


// configuracion el express
module.exports = (app) => {
    app.post('/api/comentario', comentariosController.create);
    app.put('/api/comentario/:id_comentario', comentariosController.update);
    app.get('/api/comentarios', comentariosController.getAll);
    app.get('/api/comentarios-publi/:id_publicacion', comentariosController.getAllByIdPublicacion);

    app.get('/api/comentario/:id_comentario', comentariosController.getById);
    app.get('/api/countComentariosByIdPublicacion/:id_publicacion', comentariosController.countByIdPublicacion);

    app.get('/api/comentariosByEstado/:estado', comentariosController.getAllByEstado);
    app.get('/api/comentariosByIdPublicacionAndEstado/:id_publicacion/:estado', comentariosController.getAllByIdPublicacionAndEstado);
    app.get('/api/countComentariosByIdPublicacionAndEstado/:id_publicacion/:estado', comentariosController.countByIdPublicacionAndEstado);
}