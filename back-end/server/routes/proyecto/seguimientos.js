const seguimientosController = require('../../controllers').seguimientos;
const md_auth = require('../../authenticated/authenticated');

// configuracion el express
module.exports = (app) => {
    app.post('/api/seguimiento', seguimientosController.create);
    app.put('/api/seguimiento/:id_seguimiento', seguimientosController.update);
    app.get('/api/seguimientos', seguimientosController.getAll);
    app.get('/api/seguimientosByEstado/:estado', seguimientosController.getAllByEstado);
    app.get('/api/seguimientos-proy/:id_proyecto', seguimientosController.getAllByIdProyecto);
    app.get('/api/seguimientos-dir/:id_director', seguimientosController.getAllByIdDirector);
    
    app.get('/api/seguimiento/:id_seguimiento', seguimientosController.getById);
    app.get('/api/countSeguimientosByIdProyecto/:id_proyecto', seguimientosController.countByIdProyecto);

    app.get('/api/seguimientosByIdDirectorAndEstado/:id_director/:estado', seguimientosController.getAllByIdDirectorAndEstado);
    app.get('/api/seguimientosByIdProyectoAndEstado/:id_proyecto/:estado', seguimientosController.getAllByIdProyectoAndEstado);
    app.get('/api/countSeguimientosByIdProyectoAndEstado/:id_proyecto/:estado', seguimientosController.countByIdProyectoAndEstado);

    app.get('/api/seguimientosByIdProyectoAndTipo/:id_proyecto/:tipo', seguimientosController.getAllByIdProyectoAndTipo);
    app.get('/api/seguimientosByIdProyectoTipoAndEstado/:id_proyecto/:tipo/:estado', seguimientosController.getAllByIdProyectoTipoAndEstado);

}