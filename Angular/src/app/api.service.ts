import { Injectable } from '@angular/core';
import{Http, Headers, RequestOptions} from '@angular/http';
import { environment } from 'src/environments/environment';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {

  domain=environment.apiURL
  constructor(private http: Http) { }

  createAuthenticationHeaders()
  {
    return new RequestOptions(
    {
      headers: new Headers(
      {
        'Content-Type':'application/json',
        'authorization': localStorage.getItem('authorization')
      })
    })
  }

  login(details)
  {
    return this.http.post(this.domain+'authentication/login',details).map(res => res.json());
  }

  register(details)
  {
    return this.http.post(this.domain+'authentication/register',details).map(res => res.json());
  }

  billList(details){
    return this.http.post(this.domain+"authentication/billList",details,this.createAuthenticationHeaders()).map(res=>res.json())
  }

  userList(details){
    return this.http.post(this.domain+"authentication/userList",details,this.createAuthenticationHeaders()).map(res=>res.json())
  }

  addBill(details){
    return this.http.post(this.domain+"authentication/amountEntry",details,this.createAuthenticationHeaders()).map(res=>res.json())
  }

  dashboardAPI(details){
    return this.http.post(this.domain+"authentication/calculateAmout",details,this.createAuthenticationHeaders()).map(res=>res.json())
  }

}
