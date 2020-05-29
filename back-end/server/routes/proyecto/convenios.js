const conveniosController = require('../../controllers').convenios;  
const md_auth = require('../../authenticated/authenticated');
const cm = require('connect-multiparty');
const md_upload = cm({ uploadDir: './server/uploads/archivos' }); // '../../../server/uploads/archivos'

// configuracion el express
module.exports = (app) => {
    app.post('/api/convenio', conveniosController.create);
    app.put('/api/convenio/:id_convenio', conveniosController.update);
    app.get('/api/convenios', conveniosController.getAll);
    app.get('/api/convenios/:id_proyecto', conveniosController.getAllByIdProyecto);

    app.post('/api/upload-convenio/:id_convenio', md_upload, conveniosController.uploadArchivo);
    app.get('/api/get-archivo/:archivo', conveniosController.getArchivo);
    app.get('/:archivo', conveniosController.getArchivo);
    app.get('/api/convenio/:id_convenio', conveniosController.getById);
}