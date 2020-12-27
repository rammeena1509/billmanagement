import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var $:any;
import { JwtHelperService } from '@auth0/angular-jwt';
const jwtHelper:JwtHelperService=new JwtHelperService();

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent implements OnInit {

  decoded:any;
  permission:any;
  name=''
  role=''

  constructor(private router:Router) { 
    var snmpToken = localStorage.getItem('authorization')
    if(snmpToken)
    {
        this.decoded = jwtHelper.decodeToken(snmpToken);
        this.name = this.decoded.name
        this.role = this.decoded.role
        this.permission = this.decoded.permission
    }
  }

  ngOnInit() {
    setTimeout(()=>{
      $(".collapsible").collapsible()
      $.fn.initDropdown()
      $.fn.initSideNav()
    },500)
  }

  logout(){
    localStorage.removeItem('authorization')
    this.router.navigate(['/login'])
  }

}
