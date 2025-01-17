const expo_archivosController = require('../../controllers').expo_archivos;  
const md_auth = require('../../authenticated/authenticated');
const cm = require('connect-multiparty');
const md_upload = cm({ uploadDir: './server/uploads/archivos/exposiciones' });

// configuracion el express
module.exports = (app) => {
    app.post('/api/expo_archivo', expo_archivosController.create);
    app.put('/api/expo_archivo/:id_expo_archivo', expo_archivosController.update);
    app.get('/api/expo_archivos', expo_archivosController.getAll);
    app.get('/api/expo_archivos/:id_exposicion', expo_archivosController.getAllByIdExposicion);

    app.post('/api/upload-expo-archivo/:id_expo_archivo', md_upload, expo_archivosController.uploadArchivo);
    app.get('/exposiciones/:archivo', expo_archivosController.getArchivo);
    app.get('/api/expo_archivo/:id_expo_archivo', expo_archivosController.getById);
    app.get('/api/countExpoArchivosByIdExposicion/:id_exposicion', expo_archivosController.countByIdExposicion);

    app.get('/api/expo_archivosByEstado/:estado', expo_archivosController.getAllByEstado);
    app.get('/api/expo_archivosByIdExposicionAndEstado/:id_exposicion/:estado', expo_archivosController.getAllByIdExposicionAndEstado);
    app.get('/api/countExpoArchivosByIdExposicionAndEstado/:id_exposicion/:estado', expo_archivosController.countByIdExposicionAndEstado);

}