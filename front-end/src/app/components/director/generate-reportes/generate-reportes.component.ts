import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Injectable,
} from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { CdkTableExporterModule } from 'cdk-table-exporter';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {
  NgbModal,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbDate,
} from '@ng-bootstrap/ng-bootstrap';

// imprimir
import * as printJS from 'print-js';
import { ProyectosService } from 'src/app/services/admin/proyectos.service';
import { PublicacionesService } from 'src/app/services/proyecto/publicaciones.service';
import { PubliArchivosService } from 'src/app/services/proyecto/publi-archivos.service';
import { ProyArchivosService } from 'src/app/services/admin/proy-archivos.service';
import { InvestigadoresService } from 'src/app/services/admin/investigadores.service';
import { LugarDesarrollosService } from 'src/app/services/proyecto/lugar-desarrollos.service';
import { CursosService } from 'src/app/services/proyecto/cursos.service';
import { EventosService } from 'src/app/services/proyecto/eventos.service';
import { NotaPrensasService } from 'src/app/services/proyecto/nota-prensas.service';
import { ExposicionesService } from 'src/app/services/proyecto/exposiciones.service';
import { ExpoArchivosService } from 'src/app/services/proyecto/expo-archivos.service';
import { NotaArchivosService } from 'src/app/services/proyecto/nota-archivos.service';
import { EventoArchivosService } from 'src/app/services/proyecto/evento-archivos.service';
import { CursoArchivosService } from 'src/app/services/proyecto/curso-archivos.service';
import { PermisoArchivosService } from 'src/app/services/proyecto/permiso-archivos.service';
import { ConveniosService } from 'src/app/services/proyecto/convenios.service';
import { ConvArchivosService } from 'src/app/services/proyecto/conv-archivos.service';
import { ContratadosService } from 'src/app/services/proyecto/contratados.service';
import { ContraArchivosService } from 'src/app/services/proyecto/contra-archivos.service';
import { UnidadesService } from 'src/app/services/proyecto/unidades.service';
import { ExpositoresService } from 'src/app/services/proyecto/expositores.service';
import { GLOBAL } from 'src/app/services/global';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { InvProyectosService } from 'src/app/services/admin/inv-proyectos.service';
import { FinanciamientosService } from 'src/app/services/proyecto/financiamientos.service';

