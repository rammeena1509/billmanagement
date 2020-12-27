import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
const jwtHelper:JwtHelperService=new JwtHelperService();

@Injectable()
export class AuthcheckService {

  constructor(private router:Router) { }

  canActivate( router: ActivatedRouteSnapshot, state: RouterStateSnapshot ) 
  {
    if(localStorage.getItem('authorization'))
    {
      var token = localStorage.getItem('authorization');
      if(!jwtHelper.isTokenExpired(token))
      {
        return true;
      }
      else
      {
        localStorage.clear()
        localStorage.setItem('redirectUrl',state.url)
        this.router.navigate(['/login']);
        return false;
      }
    }
    else
    {
      localStorage.clear()
      localStorage.setItem('redirectUrl',state.url)
      this.router.navigate(['/login']);
      return false;
    }
  }

}
