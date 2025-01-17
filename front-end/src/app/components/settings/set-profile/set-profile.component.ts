import { Component, OnInit, ChangeDetectorRef, OnDestroy, Injectable } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UsuariosService } from 'src/app/services/admin/usuarios.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GLOBAL } from 'src/app/services/global';
import { NgbDatepickerI18n, NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from 'src/app/services/upload/upload.service';
import { FotografiasService } from 'src/app/services/upload/fotografias.service';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { UploadArchivoService } from 'src/app/services/upload/upload-archivo.service';

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
  selector: 'app-set-profile',
  templateUrl: './set-profile.component.html',
  styleUrls: ['./set-profile.component.css'],
})
export class SetProfileComponent implements OnInit, OnDestroy {
  
  public sidebarVisible: boolean = true;
  public fragment: string = 'settings';
  private ngUnsubscribe = new Subject();

  public token: string;
  public url: string;
  public who: string;

  // usuario
  private usuario: any = {};
  private persona: any = {};

  // formulario
  public basica: any = {};
  public cuenta: any = {};
  public cuenta_pass: any = {};
  public info: any = {};

  // usuario
  private id_usuario: number;
  private id_persona: number;

  // formacion
  public formacion_pro: any = '';
  public formacion_adi: any = '';
  public habilidades: any = '';
  public conclusion: any = '';

  // fotografia
  public fotografia: any = {};
  public imagen: string = 'photo_default.png';
  public image_selected: string;
  public filesToUpload: Array<File>;

  public curriculum: any = {};
  public pdf_selected: string;
  public filesToUpload1: Array<File>;

  // intereses
  public intereses: any = {};
  // proceso de subida
  public progress = 0;
  public progress1 = 0;

  constructor(
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
    private _auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private _serviceUsuario: UsuariosService,
    private toastr: ToastrService,
    public _upload: UploadService,
    private _serviceFotografias: FotografiasService,
    private _uploadArchivo: UploadArchivoService
  ) {
    this.token = this._auth.getToken();
    this.url = GLOBAL.url;
    this.who = GLOBAL.who;
    this.activatedRoute.fragment
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((fragment: string) => {
        if (fragment) {
          this.fragment = fragment;
        }
      });
  }

