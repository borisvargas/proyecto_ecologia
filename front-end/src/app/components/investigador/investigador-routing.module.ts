import { Routes, RouterModule } from '@angular/router';

import { InvestigadorComponent } from './investigador/investigador.component';
import { ProfileComponent } from './profile/profile.component';
import { ListProyectoInvComponent } from './list-proyecto-inv/list-proyecto-inv.component';
import { EditProyectoComponent } from './edit-proyecto/edit-proyecto.component';
import { ViewProyectoComponent } from './view-proyecto/view-proyecto.component';
import { InvestigadorGuard } from 'src/app/services/guards/investigador.guard';
import { SetProfileComponent } from '../settings/set-profile/set-profile.component';
import { CuentaHelpComponent } from '../help/cuenta-help/cuenta-help.component';
import { AdminHelpComponent } from '../help/admin-help/admin-help.component';
import { DirectorHelpComponent } from '../help/director-help/director-help.component';
import { InvestigadorHelpComponent } from '../help/investigador-help/investigador-help.component';
import { ProfilePostComponent } from './profile-post/profile-post.component';
import { MenuComponent } from './menu/menu.component';
import { InvProfileComponent } from '../profiles/inv-profile/inv-profile.component';
import { InvProfilePostComponent } from '../profiles/inv-profile-post/inv-profile-post.component';


const routes: Routes = [
  {
      path: '', component: InvestigadorComponent,
      canActivate: [
        InvestigadorGuard
      ],
      children: [
          { path: '', redirectTo: 'dashboard' },
          {
              path: 'dashboard',
              children: [
                { path: '', redirectTo: 'menu', pathMatch: 'full' },
                { path: 'menu', component: MenuComponent, data: { title: 'Menu investigador :: Instituto de Ecología' } },
                { path: 'profile', component: ProfileComponent, data: { title: 'Mi perfil :: Instituto de Ecología' } },
                { path: 'profile-post/:id_publicacion', component: ProfilePostComponent, data: { title: 'Mi publicación :: Instituto de Ecología' } },
                { path: 'list-proyectos-inv/:tipo', component: ListProyectoInvComponent, data: { title: 'Lista proyectos investigador :: Instituto de Ecología' } },
                { path: 'edit-proyecto/:id', component: EditProyectoComponent, data: { title: 'Avances proyecto :: Instituto de Ecología' } },
                { path: 'view-proyecto/:id', component: ViewProyectoComponent, data: { title: 'Ver proyecto :: Instituto de Ecología' } }

              ]
          },
          {
            path: 'settings',
              children: [
                  { path: '', redirectTo: 'account', pathMatch: 'full' },
                  { path: 'account', component: SetProfileComponent, data: { title: 'Configuración cuenta :: Instituto de Ecología' } },
              ]
          },
          {
            path: 'help',
              children: [
                  { path: '', redirectTo: 'cuenta', pathMatch: 'full' },
                  { path: 'cuenta/:tipo', component: CuentaHelpComponent, data: { title: 'Ayuda cuenta :: Instituto de Ecología' } },
                  { path: 'admin/:tipo', component: AdminHelpComponent, data: { title: 'Ayuda administrador :: Instituto de Ecología' } },
                  { path: 'director/:tipo', component: DirectorHelpComponent, data: { title: 'Ayuda director :: Instituto de Ecología' } },
                  { path: 'investigador/:tipo', component: InvestigadorHelpComponent, data: { title: 'Ayuda investigador :: Instituto de Ecología' } }
              ]
          },
          {
            path: 'profiles',
              children: [
                  { path: '', redirectTo: 'cuenta', pathMatch: 'full' },
                  { path: 'inv-profile/:id_persona', component: InvProfileComponent, data: { title: 'Investigador :: Instituto de Ecología' } },
                  { path: 'inv-profile-post/:id_persona/:id_publicacion', component: InvProfilePostComponent, data: { title: 'Publicación :: Instituto de Ecología' } }
              ]
          },
          { path: '**', redirectTo: 'dashboard' }
      ]
  },

];

export const InvestigadorRoutingModule = RouterModule.forChild(routes);
