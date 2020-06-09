import { Component, OnInit, ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NgbModal, NgbDatepickerI18n, NgbDateStruct, NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ProyArchivosService } from 'src/app/services/admin/proy-archivos.service';
import { GLOBAL } from 'src/app/services/global';
import { Subscription, Subject } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { ProyectosService } from 'src/app/services/admin/proyectos.service';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { InvestigadoresService } from 'src/app/services/admin/investigadores.service';
import { InvProyectosService } from 'src/app/services/admin/inv-proyectos.service';
import { BasicaTecnicasService } from 'src/app/services/proyecto/basica-tecnicas.service';
import { LugarDesarrollosService } from 'src/app/services/proyecto/lugar-desarrollos.service';
import { CursosService } from 'src/app/services/proyecto/cursos.service';
import { EventosService } from 'src/app/services/proyecto/eventos.service';
import { NotaPrensasService } from 'src/app/services/proyecto/nota-prensas.service';
import { ExposicionesService } from 'src/app/services/proyecto/exposiciones.service';
import { CursoArchivosService } from 'src/app/services/proyecto/curso-archivos.service';
import { EventoArchivosService } from 'src/app/services/proyecto/evento-archivos.service';
import { NotaArchivosService } from 'src/app/services/proyecto/nota-archivos.service';
import { ExpoArchivosService } from 'src/app/services/proyecto/expo-archivos.service';
import { UploadArchivoService } from 'src/app/services/upload/upload-archivo.service';
import { PermisoArchivosService } from 'src/app/services/proyecto/permiso-archivos.service';
import { ConveniosService } from 'src/app/services/proyecto/convenios.service';
import { ConvArchivosService } from 'src/app/services/proyecto/conv-archivos.service';
import { ContratadosService } from 'src/app/services/proyecto/contratados.service';
import { ContraArchivosService } from 'src/app/services/proyecto/contra-archivos.service';
import { Proyecto } from 'src/app/interfaces/proyecto';
import { ExpositoresService } from 'src/app/services/proyecto/expositores.service';
import { UnidadesService } from 'src/app/services/proyecto/unidades.service';
import { ToastrService } from 'ngx-toastr';

// datapicker spanish
const I18N_VALUES = {
  es: {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    format: 'dd-mm-yyyy'
  }
};
@Injectable() export class I18n {
  language = 'es';
}
@Injectable() export class CustomDatepickerI18n extends NgbDatepickerI18n {
  constructor(private _i18n: I18n) {
    super();
  }
  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }
  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }
  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }
  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}

@Component({
  selector: 'app-edit-proyecto',
  templateUrl: './edit-proyecto.component.html',
  styleUrls: ['./edit-proyecto.component.css'],
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }  ]
})
export class EditProyectoComponent implements OnInit, OnDestroy {

  public id: number;

  public token: string;
  public url: string;
  public who: string;
  public proyectos: any[];
  public proyecto: any = {
    investigadore: {
      persona: {}
    }
  };

  // cambios de archivo
  public filesToUpload: Array<File> = [];
  public sidebarVisible = true;
  public tituloFormulario = '';
  public tipoDifusion = 0;

  // difusion
  public difusion: any = {};

  // MANEJO DE ARCHIVOS
  accept = 'pdf'; // *
  files: File[] = [];
  progress: number;
  hasBaseDropZoneOver: boolean = false;
  httpEmitter: Subscription;
  httpEvent: HttpEvent<{}>;
  lastFileAt: Date;

  sendableFormData: FormData; //populated via ngfFormData directive

  dragFiles: any;
  validComboDrag: any;
  lastInvalids: any;
  fileDropDisabled: any;
  maxSize: any;
  baseDropValid: any;

  // manejo de archivos
  public proy_archivos: any[];
  public proy_archivo: any = {};

  public basica_tecnica: any = {
    tipo: '',
    estado: true
  };
  public lugar_desarrollo: any = {
    departamento: '',
    provincia: '',
    estado: true
  };

