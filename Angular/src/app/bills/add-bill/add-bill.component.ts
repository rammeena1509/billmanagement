import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/api.service';
declare var $:any;
import Swal from 'sweetalert2'
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-bill',
  templateUrl: './add-bill.component.html',
  styleUrls: ['./add-bill.component.css']
})
export class AddBillComponent implements OnInit {

  users=[]
  payee=[]
  remark=''
  amount=''
  changePayee=false
  constructor(private _api:ApiService,private router:Router) { }

  ngOnInit() {
    let picker=$('.datepicker').pickadate({
      selectMonths: false,
      selectYears: false,
      closeOnSelect:true,
      closeOnClear: true,
      format: 'mm/dd/yyyy',
      hide:true,
      max:new Date(),
      onSet:function(){
        // picker.data( 'pickadate' ).close()
      }
    }).off('focus');
    this.getUsers()
  }

  addBill(){
    let members=this.users.filter((el)=>{ return $("#group").val().includes(el.usercode)})
    let obj={
      "amount":this.amount,
      "users":members,
      "remark":this.remark,
      "paidOn":$('.datepicker').val()
    }
    if(this.changePayee){
      if($("#payee").val()){
        obj['paidBy']=this.users.find((el)=>{ return $("#payee").val().includes(el.usercode)})
      }
      else{
         obj['paidBy']={}
      }
    }
    if(!obj.remark){
      Swal.fire("Info","Provide remark.","warning")
    }
    else if(!obj.paidOn){
      Swal.fire("Info","Provide paid on date.","warning")
    }
    else if(!obj.amount){
      Swal.fire("Info","Amount is required.","warning")
    }
    else if(!obj.users.length){
      Swal.fire("Info","Members are required.","warning")
    }
    else if(this.changePayee && !obj['paidBy'].name){
      Swal.fire("Info","Provide paid by name","warning")
    }
    else{
      this._api.addBill(obj).subscribe(res=>{
        if(res.success){
          Swal.fire('Done',res.message,'success').then(()=>{
            this.router.navigate(['/bill-entry'])
          })
        }
        else{
          Swal.fire('Sorry',res.message,'error')
        }
      })
    }
  }

  getUsers(){
    this.users=[]
    this.payee=[]
    this._api.userList({}).subscribe(res=>{
      if(res.success){
        this.users=res.data
        setTimeout(() => {
          $('select').material_select();          
        }, 100);
        // this.users.filter((item)=>{})
      }
      else{
        console.error(res.message)
      }
    })
  }

}
