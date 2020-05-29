import { Component, OnInit } from '@angular/core';
import { ForgotPasswordService } from 'src/app/services/auth/forgot-password.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  public persona: any = {};

  constructor(private _serviceForgotPassword: ForgotPasswordService, private _router: Router) { }

  ngOnInit() {
  }

  recuperar() {
    this._serviceForgotPassword.forgotPassword(this.persona)
    .then(response => {
      // satisfactorio se envio al correo, tarda un poco
      console.log('correo de recuperacion enviado', response);
      this._router.navigate(['/authentication/login']);
    })
    .catch(error => {
      this._router.navigate(['/authentication/login']);
      console.log('error', error);
    });
  }

}