  public provincias: any = [];
  public departamentos: any = [
    { value: 'BE', depa: 'Beni', capi: 'Trinidad',
      provincias: [
        { provi: 'Cercado', capi: 'San Javier'},
        { provi: 'Antonio Vaca Díez', capi: 'Riberalta'},
        { provi: 'General José Ballivián Segurola', capi: 'Santos Reyes'},
        { provi: 'Yacuma', capi: 'Santa Ana de Yacuma'},
        { provi: 'Moxos', capi: 'San Ignacio de Moxos'},
        { provi: 'Marbán', capi: 'Loreto'},
        { provi: 'Mamoré', capi: 'San Joaquín'},
        { provi: 'Iténez', capi: 'Magdalena'}
      ]
    },
    { value: 'CH', depa: 'Chuquisaca', capi: 'Sucre',
      provincias: [
        { provi: 'Oropeza', capi: 'Sucre'},
        { provi: 'Juana Azurduy de Padilla', capi: 'Azurduy'},
        { provi: 'Jaime Zudáñez', capi: 'Villa Zudáñez'},
        { provi: 'Tomina', capi: 'Padilla'},
        { provi: 'Hernando Siles', capi: 'Monteagudo'},
        { provi: 'Yamparáez', capi: 'Tarabuco'},
        { provi: 'Nor Cinti', capi: 'Camargo'},
        { provi: 'Sud Cinti', capi: 'Camataqui'},
        { provi: 'Belisario Boeto', capi: 'Villa Serrano'},
        { provi: 'Luis Calvo', capi: 'Villa Vaca Guzmán'}
      ]
    },
    { value: 'CB', depa: 'Cochabamba', capi: 'Cochabamba',
      provincias: [
        { provi: 'Arani', capi: 'Arani'},
        { provi: 'Esteban Arce', capi: 'Tarata'},
        { provi: 'Arque', capi: 'Arque'},
        { provi: 'Ayopaya', capi: 'Villa Independencia'},
        { provi: 'Campero', capi: 'Aiquile'},
        { provi: 'Capinota', capi: 'Villa Capinota'},
        { provi: 'Cercado', capi: 'Cochabamba'},
        { provi: 'Carrasco', capi: 'Totora'},
        { provi: 'Chapare', capi: 'Sacaba'},
        { provi: 'Germán Jordán', capi: 'Villa Cliza'},
        { provi: 'Mizque', capi: 'Mizque'},
        { provi: 'Punata', capi: 'Punata'},
        { provi: 'Quillacollo', capi: 'Quillacollo'},
        { provi: 'Tapacarí', capi: 'Tapacarí'},
        { provi: 'Bolívar', capi: 'Bolívar'},
        { provi: 'Tiraque', capi: 'Tiraque'}
      ]
    },
    { value: 'LP', depa: 'La Paz', capi: 'La Paz',
      provincias: [
        { provi: 'Aroma', capi: 'Sica Sica'},
        { provi: 'Bautista Saavedra', capi: 'Charazani'},
        { provi: 'Abel Iturralde', capi: 'Ixiamas'},
        { provi: 'Caranavi', capi: 'Caranavi'},
        { provi: 'Eliodoro Camacho', capi: 'Puerto Acosta'},
        { provi: 'Franz Tamayo', capi: 'Apolo'},
        { provi: 'Gualberto Villaroel', capi: 'San Pedro de Curahuara'},
        { provi: 'Ingavi', capi: 'Viacha'},
        { provi: 'Inquisivi', capi: 'Inquisivi'},
        { provi: 'General José Manuel Pando', capi: 'Santiago de Machaca'},
        { provi: 'Larecaja', capi: 'Sorata'},
        { provi: 'Loayza', capi: 'Luribay'},
        { provi: 'Los Andes', capi: 'Pucarani'},
        { provi: 'Manco Kapac', capi: 'Copacabana'},
        { provi: 'Muñecas', capi: 'Chuma'},
        { provi: 'Nor Yungas', capi: 'Coroico'},
        { provi: 'Omasuyos', capi: 'Achacachi'},
        { provi: 'Pacajes', capi: 'Coro coro'},
        { provi: 'Pedro Domingo Murillo', capi: 'La Paz'},
        { provi: 'Sud Yungas', capi: 'Chulumani'}
      ]
    },
    { value: 'OR', depa: 'Oruro', capi: 'Oruro',
      provincias: [
        { provi: 'Sabaya', capi: 'Sabaya'},
        { provi: 'Carangas', capi: 'Corque'},
        { provi: 'Cercado', capi: 'Oruro'},
        { provi: 'Eduardo Abaroa', capi: 'Challapata'},
        { provi: 'Ladislao Cabrera', capi: 'Salinas de Garcí Mendoza'},
        { provi: 'Litoral', capi: 'Huachacalla'},
        { provi: 'Mejillones', capi: 'La Rivera'},
        { provi: 'Nor Carangas', capi: 'Huayllamarca'},
        { provi: 'Pantaleón Dalence', capi: 'Huanuni'},
        { provi: 'Poopó', capi: 'Poopó'},
        { provi: 'Sajama', capi: 'Curahuara de Carangas'},
        { provi: 'San Pedro de Totora', capi: 'Totora'},
        { provi: 'Saucarí', capi: 'Toledo'},
        { provi: 'Sebastián Pagador', capi: 'Santiago de Huari'},
        { provi: 'Sud Carangas', capi: 'Santiago de Andamarca'},
        { provi: 'Tomas Barrón', capi: 'Eucaliptus'}
      ]
    },
    { value: 'PD', depa: 'Pando', capi: 'Cobija',
      provincias: [
        { provi: 'Abuná', capi: 'Santa Rosa del Abuná'},
        { provi: 'Federico Román', capi: 'Nueva Esperanza'},
        { provi: 'Madre de Dios', capi: 'Puerto Gonzalo Moreno'},
        { provi: 'Manuripi', capi: 'Puerto Rico'},
        { provi: 'Nicolás Suárez', capi: 'Cobija'}
      ]
    },
    { value: 'PT', depa: 'Potosí', capi: 'Potosí',
      provincias: [
        { provi: 'Alonzo de Ibáñez', capi: 'Villa de Sacaca'},
        { provi: 'Antonio Quijarro', capi: 'Uyuni'},
        { provi: 'Bernardino Bilbao', capi: 'Arampampa'},
        { provi: 'Charcas', capi: 'San Pedro de Buena Vista'},
        { provi: 'Chayanta', capi: 'Colquechaca'},
        { provi: 'Cornelio Saavedra', capi: '	Betanzos'},
        { provi: 'Daniel Saavedra', capi: 'Llica'},
        { provi: 'Enrique Baldivieso', capi: 'San Agustín'},
        { provi: 'José María Linares', capi: 'Puna'},
        { provi: 'Modesto Omiste', capi: 'Villazón'},
        { provi: 'Nor Chichas', capi: 'Cotagaita'},
        { provi: 'Nor Lípez', capi: 'Colcha K'},
        { provi: 'Rafael Bustillo', capi: 'Uncía'},
        { provi: 'Sud Chichas', capi: 'Tupiza'},
        { provi: 'Sud Lipez', capi: 'San Pablo de Lipez'},
        { provi: 'Tomás Frías', capi: 'Tinguipaya'}
      ]
    },
    { value: 'SC', depa: 'Santa Cruz', capi: 'Santa Cruz de la Sierra',
      provincias: [
        { provi: 'Andrés Ibáñez', capi: 'Ciudad de Santa Cruz'},
        { provi: 'Ignacio Warnes', capi: 'Warnes'},
        { provi: 'José Miguel de Velasco', capi: 'San Ignacio'},
        { provi: 'Ichilo', capi: 'Buena Vista'},
        { provi: 'Chiquitos', capi: 'San José'},
        { provi: 'Sara', capi: 'Portachuelo'},
        { provi: 'Cordillera', capi: 'Lagunillas'},
        { provi: 'Vallegrande', capi: 'Vallegrande'},
        { provi: 'Florida', capi: 'Samaipata'},
        { provi: 'Santistevan', capi: 'Montero'},
        { provi: 'Ñuflo de Chávez', capi: 'Concepción'},
        { provi: 'Ángel Sandoval', capi: 'San Matías'},
        { provi: 'Caballero', capi: 'Comarapa'},
        { provi: 'Germán Busch', capi: 'Puerto Suárez'},
        { provi: 'Guarayos', capi: 'Ascensión'}
      ]
    },
    { value: 'TJ', depa: 'Tarija', capi: 'Tarija',
      provincias: [
        { provi: 'Aniceto Arce', capi: 'Padcaya'},
        { provi: 'Burdet OConnor', capi: 'Entre Ríos'},
        { provi: 'Cercado', capi: 'Tarija'},
        { provi: 'Eustaquio Méndez', capi: 'San Lorenzo'},
        { provi: 'Gran Chaco', capi: 'Yacuiba'},
        { provi: 'José María Avilés', capi: 'Uriondo'}
      ]
    }
  ];

