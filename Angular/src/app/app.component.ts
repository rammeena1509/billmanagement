import { Component } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
const jwtHelper:JwtHelperService=new JwtHelperService();
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
declare var $:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private router:Router)
  {
    this.routeEvent(this.router)
  }

  routeEvent(router: Router){
    router.events.subscribe(e => {
      if(e instanceof NavigationStart){
        $('body').removeClass('loaded');
      }
      if(e instanceof NavigationEnd){
        setTimeout(()=>{
          $('body').addClass('loaded');
        },500)
      }
    });
  }

  checkLogin(){
    var token = localStorage.getItem('authorization');
    if(token && !jwtHelper.isTokenExpired(token) && location.pathname.indexOf("/not-found")!=0)
    {
      return true;
    }
    else{
      return false;
    }
  }
}