// datapicker spanish
const I18N_VALUES = {
  es: {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    months: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ],
    format: 'dd-mm-yyyy',
  },
};
@Injectable()
export class I18n {
  language = 'es';
}
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
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
  selector: 'app-generate-reportes',
  templateUrl: './generate-reportes.component.html',
  styleUrls: ['./generate-reportes.component.css'],
  providers: [
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
  ],
})
export class GenerateReportesComponent
  implements OnInit, CdkTableExporterModule {
  public sidebarVisible: boolean = true;

  title = 'angularmat';

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [];
  dataSource: MatTableDataSource<any>;

  //var init declaration
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5];

  // filtros
  public token: string;
  public proyectos: Array<any> = [];
  public url: string;
  public proyecto: any = {};

  // realizar filtros
  public filtro: any = {};

  // buscar por lugar
  public provincias: any = [];
  public departamentos: any = [
    {
      value: 'BE',
      depa: 'Beni',
      capi: 'Trinidad',
      provincias: [
        { provi: 'Cercado', capi: 'San Javier' },
        { provi: 'Antonio Vaca Díez', capi: 'Riberalta' },
        { provi: 'General José Ballivián Segurola', capi: 'Santos Reyes' },
        { provi: 'Yacuma', capi: 'Santa Ana de Yacuma' },
        { provi: 'Moxos', capi: 'San Ignacio de Moxos' },
        { provi: 'Marbán', capi: 'Loreto' },
        { provi: 'Mamoré', capi: 'San Joaquín' },
        { provi: 'Iténez', capi: 'Magdalena' },
      ],
    },
    {
      value: 'CH',
      depa: 'Chuquisaca',
      capi: 'Sucre',
      provincias: [
        { provi: 'Oropeza', capi: 'Sucre' },
        { provi: 'Juana Azurduy de Padilla', capi: 'Azurduy' },
        { provi: 'Jaime Zudáñez', capi: 'Villa Zudáñez' },
        { provi: 'Tomina', capi: 'Padilla' },
        { provi: 'Hernando Siles', capi: 'Monteagudo' },
        { provi: 'Yamparáez', capi: 'Tarabuco' },
        { provi: 'Nor Cinti', capi: 'Camargo' },
        { provi: 'Sud Cinti', capi: 'Camataqui' },
        { provi: 'Belisario Boeto', capi: 'Villa Serrano' },
        { provi: 'Luis Calvo', capi: 'Villa Vaca Guzmán' },
      ],
    },
    {
      value: 'CB',
      depa: 'Cochabamba',
      capi: 'Cochabamba',
      provincias: [
        { provi: 'Arani', capi: 'Arani' },
        { provi: 'Esteban Arce', capi: 'Tarata' },
        { provi: 'Arque', capi: 'Arque' },
        { provi: 'Ayopaya', capi: 'Villa Independencia' },
        { provi: 'Campero', capi: 'Aiquile' },
        { provi: 'Capinota', capi: 'Villa Capinota' },
        { provi: 'Cercado', capi: 'Cochabamba' },
        { provi: 'Carrasco', capi: 'Totora' },
        { provi: 'Chapare', capi: 'Sacaba' },
        { provi: 'Germán Jordán', capi: 'Villa Cliza' },
        { provi: 'Mizque', capi: 'Mizque' },
        { provi: 'Punata', capi: 'Punata' },
        { provi: 'Quillacollo', capi: 'Quillacollo' },
        { provi: 'Tapacarí', capi: 'Tapacarí' },
        { provi: 'Bolívar', capi: 'Bolívar' },
        { provi: 'Tiraque', capi: 'Tiraque' },
      ],
    },
    {
      value: 'LP',
      depa: 'La Paz',
      capi: 'La Paz',
      provincias: [
        { provi: 'Aroma', capi: 'Sica Sica' },
        { provi: 'Bautista Saavedra', capi: 'Charazani' },
        { provi: 'Abel Iturralde', capi: 'Ixiamas' },
        { provi: 'Caranavi', capi: 'Caranavi' },
        { provi: 'Eliodoro Camacho', capi: 'Puerto Acosta' },
        { provi: 'Franz Tamayo', capi: 'Apolo' },
        { provi: 'Gualberto Villaroel', capi: 'San Pedro de Curahuara' },
        { provi: 'Ingavi', capi: 'Viacha' },
        { provi: 'Inquisivi', capi: 'Inquisivi' },
        { provi: 'General José Manuel Pando', capi: 'Santiago de Machaca' },
        { provi: 'Larecaja', capi: 'Sorata' },
        { provi: 'Loayza', capi: 'Luribay' },
        { provi: 'Los Andes', capi: 'Pucarani' },
        { provi: 'Manco Kapac', capi: 'Copacabana' },
        { provi: 'Muñecas', capi: 'Chuma' },
        { provi: 'Nor Yungas', capi: 'Coroico' },
        { provi: 'Omasuyos', capi: 'Achacachi' },
        { provi: 'Pacajes', capi: 'Coro coro' },
        { provi: 'Pedro Domingo Murillo', capi: 'La Paz' },
        { provi: 'Sud Yungas', capi: 'Chulumani' },
      ],
    },
    {
      value: 'OR',
      depa: 'Oruro',
      capi: 'Oruro',
      provincias: [
        { provi: 'Sabaya', capi: 'Sabaya' },
        { provi: 'Carangas', capi: 'Corque' },
        { provi: 'Cercado', capi: 'Oruro' },
        { provi: 'Eduardo Abaroa', capi: 'Challapata' },
        { provi: 'Ladislao Cabrera', capi: 'Salinas de Garcí Mendoza' },
        { provi: 'Litoral', capi: 'Huachacalla' },
        { provi: 'Mejillones', capi: 'La Rivera' },
        { provi: 'Nor Carangas', capi: 'Huayllamarca' },
        { provi: 'Pantaleón Dalence', capi: 'Huanuni' },
        { provi: 'Poopó', capi: 'Poopó' },
        { provi: 'Sajama', capi: 'Curahuara de Carangas' },
        { provi: 'San Pedro de Totora', capi: 'Totora' },
        { provi: 'Saucarí', capi: 'Toledo' },
        { provi: 'Sebastián Pagador', capi: 'Santiago de Huari' },
        { provi: 'Sud Carangas', capi: 'Santiago de Andamarca' },
        { provi: 'Tomas Barrón', capi: 'Eucaliptus' },
      ],
    },
    {
      value: 'PD',
      depa: 'Pando',
      capi: 'Cobija',
      provincias: [
        { provi: 'Abuná', capi: 'Santa Rosa del Abuná' },
        { provi: 'Federico Román', capi: 'Nueva Esperanza' },
        { provi: 'Madre de Dios', capi: 'Puerto Gonzalo Moreno' },
        { provi: 'Manuripi', capi: 'Puerto Rico' },
        { provi: 'Nicolás Suárez', capi: 'Cobija' },
      ],
    },
    {
      value: 'PT',
      depa: 'Potosí',
      capi: 'Potosí',
      provincias: [
        { provi: 'Alonzo de Ibáñez', capi: 'Villa de Sacaca' },
        { provi: 'Antonio Quijarro', capi: 'Uyuni' },
        { provi: 'Bernardino Bilbao', capi: 'Arampampa' },
        { provi: 'Charcas', capi: 'San Pedro de Buena Vista' },
        { provi: 'Chayanta', capi: 'Colquechaca' },
        { provi: 'Cornelio Saavedra', capi: '	Betanzos' },
        { provi: 'Daniel Saavedra', capi: 'Llica' },
        { provi: 'Enrique Baldivieso', capi: 'San Agustín' },
        { provi: 'José María Linares', capi: 'Puna' },
        { provi: 'Modesto Omiste', capi: 'Villazón' },
        { provi: 'Nor Chichas', capi: 'Cotagaita' },
        { provi: 'Nor Lípez', capi: 'Colcha K' },
        { provi: 'Rafael Bustillo', capi: 'Uncía' },
        { provi: 'Sud Chichas', capi: 'Tupiza' },
        { provi: 'Sud Lipez', capi: 'San Pablo de Lipez' },
        { provi: 'Tomás Frías', capi: 'Tinguipaya' },
      ],
    },
    {
      value: 'SC',
      depa: 'Santa Cruz',
      capi: 'Santa Cruz de la Sierra',
      provincias: [
        { provi: 'Andrés Ibáñez', capi: 'Ciudad de Santa Cruz' },
        { provi: 'Ignacio Warnes', capi: 'Warnes' },
        { provi: 'José Miguel de Velasco', capi: 'San Ignacio' },
        { provi: 'Ichilo', capi: 'Buena Vista' },
        { provi: 'Chiquitos', capi: 'San José' },
        { provi: 'Sara', capi: 'Portachuelo' },
        { provi: 'Cordillera', capi: 'Lagunillas' },
        { provi: 'Vallegrande', capi: 'Vallegrande' },
        { provi: 'Florida', capi: 'Samaipata' },
        { provi: 'Santistevan', capi: 'Montero' },
        { provi: 'Ñuflo de Chávez', capi: 'Concepción' },
        { provi: 'Ángel Sandoval', capi: 'San Matías' },
        { provi: 'Caballero', capi: 'Comarapa' },
        { provi: 'Germán Busch', capi: 'Puerto Suárez' },
        { provi: 'Guarayos', capi: 'Ascensión' },
      ],
    },
    {
      value: 'TJ',
      depa: 'Tarija',
      capi: 'Tarija',
      provincias: [
        { provi: 'Aniceto Arce', capi: 'Padcaya' },
        { provi: 'Burdet OConnor', capi: 'Entre Ríos' },
        { provi: 'Cercado', capi: 'Tarija' },
        { provi: 'Eustaquio Méndez', capi: 'San Lorenzo' },
        { provi: 'Gran Chaco', capi: 'Yacuiba' },
        { provi: 'José María Avilés', capi: 'Uriondo' },
      ],
    },
  ];

  constructor(
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private _auth: AuthService,
    private _serviceProyectos: ProyectosService,
    private _servideProyArchivos: ProyArchivosService,
    private _servicePublicaciones: PublicacionesService,
    private _servicePubliArchivos: PubliArchivosService,
    private _serviceInvestigadores: InvestigadoresService,
    private _serviceFinanciamientos: FinanciamientosService,
    private _serviceLugarDesarrollo: LugarDesarrollosService,
    private _serviceCursos: CursosService,
    private _serviceCursoArchivos: CursoArchivosService,
    private _serviceEventos: EventosService,
    private _serviceEventoArchivos: EventoArchivosService,
    private _serviceNotaPrensas: NotaPrensasService,
    private _serviceNotaArchivos: NotaArchivosService,
    private _serviceExposiciones: ExposicionesService,
    private _serviceExpoArchivos: ExpoArchivosService,
    private _servicePermisoArchivos: PermisoArchivosService,
    private _serviceConvenios: ConveniosService,
    private _serviceConvArchivos: ConvArchivosService,
    private _serviceContratados: ContratadosService,
    private _serviceContraArchivos: ContraArchivosService,
    private _serviceUnidades: UnidadesService,
    private _serviceExpositores: ExpositoresService,
    private _serviceInvProyectos: InvProyectosService,
    private toastr: ToastrService
  ) {
    this.token = this._auth.getToken();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.filtroInicial();
    this.vaciarFiltro();
  }

  toggleFullWidth() {
    this.sidebarService.toggle();
    this.sidebarVisible = this.sidebarService.getStatus();
    this.cdr.detectChanges();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addColumn(columna: string) {
    this.columnsToDisplay.push(columna);
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  shuffle() {
    let currentIndex = this.columnsToDisplay.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = this.columnsToDisplay[currentIndex];
      this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
      this.columnsToDisplay[randomIndex] = temp;
    }
  }

  openModal(content, size) {
    this.modalService.open(content, { size: size });
  }

  imprimir(exporter) {
    const pageAnt = this.dataSource.paginator.pageSize;
    this.dataSource.paginator._changePageSize(this.length);

    // console.log('exporter', exporter._cdkTable._data);
    // console.log('dataSource', this.dataSource.data);
    let data: any = exporter._cdkTable._data;
    let propiedades: any = this.columnsToDisplay;

    printJS({ printable: data, properties: propiedades, type: 'json' });

    this.dataSource.paginator._changePageSize(pageAnt);
  }

  obtenerProyectos() { }

  filtroInicial() {
    this._serviceProyectos.getProyectos(this.token)
      .then((response) => {
        this.proyectos = [];
        response.proyectos.forEach((proyecto) => {
          // 2020-05-31 T04:00:00.000Z
          proyecto.fechaini = proyecto.fechaini.substring(0, 10);
          proyecto.fechafin = proyecto.fechafin.substring(0, 10);
          this.proyectos.push(proyecto);
        });

        this.displayedColumns = [
          'titulo',
          'fechaini',
          'fechafin',
          'proceso',
          'estado'
        ];
        this.columnsToDisplay = this.displayedColumns.slice();

        this.dataSource = new MatTableDataSource(this.proyectos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.length = this.dataSource.data.length;
        let ini = Math.ceil(this.length / 3);
        for (let i = ini; i < this.length + ini; i = i + ini) {
          if (i >= this.length) {
            this.pageSizeOptions.push(this.length);
          } else {
            this.pageSizeOptions.push(i);
          }
        }
        // console.log(this.proyectos);
      })
      .catch((error) => {
        console.log('Error al obtener proyectos', error);
      });
  }

  formatDate(d: NgbDate): string {
    if (d === null) {
      return null;
    }
    return [
      d.year,
      d.month < 10 ? '0' + d.month : d.month,
      d.day < 10 ? '0' + d.day : d.day,
    ].join('-');
  }

  formatDateString(d: string): NgbDate {
    if (d === null) {
      return null;
    }
    let anio = parseInt(d.substring(0, 4));
    let mes = d.substring(5, 6) === '0' ? parseInt(d.substring(6, 7)) : parseInt(d.substring(5, 7));
    let dia = d.substring(8, 9) === '0' ? parseInt(d.substring(9, 10)) : parseInt(d.substring(8, 10));
    let date = new NgbDate(anio, mes, dia);
    return date;
  }

  realizarFiltro() {
    console.log(this.filtro);
    this.columnaInicial();
    if ((this.filtro.tipoFecha === 'inicio' || this.filtro.tipoFecha === 'final') && !this.filtro.fechaini && !this.filtro.fechafin) {
      this.toastr.error('Seleccionó fechas, debe llenar los campos', undefined, { closeButton: true, positionClass: 'toast-top-right' }); //bottom
    } else if (this.filtro.tipoFecha === 'inicio' && this.filtro.estado && this.filtro.fechaini && this.filtro.fechafin && this.filtro.procesoini && this.filtro.procesofin) {
      let fechaini = this.formatDate(this.filtro.fechaini) + 'T00:00:00.000';
      let fechafin = this.formatDate(this.filtro.fechafin) + 'T00:00:00.000';
      this._serviceProyectos.getProyectosBetweenProccessBetweenDatesIniAndStatus(
        this.filtro.procesoini,
        this.filtro.procesofin,
        fechaini,
        fechafin,
        this.filtro.estado,
        this.token
      ).then(response => {
        this.proyectos = response.proyectos;
        this.filtroRecorrido();
      }).catch(error => { console.log('Error al obtener proyectos', error); });
    } else if (this.filtro.tipoFecha === 'final' && this.filtro.estado && this.filtro.fechaini && this.filtro.fechafin && this.filtro.procesoini && this.filtro.procesofin) {
      let fechaini = this.formatDate(this.filtro.fechaini) + 'T00:00:00.000';
      let fechafin = this.formatDate(this.filtro.fechafin) + 'T00:00:00.000';
      this._serviceProyectos.getProyectosBetweenProccessBetweenDatesFinAndStatus(
        this.filtro.procesoini,
        this.filtro.procesofin,
        fechaini,
        fechafin,
        this.filtro.estado,
        this.token
      ).then(response => {
        this.proyectos = response.proyectos;
        this.filtroRecorrido();
      }).catch(error => { console.log('Error al obtener proyectos', error); });
    } else if (this.filtro.tipoFecha === 'inicio' && this.filtro.fechaini && this.filtro.fechafin && this.filtro.procesoini && this.filtro.procesofin) {
      let fechaini = this.formatDate(this.filtro.fechaini) + 'T00:00:00.000';
      let fechafin = this.formatDate(this.filtro.fechafin) + 'T00:00:00.000';
      this._serviceProyectos.getProyectosBetweenProccessAndBetweenDatesIni(
        this.filtro.procesoini,
        this.filtro.procesofin,
        fechaini,
        fechafin,
        this.token
      ).then(response => {
        this.proyectos = response.proyectos;
        this.filtroRecorrido();
      }).catch(error => { console.log('Error al obtener proyectos', error); });
    } else if (this.filtro.tipoFecha === 'final' && this.filtro.fechaini && this.filtro.fechafin && this.filtro.procesoini && this.filtro.procesofin) {
      let fechaini = this.formatDate(this.filtro.fechaini) + 'T00:00:00.000';
      let fechafin = this.formatDate(this.filtro.fechafin) + 'T00:00:00.000';
      this._serviceProyectos.getProyectosBetweenProccessAndBetweenDatesFin(
        this.filtro.procesoini,
        this.filtro.procesofin,
        fechaini,
        fechafin,
        this.token
      ).then(response => {
        this.proyectos = response.proyectos;
        this.filtroRecorrido();
      }).catch(error => { console.log('Error al obtener proyectos', error); });
    } else if (this.filtro.estado && this.filtro.procesoini && this.filtro.procesofin) {
      this._serviceProyectos.getProyectosBetweenProccessAndStatus(this.filtro.procesoini, this.filtro.procesofin, this.filtro.estado, this.token)
        .then(response => {
          this.proyectos = response.proyectos
          this.filtroRecorrido();
        }).catch(error => { console.log('Error al obtener proyectos', error); });
    } else if (this.filtro.procesoini && this.filtro.procesofin) {
      this._serviceProyectos.getProyectosBetweenProccess(this.filtro.procesoini, this.filtro.procesofin, this.token)
        .then(response => {
          this.proyectos = response.proyectos
          this.filtroRecorrido();
        }).catch(error => { console.log('Error al obtener proyectos', error); });
    } else if (this.filtro.tipoFecha === 'inicio' && this.filtro.estado && this.filtro.fechaini && this.filtro.fechafin) {
      let fechaini = this.formatDate(this.filtro.fechaini) + 'T00:00:00.000';
      let fechafin = this.formatDate(this.filtro.fechafin) + 'T00:00:00.000';
      this._serviceProyectos.getProyectosBetweenDatesIniAndStatus(fechaini, fechafin, this.filtro.estado, this.token)
        .then(response => {
          this.proyectos = response.proyectos
          this.filtroRecorrido();
        }).catch(error => { console.log('Error al obtener proyectos entre fechas y estado', error); });
    } else if (this.filtro.tipoFecha === 'inicio' && this.filtro.fechaini && this.filtro.fechafin) {
      let fechaini = this.formatDate(this.filtro.fechaini) + 'T00:00:00.000';
      let fechafin = this.formatDate(this.filtro.fechafin) + 'T00:00:00.000';
      this._serviceProyectos.getProyectosBetweenDatesIni(fechaini, fechafin, this.token)
        .then(response => {
          this.proyectos = response.proyectos
          this.filtroRecorrido();
        }).catch(error => { console.log('Error al obtener proyectos entre fechas', error); });
    } else if (this.filtro.tipoFecha === 'final' && this.filtro.estado && this.filtro.fechaini && this.filtro.fechafin) {
      let fechaini = this.formatDate(this.filtro.fechaini) + 'T00:00:00.000';
      let fechafin = this.formatDate(this.filtro.fechafin) + 'T00:00:00.000';
      this._serviceProyectos.getProyectosBetweenDatesFinAndStatus(fechaini, fechafin, this.filtro.estado, this.token)
        .then(response => {
          this.proyectos = response.proyectos
          this.filtroRecorrido();
        }).catch(error => { console.log('Error al obtener proyectos entre fechas y estado', error); });
    } else if (this.filtro.tipoFecha === 'final' && this.filtro.fechaini && this.filtro.fechafin) {
      let fechaini = this.formatDate(this.filtro.fechaini) + 'T00:00:00.000';
      let fechafin = this.formatDate(this.filtro.fechafin) + 'T00:00:00.000';
      this._serviceProyectos.getProyectosBetweenDatesFin(fechaini, fechafin, this.token)
        .then(response => {
          this.proyectos = response.proyectos
          this.filtroRecorrido();
        }).catch(error => { console.log('Error al obtener proyectos entre fechas', error); });
    } else if (this.filtro.estado) {
      this._serviceProyectos.getProyectosByEstado(this.filtro.estado, this.token)
        .then(response => {
          this.proyectos = response.proyectos
          this.filtroRecorrido();
        }).catch(error => { console.log('Error al obtener proyectos por estado', error); });
    } else {
      this._serviceProyectos.getProyectos(this.token)
        .then(response => {
          this.proyectos = response.proyectos;
          this.filtroRecorrido();
        }).catch(error => { console.log('Error al obtener proyectos', error); });
    }
  }
  filtroRecorrido() {
    console.log(this.proyectos);
    let proys: any = [];
    this.proyectos.forEach(proyecto => {
      // buscando departamento o provincia
      if (this.filtro.departamento && this.filtro.provincia) {
        // tslint:disable-next-line:max-line-length
        this._serviceLugarDesarrollo.getLugarDesarrollosByIdProyectoDepartamentoAndProvincia(proyecto.id_proyecto, this.filtro.departamento, this.filtro.provincia, this.token)
          .then(response => {
            // console.log(response);
            let depa = '';
            response.lugar_desarrollos.forEach(lugar_desarrollo => {
              depa = depa + ' - ' + lugar_desarrollo.departamento + ', ' + lugar_desarrollo.provincia;
            });
            proyecto.departamento = depa;
          }).catch(error => { console.log('Error al obtener lugar de desarrollos', error); });
      } else if (this.filtro.departamento) {
        // tslint:disable-next-line:max-line-length
        this._serviceLugarDesarrollo.getLugarDesarrollosByIdProyectoAndDepartamento(proyecto.id_proyecto, this.filtro.departamento, this.token)
          .then(response => {
            // console.log(response);
            let depa = '';
            response.lugar_desarrollos.forEach(lugar_desarrollo => {
              depa = depa + ' - ' + lugar_desarrollo.departamento + ', ' + lugar_desarrollo.provincia;
            });
            proyecto.departamento = depa;
          }).catch(error => { console.log('Error al obtener lugar de desarrollos', error); });
      } else if (this.filtro.provincia) {
        this._serviceLugarDesarrollo.getLugarDesarrollosByIdProyectoAndProvincia(proyecto.id_proyecto, this.filtro.provincia, this.token)
          .then(response => {
            // console.log(response);
            let depa = '';
            response.lugar_desarrollos.forEach(lugar_desarrollo => {
              depa = depa + ' - ' + lugar_desarrollo.departamento + ', ' + lugar_desarrollo.provincia;
            });
            proyecto.departamento = depa;
          }).catch(error => { console.log('Error al obtener lugar de desarrollos', error); });
      }
      // buscando coordinador
      if (this.filtro.mostrarCoordinador) {
        proyecto.coordinador = `${proyecto.investigadore.persona.grado_academico} ${proyecto.investigadore.persona.nombres} ${proyecto.investigadore.persona.paterno} ${proyecto.investigadore.persona.materno}`;
      }
      // buscando investigadores
      if (this.filtro.mostrarInvestigador) {
        console.log(proyecto);
        proyecto.investigadores = '';
        this._serviceInvProyectos.getInv_proyectosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response.inv_proyectos);
            response.inv_proyectos.forEach(inv_proyecto => {
              proyecto.investigadores = proyecto.investigadores + ' - ' + `${inv_proyecto.investigadore.persona.grado_academico} ${inv_proyecto.investigadore.persona.nombres} ${inv_proyecto.investigadore.persona.paterno} ${inv_proyecto.investigadore.persona.materno}`;
            });
          }).catch(error => { console.log('Error al obtener inv proyectos', error); });
      }
      // buscando basica tecnicas
      if (this.filtro.mostrarBasicaTecnica) {
        proyecto.basica_tecnicas = '';

        // this._serviceBasicaTecnicas.getBasicaTecnicasByIdProyecto(proyecto.id_proyecto, this.token)
        //   .then(response => {
        //     response.basica_tecnicas.forEach(basica_tecnica => {
        //       proyecto.basica_tecnicas = proyecto.basica_tecnicas + ' - ' + `${basica_tecnica.tipo}, ${basica_tecnica.area}`;
        //     });
        //   }).catch(error => { console.log('Error al obtener basica tecnicas', error); });
      }
      // buscando lugar_desarrollo
      if (this.filtro.mostrarLugarDesarrollo) {
        proyecto.lugar_desarrollos = '';
        this._serviceLugarDesarrollo.getLugarDesarrollosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response);
            response.lugar_desarrollos.forEach(lugar_desarrollo => {
              proyecto.lugar_desarrollos = proyecto.lugar_desarrollos + ' - ' + `${lugar_desarrollo.departamento}, ${lugar_desarrollo.provincia}`;
            });
          }).catch(error => { console.log('Error al obtener lugar de desarrollos', error); });
      }
      //  buscando publicacines
      if (this.filtro.mostrarPublicacion) {
        proyecto.publicaciones = '';
        this._servicePublicaciones.getPublicacionesByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response);
            response.publicaciones.forEach(publicacion => {
              proyecto.publicaciones = proyecto.publicaciones + ' - ' + publicacion.titulo;
            });
          }).catch(error => { console.log('Error al obtener publicaciones', error); });
      }
      // buscando convenios
      if (this.filtro.mostrarConvenio) {
        proyecto.convenios = '';
        this._serviceConvenios.getConveniosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response);
            response.convenios.forEach(convenio => {
              proyecto.convenios = proyecto.convenios + ' - ' + convenio.titulo;
            });
          }).catch(error => { console.log('Error al obtener convenios', error); });
      }
      // buscando contratados
      if (this.filtro.mostrarContratado) {
        proyecto.contratados = '';
        this._serviceContratados.getContratadosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response);
            response.contratados.forEach(contratado => {
              proyecto.contratados = proyecto.contratados + ' - ' + contratado.nombrecompleto;
            });
          }).catch(error => { console.log('Error al obtener contratados', error); });
      }
      // buscando cursos
      if (this.filtro.mostrarCurso) {
        proyecto.cursos = '';
        this._serviceCursos.getCursosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response);
            response.cursos.forEach(curso => {
              proyecto.cursos = proyecto.cursos + ' - ' + curso.titulo;
            });
          }).catch(error => { console.log('Error al obtener cursos', error); });
      }
      // buscando eventos
      if (this.filtro.mostrarEvento) {
        proyecto.eventos = '';
        this._serviceEventos.getEventosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response);
            response.eventos.forEach(evento => {
              proyecto.eventos = proyecto.eventos + ' - ' + evento.titulo;
            });
          }).catch(error => { console.log('Error al obtener eventos', error); });
      }
      // buscando notas de prensa
      if (this.filtro.mostrarNotaPrensa) {
        proyecto.nota_prensas = '';
        this._serviceNotaPrensas.getNotaPrensasByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response);
            response.nota_prensas.forEach(nota_prensa => {
              proyecto.nota_prensas = proyecto.nota_prensas + ' - ' + nota_prensa.titulo;
            });
          }).catch(error => { console.log('Error al obtener notas de prensas', error); });
      }
      // buscando exposiciones
      if (this.filtro.mostrarExposicion) {
        proyecto.exposiciones = '';
        this._serviceExposiciones.getExposicionesByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            // console.log(response);
            response.exposiciones.forEach(exposicion => {
              proyecto.exposiciones = proyecto.exposiciones + ' - ' + exposicion.titulo;
            });
          }).catch(error => { console.log('Error al obtener exposiciones', error); });
      }
      // buscando nro publicaciones
      if (this.filtro.mostrarNumeroPublicacion) {
        proyecto.nro_publicaciones = 0;
        this._servicePublicaciones.countPublicacionesByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_publicaciones = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      // buscando nro basica tecnicas
      if (this.filtro.mostrar) {
        proyecto.nro_publicaciones = 0;
        this._servicePublicaciones.countPublicacionesByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_publicaciones = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      //  buscando nro_basica_tecnicas
      if (this.filtro.mostrarNumeroBasicaTecnicas) {
        proyecto.nro_basicas_tecnicas = 0;
        
        // this._serviceBasicaTecnicas.countBasicaTecnicasByIdProyecto(proyecto.id_proyecto, this.token)
        //   .then(response => {
        //     proyecto.nro_basicas_tecnicas = response.contador;
        //   }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      // buscando nro lugar de desarrollo
      if (this.filtro.mostrarNumeroLugarDesarrollos) {
        proyecto.nro_lugares_desarrollo = 0;
        this._serviceLugarDesarrollo.countLugarDesarrollosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_lugares_desarrollo = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      // buscando nro convenios
      if (this.filtro.mostrarNumeroConvenios) {
        proyecto.nro_convenios = 0;
        this._serviceConvenios.countConveniosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_convenios = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      // buscando nro contratados
      if (this.filtro.mostrarNumeroContratados) {
        proyecto.nro_contratados = 0;
        this._serviceContratados.countContratadosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_contratados = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      // buscando nro cursos
      if (this.filtro.mostrarNumeroCursos) {
        proyecto.nro_curso = 0;
        this._serviceCursos.countCursosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_curso = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      // buscando nro eventos
      if (this.filtro.mostrarNumeroEventos) {
        proyecto.nro_eventos = 0;
        this._serviceEventos.countEventosByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_eventos = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      // busando nro notas de prensa
      if (this.filtro.mostrarNumeroNotasPrensa) {
        proyecto.nro_notas_prensa = 0;
        this._serviceNotaPrensas.countNotaPrensasByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_notas_prensa = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }
      // buscando nro exposiciones
      if (this.filtro.mostrarNumeroExposiciones) {
        proyecto.nro_exposiciones = 0;
        this._serviceExposiciones.countExposicionesByIdProyecto(proyecto.id_proyecto, this.token)
          .then(response => {
            proyecto.nro_exposiciones = response.contador;
          }).catch(error => { console.log('Error al obtener contador publicaciones', error); });
      }


      proys.push(proyecto);
    });
    console.log(proys);
    this.proyectos = proys;
    let dataS = new MatTableDataSource(this.proyectos);
    this.dataSource = dataS;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.filtro.departamento || this.filtro.provincia) {
      this.displayedColumns.push('departamento');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarCoordinador) {
      this.displayedColumns.push('coordinador');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarInvestigador) {
      this.displayedColumns.push('investigadores');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarBasicaTecnica) {
      this.displayedColumns.push('basica_tecnicas');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarLugarDesarrollo) {
      this.displayedColumns.push('lugar_desarrollos');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarPublicacion) {
      this.displayedColumns.push('publicaciones');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarConvenio) {
      this.displayedColumns.push('convenios');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarContratado) {
      this.displayedColumns.push('contratados');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarCurso) {
      this.displayedColumns.push('cursos');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarEvento) {
      this.displayedColumns.push('eventos');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNotaPrensa) {
      this.displayedColumns.push('nota_prensas');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarExposicion) {
      this.displayedColumns.push('exposiciones');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNumeroPublicacion) {
      this.displayedColumns.push('nro_publicaciones');
      this.columnsToDisplay = this.displayedColumns.slice();
    }


    if (this.filtro.mostrarNumeroBasicaTecnicas) {
      this.displayedColumns.push('nro_basicas_tecnicas');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNumeroLugarDesarrollos) {
      this.displayedColumns.push('nro_lugares_desarrollo');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNumeroConvenios) {
      this.displayedColumns.push('nro_convenios');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNumeroContratados) {
      this.displayedColumns.push('nro_contratados');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNumeroCursos) {
      this.displayedColumns.push('nro_curso');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNumeroEventos) {
      this.displayedColumns.push('nro_eventos');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNumeroNotasPrensa) {
      this.displayedColumns.push('nro_notas_prensa');
      this.columnsToDisplay = this.displayedColumns.slice();
    }
    if (this.filtro.mostrarNumeroExposiciones) {
      this.displayedColumns.push('nro_exposiciones');
      this.columnsToDisplay = this.displayedColumns.slice();
    }

    this.length = this.dataSource.data.length;
    let ini = Math.ceil(this.length / 3);
    for (let i = ini; i < this.length + ini; i = i + ini) {
      if (i >= this.length) {
        this.pageSizeOptions.push(this.length);
      } else {
        this.pageSizeOptions.push(i);
      }
    }
    console.log(this.proyectos);
  }

  columnaInicial() {
    this.displayedColumns = [
      'titulo',
      'fechaini',
      'fechafin',
      'proceso',
      'estado'
    ];
    this.columnsToDisplay = this.displayedColumns.slice();
  }

  obtenerProvincias() {
    this.filtro.provincia = '';
    this.departamentos.forEach((departamento) => {
      if (departamento.value === this.filtro.departamento) {
        this.provincias = departamento.provincias;
      }
    });
  }

  vaciarFiltro() {
    this.filtro = {
      fechaini: '',
      fechafin: '',
      departamento: '',
      provincia: '',
      estado: '',
      mostrarCoordinador: false,
      mostrarInvestigador: false,
      mostrarBasicaTecnica: false,
      mostrarLugarDesarrollo: false,
      mostrarPublicacion: false,
      mostrarNumeroPublicacion: false,
      mostrarConvenio: false,
      mostrarContratado: false,
      mostrarCurso: false,
      mostrarEvento: false,
      mostrarNotaPrensa: false,
      mostrarExposicion: false,
      procesoini: '',
      procesofin: '',
      tipoFecha: 'ninguna'
    };
  }
  comprobarDepartamento(depart: string) {
    let depa = '';
    switch (depart) {
      case 'CH':
        depa = 'Chuquisaca';
        break;
      case 'LP':
        depa = 'La Paz';
        break;
      case 'CB':
        depa = 'Cochabamba';
        break;
      case 'OR':
        depa = 'Oruro';
        break;
      case 'PT':
        depa = 'Potosí';
        break;
      case 'TJ':
        depa = 'Tarija';
        break;
      case 'SC':
        depa = 'Santa Cruz';
        break;
      case 'CH':
        depa = 'Chuquisaca';
        break;
      case 'BE':
        depa = 'Beni';
        break;
      case 'PD':
        depa = 'Pando';
        break;
      default:
        depa = 'error';
        break;
    }
    return depa;
  }
}