  // tabs
  public fragment: string = 'tavArchivos';
  private ngUnsubscribe = new Subject();

  // publicacion
  public publicaciones: any = [];
  public publicacion: any = {
    tipo: '',
    estado: true
  };

  public dropdownLista: Array<any> = [];
  public seleccionados: Array<any> = [];
  public dropdownConfiguracion: any;
  public disabled: boolean = false;

  // multi unidades de la UMSA co-ejecutantes
  public unidades: any[] = [{
    nombre: ''
  }];
  // multi expositores
  public expositores: any[] = [{
    nombre: '',
    apellidos: ''
  }];

  // multiples archivos
  datosArchivo: any = [];
  public antFileTam = 0;

  // investigadores del proyecto
  public investigadores: Array<any>= [];
  
  // listado
  public basica_tecnicas: any[];
  public lugar_desarrollos: any[];
  public difusiones: any[];
  public listado_difusion: string;

    // manejo de archivos
  public archivos: any[];
  public archivo: any = {};

  // search archivos
  search = new FormControl('');
  public valorBusqueda = '';
  // search difusiones
  searchDifusion = new FormControl('');
  public valorBusquedaDifusion = '';

  // tipo archivo: para editar
  private tipoArch = 0;
  // tipo titulo archivos
  public tituloArch = 'Documentos principales';

  // archivos para difusion
  public archivosDifusion: any[] = [];

  // fechas
  public fechainicio: any = {};
  public fechafinal: any = {};

