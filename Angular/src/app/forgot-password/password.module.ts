import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordComponent } from './password/password.component';
import { PasswordRoutingModule } from './password-routing.module';

@NgModule({
  imports: [
    CommonModule,
    PasswordRoutingModule
  ],
  declarations: [PasswordComponent]
})
export class PasswordModule { }
