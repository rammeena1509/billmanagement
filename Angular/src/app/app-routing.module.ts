import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthcheckService } from './authcheck.service';

const routes:Routes=[
  {
    path:"dashboard",
    loadChildren:"./dashboard/dashboard.module#DashboardModule",
    canActivate:[AuthcheckService]
  },
  {
    path:"bill-entry",
    loadChildren:"./bills/bill.module#BillModule",
    canActivate:[AuthcheckService]
  },
  {
    path:'',
    loadChildren:'./login/login.module#LoginModule'
  },
  {
    path:'login',
    loadChildren:'./login/login.module#LoginModule'
  },
  {
    path:'register',
    loadChildren:'./register/register.module#RegisterModule'
  },
  {
    path:'forgot-password',
    loadChildren:'./forgot-password/password.module#PasswordModule'
  },
  {
    path:'**',
    redirectTo:"/"
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