  constructor(
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router,
    private _auth: AuthService,
    private modalService: NgbModal,
    private _serviceProyArch: ProyArchivosService,
    private _serviceProyecto: ProyectosService,
    private _serviceInvestigadores: InvestigadoresService,
    private _serviceInvProyectos: InvProyectosService,
    public calendar: NgbCalendar,
    private _serviceBasicaTecnicas: BasicaTecnicasService,
    private _serviceLugarDesarrollos: LugarDesarrollosService,
    private _serviceCursos: CursosService,
    private _serviceEventos: EventosService,
    private _serviceNotaPrensas: NotaPrensasService,
    private _serviceExposiciones: ExposicionesService,
    private _serviceCursoArchivos: CursoArchivosService,
    private _serviceEventoArchivos: EventoArchivosService,
    private _serviceNotaArchivos: NotaArchivosService,
    private _serviceExpoArchivos: ExpoArchivosService,
    private _uploadArchivo: UploadArchivoService,
    private _servicePermisoArchivos: PermisoArchivosService,
    private _serviceConvenios: ConveniosService,
    private _serviceConvArchivos: ConvArchivosService,
    private _serviceContratados: ContratadosService,
    private _serviceContraArchivos: ContraArchivosService,
    private _serviceExpositores: ExpositoresService,
    private _serviceUnidades: UnidadesService,
    private toastr: ToastrService
  ) { 
    this.token = this._auth.getToken();
    this.url = GLOBAL.url;
    this.who = GLOBAL.who;

    // tab
    this._route.fragment
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((fragment: string) => {
        if (fragment) {
          this.fragment = fragment;
        }
      });
      // autores
    this.dropdownConfiguracion = {
        singleSelection: false,
        idField: 'id_investigador',
        textField: 'nombreCompleto',
        selectAllText: 'Seleccionar Todos',
        unSelectAllText: 'Deselecciona todo',
        searchPlaceholderText: 'Buscar',
        itemsShowLimit: 3,
        allowSearchFilter: true,
        limitSelection: 5,
        maxHeight: 70
      };
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {
      this.id = params.id;
    });
    this.getProArchivosByIdProyecto(this.id);
    this.getArchivosByTipo(0);
    this.getProyecto(this.id);
    // buscador archivos
    this.search.valueChanges.pipe( debounceTime(300) ).subscribe(value => this.valorBusqueda = value );
    // buscador difusiones
    this.searchDifusion.valueChanges.pipe( debounceTime(300) ).subscribe(value => this.valorBusquedaDifusion = value );
    this.getInvestigadoresByProyecto(); // investigadores del proyecto

