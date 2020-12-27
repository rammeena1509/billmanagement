import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { Router } from '@angular/router';
declare var $:any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit,OnDestroy {

  name=''
  email=''
  mobile=''
  password=''
  cpassword=''
  isLoading=false

  constructor(private _service:ApiService,private router:Router) { 
    $.fn.addCustomFile()
  }

  ngOnInit() {}

  register(){
    this.isLoading=true
    if(this.password!=this.cpassword || this.password==''){
      Swal.fire('Info','Password is either not matched or empty.','info')
      this.isLoading=false
    }
    else{
      let obj={
        name:this.name,
        email:this.email,
        mobile:this.mobile,
        password:this.password,
        role:"user"
      }
      this._service.register(obj).subscribe(res=>{
        if(res.success){
          Swal.fire({title:'Successfull',text:res.message,type:'success'}).then(()=>{
            this.isLoading=false
            this.router.navigate(['/login'])
          })
        }
        else{
          Swal.fire({title:'Error!',text:res.message,type:'error'}).then(()=>{
            this.isLoading=false
          })
        }
      })
    }
  }

  ngOnDestroy(){
    $.fn.removeCustomFile()
  }

}