  ngOnInit() {
    this.id_usuario = JSON.parse(localStorage.getItem('identity_user')).id_usuario;
    this.obtenerDatos();
  }
  obtenerDatos() {
    this._serviceUsuario
      .getUsuarioById(this.id_usuario, this.token)
      .then((responseUsuario) => {
        // console.log(responseUsuario);
        this.usuario = responseUsuario.usuario;
        this.persona = responseUsuario.usuario.persona;
        this.fotografia = responseUsuario.usuario.persona.fotografia;
        this._serviceFotografias.setImagen(responseUsuario.usuario.persona.fotografia.imagen);
        this._serviceFotografias.getImagen().subscribe((value: string) => {
          this.imagen = value;
        });
        if (this.persona.fec_nacimiento) {
          var date = new Date(this.persona.fec_nacimiento);
        } else {
          var date = new Date();
        }
        this.id_persona = this.persona.id_persona;
        this.formacion_pro = this.persona.formacion_pro;
        this.formacion_adi = this.persona.formacion_adi;
        this.habilidades = this.persona.habilidades;
        this.conclusion = this.persona.conclusion;
        this.basica = {
          id_persona: this.persona.id_persona,
          paterno: this.persona.paterno,
          materno: this.persona.materno,
          nombres: this.persona.nombres,
          ci: this.persona.ci,
          sexo: this.persona.sexo,
          fec_nacimiento: null,
          url: this.persona.url,
          direccion1: this.persona.direccion1,
          direccion2: this.persona.direccion2,
          ciudad: this.persona.ciudad,
          provincia: this.persona.provincia,
          pais: this.persona.pais,
        };
        if (this.persona.fec_nacimiento) {
          this.basica.fec_nacimiento = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() + 1}
        }
        this.cuenta = {
          id_persona: this.persona.id_persona,
          usuario: this.usuario.usuario,
          correo: this.persona.correo,
          celular: this.persona.celular
        };
        this.cuenta_pass = {
          id_usuario: this.usuario.id_usuario,
          usuario: this.usuario.usuario,
          password: '',
          pass1: '',
          pass2: ''
        };
        this.info = {
          id_persona: this.persona.id_persona,
          telefono: this.persona.telefono,
          lenguaje: this.persona.lenguaje,
          grado_academico: this.persona.grado_academico
        };
        this.image_selected = this.fotografia.imagen;
        this.pdf_selected = this.persona.archivo;
      }).catch((error) => { console.log('error al obtener usuario', error); });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  editarInfBasica() {
    // console.log(this.basica);
    if (this.basica.fec_nacimiento) {
      this.basica.fec_nacimiento = this.formatDate(this.basica.fec_nacimiento) + 'T00:00:00.000';
    }
    this._serviceUsuario.updatePersona(this.basica.id_persona, this.basica, this.token)
    .then(responsePersona => {
      this.obtenerDatos();
      this.toastr.success('Informacion Basica actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }).catch(error => {
      // console.log('Error al actualizar persona', error);
      this.toastr.error('Error al actualizar informacion basica', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
  }
  editarDateCuenta() {
    // console.log(this.cuenta);
    this._serviceUsuario.updatePersona(this.cuenta.id_persona, this.cuenta, this.token)
    .then(responsePersona => {
      this.obtenerDatos();
      this.toastr.success('Datos de cuenta actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }).catch(error => { 
      console.log('Error al actualizar persona', error);
      this.toastr.error('Error al actualizar datos de cuenta', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
  }
  editarPassword() {
    // console.log(this.cuenta_pass);
    this._serviceUsuario.verificarPassword(this.cuenta_pass, this.token)
    .then(responseVeri => {
      // console.log(responseVeri.respuesta);
      if (responseVeri.respuesta) {
        // console.log(this.cuenta_pass.pass1.length);
        if ((this.cuenta_pass.pass1 === this.cuenta_pass.pass2) && this.cuenta_pass.pass1.length !== 0 && this.cuenta_pass.pass2.length !== 0) {
          this.cuenta_pass.password = this.cuenta_pass.pass2;
          this._serviceUsuario.updateUsuario(this.cuenta_pass.id_usuario, this.cuenta_pass, this.token)
          .then(responseUsuario => {
            this.obtenerDatos();
            this.toastr.success('Contraseña actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
          }).catch(error => {
            console.log('Error al actualizar usuario', error);
            this.toastr.error('Error al actualizar contraseña', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
          });
        } else {
          // console.log('Los passwords no son iguales');
          this.toastr.error('Error las contraseñas no son iguales', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
        }
      } else {
        // console.log('Contraseña incorrecta');
        this.toastr.error('Error al contraseña incorrecta', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });

      }
    })
    .catch(error => { console.log('Error al verificar password', error); });
  }
  editarInfGeneral() {
    // console.log(this.info);
    this._serviceUsuario.updatePersona(this.info.id_persona, this.info, this.token)
    .then(responsePersona => {
      this.obtenerDatos();
      this.toastr.success('Informacion general actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }).catch(error => {
      console.log('Error al actualiza persona', error);
      this.toastr.error('Error al actualizar informacion general', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
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

  guardarFormacion() {
    // console.log(this.formacion_pro);
    this._serviceUsuario.updatePersona(this.id_persona, { formacion_pro: this.formacion_pro }, this.token)
    .then(responsePersona => {
      this.obtenerDatos();
      this.toastr.success('Formacion profesional actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }).catch(error => {
      console.log('Error al actualizar persona', error);
      this.toastr.error('Error al actualizar formacion profesional', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
  }
  guardarFormacionAdi() {
    // console.log(this.formacion_adi);
    this._serviceUsuario.updatePersona(this.id_persona, { formacion_adi: this.formacion_adi }, this.token)
    .then(responsePersona => {
      this.obtenerDatos();
      this.toastr.success('Formacion adicional actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }).catch(error => {
      console.log('Error al actualizar persona', error);
      this.toastr.error('Error al actualizar formacion adicional', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
  }
  guardarHabilidades() {
    // console.log(this.habilidades);
    this._serviceUsuario.updatePersona(this.id_persona, { habilidades: this.habilidades }, this.token)
    .then(responsePersona => {
      this.obtenerDatos();
      this.toastr.success('Habilidades y capacidades actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }).catch(error => {
      console.log('Error al actualizar persona', error);
      this.toastr.error('Error al actualizar habilidades y capacidades', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
  }
  guardarConclusion() {
    // console.log(this.conclusion);
    this._serviceUsuario.updatePersona(this.id_persona, { conclusion: this.conclusion }, this.token)
    .then(responsePersona => {
      this.obtenerDatos();
      this.toastr.success('Conclusion actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }).catch(error => {
      console.log('Error al actualizar persona', error);
      this.toastr.error('Error al actualizar conclusion', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    });
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload =
      fileInput.target.files.length > 0
        ? <Array<File>>fileInput.target.files
        : null;
    this.image_selected = this.filesToUpload
      ? fileInput.target.files[0].name
      : '';
  }

  fileChangeEvent1(fileInput: any) {
    this.filesToUpload1 =
      fileInput.target.files.length > 0
        ? <Array<File>>fileInput.target.files
        : null;
    this.pdf_selected = this.filesToUpload1
      ? fileInput.target.files[0].name
      : '';
  }

  editarCurriculum() {
    if (this.filesToUpload1) {
      this._uploadArchivo.getObserver().subscribe(progress => {
        this.progress1 = progress;
      });
      this._uploadArchivo.uploadArchivo(this.url + 'upload-persona-archivo/' + this.id_persona, this.filesToUpload1[0], this.token)
        .then( (responseArchivo: any) => {
          // actualizamos fotografia y pasamos a falso
          this.toastr.success('curriculum actualizado', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
          this.progress1 = 0;
          this.filesToUpload1 = null;
          this.obtenerDatos();
        }).catch(error => {
          console.log('Error al subir curriculum actualizada', error);
          this.toastr.error('Error al subir curriculum', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
        });
    } else {
        this.toastr.error('Error no hay pdf seleccionado', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }
  }

  editarFotografia() {
    if (this.filesToUpload) {
      const foto = {
        descripcion: `Fotografia de ${this.persona.nombres} ${this.persona.paterno}`,
        numero: this.fotografia.numero + 1,
        tipo: 'foto'
      };
      this._upload.getObserver().subscribe(progress => {
        this.progress = progress;
      });
      this._serviceFotografias.save(foto, this.token)
      .then(responseFoto => {
        this._upload.upload(this.url + 'upload-fotografia/' + responseFoto.fotografias.id_fotografia, this.filesToUpload, this.token)
        .then( (responseFotografia: any) => {
          // actualizamos fotografia y pasamos a falso
          this._serviceFotografias.update(this.persona.id_fotografia, {estado: false}, this.token)
          .then(responseF => {
            this._serviceFotografias.setImagen(responseFotografia.fotografia.imagen); // actualizamos imagen en el servicio
            // actualizamos persona, con el nuevo id de fotografia
            this._serviceUsuario.updatePersona(this.persona.id_persona, {id_fotografia: responseFotografia.fotografia.id_fotografia}, this.token)
            .then(responsePersona => {
              // console.log(responsePersona);
              this.toastr.success('Fotografia actualizada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
              this.progress = 0;
              this.filesToUpload = null;
              this.obtenerDatos();
              // AQUI SE TIENE QUE ACTUALIZAR LA FOTO DE SIDEBAR, esta en obtenerDatos()
            }).catch(error => { console.log('Error al actualizar persona', error); });
          }).catch(error => { console.log('Error al eliminar fotografia, pasarlo a falso', error); });
        }).catch(error => {
          console.log('Error al subir fotografia actualizada', error);
          this.toastr.error('Error al subir fotografia', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
        });
      }).catch(error => { console.log('Error al crear nueva fotografia ', error); });
    } else {
        this.toastr.error('Error no hay imagen seleccionada', undefined, { closeButton: true, positionClass: 'toast-bottom-right' });
    }
  }

  changeProfile() {
    this.sidebarVisible = this.sidebarService.getStatus(); // En esta funcion pediremos que se actualice
  }

  toggleFullWidth() {
    this.sidebarService.toggle();
    this.sidebarVisible = this.sidebarService.getStatus();
    this.cdr.detectChanges();
  }
  editarIntereses() {
    console.log('editar', this.intereses);
  }
  limpiarInfBasica() {
    console.log(this.basica);
  }
  limpiarDateCuenta() {
    console.log(this.cuenta);
  }
  limpiarPassword() {
    console.log(this.cuenta_pass);
  }
  limpiarInfGeneral() {
    console.log(this.info);
  }
  limpiarIntereses() {
    console.log(this.intereses);
  }
  limpiarFormacion() {
    console.log(this.formacion_pro);
  }
  limpiarFomacionAdi() {
    console.log(this.formacion_adi);
  }
  limpiarHabilidades() {
    console.log(this.habilidades);
  }
  limpiarConclusion() {
    console.log(this.conclusion);
  }
}