    this.obtenerBasicaTecnicas();
    this.obtenerLugarDesarrollos();
    this.obtenerDifusion(1);
    this.listado_difusion = 'Cursos, Seminarios y Talleres';

  }
  getInvestigadoresByProyecto() {
    this._serviceProyecto.getProyecto(this.id, this.token)
    .then( response => {
      // console.log(response.proyecto.investigadore.persona);
      this.investigadores.push(response.proyecto.investigadore);
      this.dropdownLista.push(
        {
          id_investigador: response.proyecto.investigadore.id_investigador,
          nombreCompleto: response.proyecto.investigadore.persona.nombres + ' ' +
          response.proyecto.investigadore.persona.paterno + ' ' + response.proyecto.investigadore.persona.materno
        }
      );
    }).catch(error => { console.log('error al obtener el proyecto by id_proyecto', error); });
    this._serviceInvProyectos.getInv_proyectosByIdProyecto(this.id, this.token)
    .then(response => {
      // console.log(response.inv_proyectos);
      response.inv_proyectos.forEach( inv_proyecto => {
        // console.log(inv_proyecto.investigadore.persona);
        this.investigadores.push(inv_proyecto.investigadore);
        this.dropdownLista.push(
          {
            id_investigador: inv_proyecto.investigadore.id_investigador,
            nombreCompleto: inv_proyecto.investigadore.persona.nombres + ' ' +
            inv_proyecto.investigadore.persona.paterno + ' ' + inv_proyecto.investigadore.persona.materno
          }
        );
      });
    })
    .catch(error => { console.log('error al obtener inv_proyectos by id_proyecto', error); });
    console.log(this.investigadores);
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  getProyecto(id: number) {
    this._serviceProyecto.getProyecto(id, this.token)
    .then(responseProyecto => {
      this.proyecto = responseProyecto.proyecto;
      // console.log(this.proyecto);
      this._serviceInvProyectos.getInv_proyectosByIdProyecto(this.proyecto.id_proyecto, this.token)
      .then(responseInvProy => {
        // console.log(responseInvProy.inv_proyectos);
        this.proyecto.investigadores = responseInvProy.inv_proyectos;
        // console.log(this.proyecto);
      }).catch(error => { console.log('Error al obtener Inv Proyecto by Id Proyecto', error); });
    }).catch(error => { console.log('error al obtener proyecto', error); });
  }
  getProArchivosByIdProyecto(id: number) {
    this._serviceProyArch.getProy_archivosByIdProyecto(id, this.token)
    .then(responseProyArch => {
      this.proy_archivos = responseProyArch.proy_archivos;
    })
    .catch(error => { console.log('error al obtener proy_archivos', error); });
  }
  // Funcion para obtener los archivos de principales, permisos, convenios, contratos, proyecto final, otros
  getArchivosByTipo(tipo: number){
    this.archivos = [];
    // this.tipoArch = tipo;
    switch (tipo) {
      case 0:
        this.tituloArch = 'Documentos - Principales';
        this._serviceProyArch.getProy_archivosByIdTipo(this.id, 1, this.token)
        .then(responseProyArch => {
          this.archivos = responseProyArch.proy_archivos;
        }).catch(error => { console.log('error al obtener proy_archivos', error); });
        break;
      case 1:
        this.tituloArch = 'Documentos - Permisos';
        this._servicePermisoArchivos.getPermisoArchivosByIdProyecto(this.id, this.token)
        .then(responsePermisoArch => {
          this.archivos = responsePermisoArch.permiso_archivos;
        }).catch(error => { console.log('error al obtener permiso archivos', error); });
        break;
      case 2:
        this.tituloArch = 'Documentos - Suscripcion convenios';
        this._serviceConvenios.getConveniosByIdProyecto(this.id, this.token)
        .then(responseConv => {
          responseConv.convenios.forEach(convenio => {
            var convArch = {
              id_convenio: convenio.id_convenio,
              archivo:  convenio.archivo,
              nombre: convenio.nombre_archivo,
              descripcion: convenio.descripcion_archivo,
              id_tipo: convenio.id_tipo,
              createdAt: convenio.createdAt,
              convArchivos: Array,
              estado: convenio.estado
            };
            this._serviceConvArchivos.getConvArchivosByIdConvenio(convenio.id_convenio, this.token)
            .then(responseConvArch => {
              convArch.convArchivos = responseConvArch.conv_archivos;
              this.archivos.push(convArch);
            }).catch(error => { console.log('error al obtener convenio archivos', error); });
          });
          console.log(this.archivos);
        }).catch(error => { console.log('error al obtener convenios', error); });
        break;
      case 3:
        this.tituloArch = 'Documentos - Personal contratado';
        this._serviceContratados.getContratadosByIdProyecto(this.id, this.token)
        .then(responseContra => {
          responseContra.contratados.forEach(contratado => {
            var contraArch = {
              id_contratado: contratado.id_contratado,
              archivo:  contratado.archivo,
              nombre: contratado.nombre_archivo,
              descripcion: contratado.descripcion_archivo,
              id_tipo: contratado.id_tipo,
              createdAt: contratado.createdAt,
              convArchivos: Array,
              estado: contratado.estado
            };
            this._serviceContraArchivos.getContraArchivosByIdContratado(contratado.id_contratado, this.token)
            .then(responseContraArch => {
              contraArch.convArchivos = responseContraArch.contra_archivos;
              this.archivos.push(contraArch);
            }).catch(error => { console.log('error al obtener contratado archivo por id contratado', error); });
          });
          // console.log(this.archivos);
        }).catch(error => { console.log('error al obtener contratados', error); });
        break;
      case 6:
        this.tituloArch = 'Documentos - Proyecto final';
        // console.log(this.tipoArch);
        this._serviceProyArch.getProy_archivosByIdTipo(this.id, 6, this.token)
        .then(responseProyArch => {
          this.archivos = responseProyArch.proy_archivos;
          // console.log(responseProyArch);
        }).catch(error => { console.log('error al obtener proy_archivos', error); });
        break;
      case 7:
        this.tituloArch = 'Documentos -  Otros';
        this._serviceProyArch.getProy_archivosByIdTipo(this.id, 7, this.token)
        .then(responseProyArch => {
          this.archivos = responseProyArch.proy_archivos;
          // console.log(responseProyArch);
        }).catch(error => { console.log('error al obtener proy_archivos', error); });
        break;
      default:
        break;
    }
  }

  openArchivo(pdf: string) {
    window.open(this.who + pdf, '_blank');
  }
  openModalArchivosDifusion(content, size) {
    this.modalService.open(content, { size: size });
  }

  openModalBaseTecnica(content, size, id?) {
    this.modalService.open(content, { size: size });
    this.unidades = [{
      nombre: ''
    }];
    this.basica_tecnica = {
      tipo: '',
      estado: true
    };
    if (id) {
      console.log('actualizar', id);
    }
  }
  openModalLugarDesarrollo(content, size, id?) {
    this.modalService.open(content, { size: size });
    this.lugar_desarrollo = {
      departamento: '',
      provincia: '',
      estado: true
    };
    this.provincias.length = 0;
    if (id) {
      console.log('actualizar', id);
    }
  }
  openModalDifusion(content, size, num, difu?) {
    this.difusion = {};
    this.expositores = [{
      nombres: ''
    }];
    this.files.length = 0;
    this.datosArchivo.length = 0;
    this.antFileTam = 0;

    this.modalService.open(content, { size: size });

    if (difu) {
      console.log('actualizar', difu);
    }

    switch (num) {
      case 1:
        this.tituloFormulario = 'Cursos, Seminarios y Talleres';
        this.tipoDifusion = 1;
        break;
      case 2:
        this.tituloFormulario = 'Eventos cientificos';
        this.tipoDifusion = 2;
        break;
      case 3:
        this.tituloFormulario = 'Notas de prensa';
        this.tipoDifusion = 3;
        break;
      case 4:
        this.tituloFormulario = 'Exposiciones y conferencias';
        this.tipoDifusion = 4;
        break;
      default:
        console.log('error al navegar');
        this.tipoDifusion = 0;
        break;
    }
  }
  openModalNuevaPublicacion(content, size, id?) {
    this.modalService.open(content, { size: size });
    this.datosArchivo.length = 0;
    this.antFileTam = 0;
    this.seleccionados.length = 0;
    this.files.length = 0;
    this.publicacion = {
      tipo: ''
    };
    if (id) {
      console.log('actualizar');
    }

  }

  guardarBasicaTecnica() {
    console.log(this.basica_tecnica);
    this.basica_tecnica.id_proyecto = this.id;
    console.log('unidades', this.unidades);
    this._serviceBasicaTecnicas.save(this.basica_tecnica, this.token)
    .then(response => {
      console.log(response.basica_tecnicas);
      this.obtenerBasicaTecnicas();
      this.toastr.success('Basica tecnica guardado', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
      this.unidades.forEach(unidad => {
        unidad.id_basica_tecnica = response.basica_tecnicas.id_basica_tecnica;
        this._serviceUnidades.save(unidad, this.token)
        .then(responseUnidad => {
          console.log(responseUnidad);
        }).catch(error => { console.log('Error al guardar la unidad ', error); });
      });
    }).catch(error => { 
      console.log('error al crear el pryArchivo', error);
      this.toastr.error('Error al guardar Basica tecnica', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
    this.modalService.dismissAll();
  }
  guardarLugarDesarrollo() {
    this.lugar_desarrollo.id_proyecto = this.id;
    this.lugar_desarrollo.latmax = parseFloat(this.lugar_desarrollo.latmax);
    this.lugar_desarrollo.lonmax = parseFloat(this.lugar_desarrollo.lonmax);
    this.lugar_desarrollo.latmin = parseFloat(this.lugar_desarrollo.latmin);
    this.lugar_desarrollo.lonmin = parseFloat(this.lugar_desarrollo.lonmin);
    console.log(this.lugar_desarrollo);
    this._serviceLugarDesarrollos.save(this.lugar_desarrollo, this.token)
    .then(response => {
      console.log(response);
      this.obtenerLugarDesarrollos();
      this.toastr.success('Lugar de desarrollo guardado', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }).catch(error => { 
      console.log('error al crear lugar de desarrollo', error);
      this.toastr.error('Error al guardar Lugar de Desarrollo ', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
    this.modalService.dismissAll();
  }
  guardarDifusion() {
    this.difusion.id_proyecto = this.id;
    console.log(this.difusion);
    console.log(this.files);
    console.log(this.datosArchivo);

    switch (this.tipoDifusion) {
      case 1:
        // cursos
        this.difusion.fechaini = this.formatDate(this.fechainicio) + 'T00:00:00.000';
        this.difusion.fechafin = this.formatDate(this.fechafinal) + 'T00:00:00.000';
        this._serviceCursos.save(this.difusion, this.token)
        .then(response => {
          // console.log(response.cursos);
          this.obtenerDifusion(1);
          this.toastr.success('Curso, Seminario o Taller guardado', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
          // guardar expositores
          if (this.expositores) {
            this.expositores.forEach(expositor => {
              expositor.id_curso = response.cursos.id_curso;
              console.log(expositor);
              this._serviceExpositores.save(expositor, this.token)
              .then(responseExposi => { 
                // console.log(responseExposi);
                this.obtenerDifusion(1);
              })
              .catch(error => { console.log('Error al guardar expositor', error); });
            });
          }
          // guardar archivos
          if (this.files) {
            for (let i = 0; i < this.files.length; i++) {
              const file = this.files[i];
              var curso_archivo = {
                id_curso: response.cursos.id_curso,
                archivo: '',
                nombre: this.datosArchivo[i].nombre,
                descripcion: this.datosArchivo[i].descripcion,
                id_tipo: '7'
              };
              console.log(curso_archivo);
              this._serviceCursoArchivos.save(curso_archivo, this.token)
              .then(responseArchivo => {
                console.log(responseArchivo);
                // tslint:disable-next-line:max-line-length
                this._uploadArchivo.uploadArchivo(this.url + 'upload-curso-archivo/' + responseArchivo.curso_archivos.id_curso_archivo, this.files[i], this.token)
                .then(responseFile => {
                  // console.log(responseFile);
                  this.obtenerDifusion(1);
                }).catch(error => { console.log('error al subir el archivo', error); });
              })
              .catch(error => { console.log('error al crear curso archivo', error); });
            }
          }
        }).catch(error => { 
          console.log('error al crear difusion curso', error);
          this.toastr.error('Error al guardar archivo ', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
        });
        this.modalService.dismissAll();
        break;
      case 2:
        // evento
        this.difusion.fechaini = this.formatDate(this.fechainicio) + 'T00:00:00.000';
        this.difusion.fechafin = this.formatDate(this.fechafinal) + 'T00:00:00.000';
        console.log(this.difusion);
        this._serviceEventos.save(this.difusion, this.token)
        .then(response => {
          console.log(response.eventos);
          if (this.files) {
            for (let i = 0; i < this.files.length; i++) {
              var evento_archivo = {
                id_evento: response.eventos.id_evento,
                archivo: '',
                nombre: this.datosArchivo[i].nombre,
                descripcion: this.datosArchivo[i].descripcion,
                id_tipo: '7'
              };
              console.log(evento_archivo);
              this._serviceEventoArchivos.save(evento_archivo, this.token)
              .then(responseArchivo => {
                console.log(responseArchivo);
                // tslint:disable-next-line:max-line-length
                this._uploadArchivo.uploadArchivo(this.url + 'upload-evento-archivo/' + responseArchivo.evento_archivos.id_evento_archivo, this.files[i], this.token)
                .then(responseFile => {
                  console.log(responseFile);
                }).catch(error => { console.log('error al subir el archivo', error); });
              }).catch(error => { console.log('error al crear evento archivo', error); });
            }
          }
        }).catch(error => { console.log('error al crear evento', error); });
        this.modalService.dismissAll();
        break;
      case 3:
        // nota_prensas
        this.difusion.fecha = this.formatDate(this.difusion.fecha) + 'T00:00:00.000';
        console.log(this.difusion);
        this._serviceNotaPrensas.save(this.difusion, this.token)
        .then(response => {
          console.log(response.nota_archivos);
          if (this.files) {
            for (let i = 0; i < this.files.length; i++) {
              var nota_archivo = {
                id_nota_prensa: response.nota_prensas.id_nota_prensa,
                archivo: '',
                nombre: this.datosArchivo[i].nombre,
                descripcion: this.datosArchivo[i].descripcion,
                id_tipo: '7'
              };
              console.log(nota_archivo);
              this._serviceNotaArchivos.save(nota_archivo, this.token)
              .then(responseArchivo => {
                console.log(responseArchivo);
                // tslint:disable-next-line:max-line-length
                this._uploadArchivo.uploadArchivo(this.url + 'upload-nota-archivo/' + responseArchivo.nota_archivos.id_nota_archivo, this.files[i], this.token)
                .then(responseFile => {
                  console.log(responseFile);
                }).catch(error => { console.log('error al subir el archivo', error); });
              }).catch(error => { console.log('error al crear nota archivo', error); });
            }
          }
        }).catch(error => { console.log('error al crear nota de presa', error); });
        this.modalService.dismissAll();
        break;
      case 4:
        // exposiciones
        this.difusion.fechaini = this.formatDate(this.fechainicio) + 'T00:00:00.000';
        this.difusion.fechafin = this.formatDate(this.fechafinal) + 'T00:00:00.000';
        console.log(this.difusion);
        this._serviceExposiciones.save(this.difusion, this.token)
        .then(response => {
          console.log(response.exposiciones);
          if (this.files) {
            for (let i = 0; i < this.files.length; i++) {
              var expo_archivo = {
                id_exposicion: response.exposiciones.id_exposicion,
                archivo: '',
                nombre: this.datosArchivo[i].nombre,
                descripcion: this.datosArchivo[i].descripcion,
                id_tipo: '7'
              };
              console.log(expo_archivo);
              this._serviceExpoArchivos.save(expo_archivo, this.token)
              .then(responseArchivo => {
                console.log(responseArchivo);
                // tslint:disable-next-line:max-line-length
                this._uploadArchivo.uploadArchivo(this.url + 'upload-expo-archivo/' + responseArchivo.expo_archivos.id_expo_archivo, this.files[i], this.token)
                .then(responseFile => {
                  console.log(responseFile);
                }).catch(error => { console.log('error al subir el archivo', error); });
              }).catch(error => { console.log('error al crear expo archivo', error); });
            }
          }
        }).catch(error => { console.log('error al crear exposicion', error); });
        this.modalService.dismissAll();
        break;
      default:
        console.log('error');
        break;
    }
  }
  guardarPublicacion() {
    console.log(this.publicacion);
    console.log(this.files);
    console.log(this.datosArchivo);
    console.log(this.seleccionados);
  }
  borrarTodoDifusion() {
    this.difusion = {};
    this.unidades = [{
      nombre: ''
    }];
    this.files.length = 0;
    this.datosArchivo.length = 0;
    this.antFileTam = 0;
  }
  borrarTodoPublicacion() {
    this.files.length = 0;
    this.datosArchivo.length = 0;
    this.antFileTam = 0;
    this.seleccionados.length = 0;
    this.publicacion = {
      tipo: ''
    };
  }
  onEvent() {
    console.log('click');
  }
  obtenerProvincias() {
    this.departamentos.forEach(departamento => {
      if (departamento.value === this.lugar_desarrollo.departamento) {
        this.provincias = departamento.provincias;
      }
    });
  }

  obtenerNombreArchivo(cadena: string) {
    var final = '';
    for (let i = 0; i < cadena.length - 3; i++) {
      var cad = cadena.substring(i, i + 4);
      if (cad === '.pdf') {
        return final;
      } else {
        final = final + cadena.substring(i, i + 1);
      }
    }
  }
  toggleFullWidth() {
    this.sidebarService.toggle();
    this.sidebarVisible = this.sidebarService.getStatus();
    this.cdr.detectChanges();
  }
  cancel() {
    this.progress = 0;
    if (this.httpEmitter) {
      console.log('Cancelado');
      this.httpEmitter.unsubscribe();
    }
  }
  public setName(files: any) {
    // console.log(files);
    for (let index = this.antFileTam; index < files.length; index++) {
      const file = files[index];
      this.datosArchivo.push({ nombre: this.obtenerNombreArchivo(file.name) });
    }
    this.antFileTam = files.length;
    // console.log(this.datosArchivo);
  }
  public deleteName(pos: number) {
    this.datosArchivo.splice(pos, 1);
  }
  getDate() {
    return new Date();
  }
  vaciar() {

  }
  formatDate(d: NgbDate): string {
    if (d === null) {
      return null;
    }
    return [
      d.year,
      (d.month < 10 ? ('0' + d.month) : d.month),
      (d.day < 10 ? ('0' + d.day) : d.day)
    ].join('-');
  }

  obtenerBasicaTecnicas() {
    this.basica_tecnicas = [];
    this._serviceBasicaTecnicas.getBasicaTecnicasByIdProyecto(this.id, this.token)
    .then(response => {
      console.log(response);
      // this.basica_tecnicas = response.basica_tecnicas;
      response.basica_tecnicas.forEach(basica_tecnica => {
        basica_tecnica.unidades = [];
        this._serviceUnidades.getUnidadesByIdBasicaTecnica(basica_tecnica.id_basica_tecnica, this.token)
        .then(responseBT => {
          basica_tecnica.unidades = responseBT.unidades;
          this.basica_tecnicas.push(basica_tecnica);
        }).catch(error => { console.log('Error obtener unidad', error); });
      });
      console.log(this.basica_tecnicas);
    }).catch(error => { console.log('error al obtener Basica tecnicas', error); });
  }
  obtenerLugarDesarrollos() {
    this._serviceLugarDesarrollos.getLugarDesarrollosByIdProyecto(this.id, this.token)
    .then(response => {
      console.log(response);
      this.lugar_desarrollos = response.lugar_desarrollos;
    }).catch(error => { console.log('error al obtener Lugar de desarrollos', error); });
  }
  obtenerDifusion(numero: number) {
    this.difusiones = [];
    switch (numero) {
      case 1:
        this.listado_difusion = 'Cursos, Seminarios y Talleres';
        this._serviceCursos.getCursosByIdProyecto(this.id, this.token)
        .then(response => {
          // this.difusiones = response.cursos;
          console.log(response.cursos);
          response.cursos.forEach(difusion => {
            var difu = difusion;
            // obtener cursos_archivos
            this._serviceCursoArchivos.getCursoArchivosByIdCurso(difusion.id_curso, this.token)
            .then(responseArch => {
              difu.archivos = responseArch.curso_archivos;
              this.difusiones.push(difu);
            }).catch(error => { console.log('Error al obtener Curso Archivos', error); });
          });
        }).catch(error => { console.log('error al obtener cursos', error); });
        break;
      case 2:
        this.listado_difusion = 'Eventos cientificos';
        this._serviceEventos.getEventosByIdProyecto(this.id, this.token)
        .then(response => {
          response.eventos.forEach(difusion => {
            // obtener evento_archivos
            var difu = difusion;
            this._serviceEventoArchivos.getEventoArchivosByIdEvento(difusion.id_evento, this.token)
            .then(responseArch => {
              difu.archivos = responseArch.evento_archivos;
              this.difusiones.push(difu);
            }).catch(error => { console.log('Error al obtener Evento Archivos', error); });
          });
        }).catch(error => { console.log('error al obtener eventos', error); });
        break;
      case 3:
        this.listado_difusion = 'Notas de prensa';
        this._serviceNotaPrensas.getNotaPrensasByIdProyecto(this.id, this.token)
        .then(response => {
          response.nota_prensas.forEach(difusion => {
            var difu = difusion;
            // obtener nota_archivos
            this._serviceNotaArchivos.getNotaArchivosByIdNotaPrensa(difusion.id_nota_prensa, this.token)
            .then(responseArch => {
              difu.archivos = responseArch.nota_archivos;
              this.difusiones.push(difu);
            }).catch(error => { console.log('Error al obtener Nota de presa Archivos', error); });
          });
        }).catch(error => { console.log('error al obtener nota prensas', error); });
        break;
      case 4:
        this.listado_difusion = 'Exposiciones y conferencias';
        this._serviceExposiciones.getExposicionesByIdProyecto(this.id, this.token)
        .then(response => {
          // this.difusiones.fecha = '';
          response.exposiciones.forEach(difusion => {
            var difu = difusion;
            // obtener expo_archivos
            this._serviceExpoArchivos.getExpoArchivosByIdExposicion(difusion.id_exposicion, this.token)
            .then(responseArch => {
              difu.archivos = responseArch.expo_archivos;
              this.difusiones.push(difu);
            }).catch(error => { console.log('Error al obtener Exposicion Archivos', error); });
          });
        }).catch(error => { console.log('error al obtener exposiciones', error); });
        break;
      default:
        console.log('no se obtuvo difusiones');
        break;
    }
  }
  cargarDataConvenio(numero: number) {

  }

  fileChange(files: any) {
    this.lastFileAt = this.getDate();
    this.setName(files);
  }

  addUnidad() {
    this.unidades.push({
      nombre: ''
    });
  }
  removeUnidad(i: number) {
    this.unidades.splice(i, 1);
  }
  addExpositor() {
    this.expositores.push({
      nombres: '',
      apellidos: ''
    });
  }
  removeExpositor(i: number) {
    this.expositores.splice(i, 1);
  }

}
