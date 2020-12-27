import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { JwtHelperService } from '@auth0/angular-jwt';
const jwtHelper:JwtHelperService=new JwtHelperService();
declare var $:any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit,OnDestroy {

  username=''
  password=''
  rememberme=false
  isLoading=false

  constructor(private router:Router,private _service:ApiService) {
    if(localStorage.getItem('authorization'))
    {
      var token = localStorage.getItem('authorization');
      if(!jwtHelper.isTokenExpired(token))
      {
        this.router.navigate(['/dashboard']);
      }
    }
    $.fn.addCustomFile()
  }

  ngOnInit() {
    // $.fn.initInput()
  }

  login(){
    this.isLoading=true
    let obj={
      username:this.username,
      password:this.password,
      remember:this.rememberme
    }
    this._service.login(obj).subscribe(res=>{
      if(res.success){
        localStorage.setItem('authorization',res.token)
        if(localStorage.getItem('redirectUrl')){
          let redirectURL=localStorage.getItem('redirectUrl')
          localStorage.removeItem('redirectUrl')
          this.router.navigate([redirectURL])
        }
        else{
          this.router.navigate(["/dashboard"])
        }
      }
      else{
        Swal.fire("Error!", res.message, "error")
        this.isLoading=false
      }
    })
  }

  ngOnDestroy(){
    $.fn.removeCustomFile()
  }

}
