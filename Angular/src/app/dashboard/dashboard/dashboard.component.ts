import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import Swal from 'sweetalert2';
declare var $:any;
import { JwtHelperService } from '@auth0/angular-jwt';
const jwtHelper:JwtHelperService=new JwtHelperService();

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  decoded:any;
  permission:any;
  name=''
  role=''
  usercode=''

  payment={
    total:0,
    pay:0,
    receive:0,
    net:0
  }
  calculatedData=[]
  distributionData=[]
  month='0'
  monthArray=[]
  users=[]

  constructor(private _api:ApiService) { 
    var snmpToken = localStorage.getItem('authorization')
    if(snmpToken)
    {
        this.decoded = jwtHelper.decodeToken(snmpToken);
        this.name = this.decoded.name
        this.role = this.decoded.role
        this.usercode = this.decoded.usercode
        this.permission = this.decoded.permission
    }
  }

  ngOnInit() {
    this.getDashboardData()
    this.getUsers()
    var months = [ "January", "February", "March", "April", "May", "June", 
         "July", "August", "September", "October", "November", "December" ];
    let mCount=new Date().getMonth()
    if(mCount<4){
      for(var i=6-mCount;i<=11;i++){
        this.monthArray.push({
          id:"PREV"+i+1,
          month:i+1,
          name:months[i],
          year:new Date().getFullYear()-1
        })
      }  
    }
    for(var i=0;i<=mCount;i++){
      this.monthArray.push({
        id:i+1,
        month:i+1,
        name:months[i],
        year:new Date().getFullYear()
      })
    }    
    setTimeout(()=>{
      $.fn.initMNFab()
      $('#month').val(mCount+1)
      $('#month').material_select();
    },500)
  }

  getDashboardData(){
    let obj={}
    if($("#month").val()){
      obj['month']=this.monthArray.find(item=>item.id==$("#month").val()).month
    }
    if($("#month").val()){
      obj['year']=this.monthArray.find(item=>item.id==$("#month").val()).year
    }
    if($("#payee").val()){
      obj['payee']=$("#payee").val()
    }
    if($("#group").val() && $("#group").val().length>0){
      obj['group']=$("#group").val()
    }
    this._api.dashboardAPI(obj).subscribe(res=>{
      if(res.success){
        let paymnt;
        try{
          paymnt=res.payment[0].user
          this.calculatedData=res.payment[0].data
        }
        catch(e){
          console.log("Error : "+e.message)
        }
        this.distributionData=res.data
        this.payment.total=paymnt.total?paymnt.total:0
        this.payment.pay=paymnt.pay?paymnt.pay:0
        this.payment.receive=paymnt.receive?paymnt.receive:0
        this.payment.net=this.payment.total-this.payment.receive+this.payment.pay
      }
      else{
        this.calculatedData=[]
        this.distributionData=[]
        this.payment.total=0
        this.payment.net=0
        this.payment.pay=0
        this.payment.receive=0
        Swal.fire("Sorry",res.message,'error')
      }
    })
  }

  makePositive(number){
    return Math.abs(number)
  }

  setDataValue(data,type){
    // $(`#${i}-paid`).html(data.amount)
    // $(`#${i}-adjust`).html(data.overflow)
    // $(`#${i}-type`).html(data.type)
    let dd=data.participant.find((el)=>{return el.usercode==this.usercode})
    if(type=='paid'){
      return dd.amount
    }
    else if(type=='adjust'){
      return dd.overflow
    }
    else{
        return dd.type.toUpperCase()
    }
  }

  setParticipant(data){
    let html=''
    for(let d of data){
      if(html!=''){
        html+=", "
      }
      html+=d.name
    }
    return html
  }

  getUsers(){
    this.users=[]
    this._api.userList({}).subscribe(res=>{
      if(res.success){
        this.users=res.data
        setTimeout(() => {
          $('#group').material_select();          
          $('#payee').material_select();          
        }, 100);
        // this.users.filter((item)=>{})
      }
      else{
        console.error(res.message)
      }
    })
  }

}
