import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListBillComponent } from './list-bill/list-bill.component';
import { AddBillComponent } from './add-bill/add-bill.component';
import { BillRoutingModule } from './bill-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ListBillComponent, AddBillComponent],
  imports: [
    CommonModule,
    BillRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class BillModule { }
