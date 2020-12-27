import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/api.service';
declare var $:any;
import Swal from 'sweetalert2'

@Component({
  selector: 'app-list-bill',
  templateUrl: './list-bill.component.html',
  styleUrls: ['./list-bill.component.css']
})
export class ListBillComponent implements OnInit {

  bills=[]
  totalPages=0
  pageNo=1
  currentPage=1
  limit=5
  users=[]
  monthArray=[]

  constructor(private _auth:ApiService) { }

  ngOnInit() {
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
    this.getBills()
  }

  getBills(){
    this.bills=[]
    this.totalPages=0
    let obj={limit:this.limit,pageNo:this.currentPage}
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
    this._auth.billList(obj).subscribe(res=>{
      if(res.success){
        this.bills=res.data
        this.totalPages=Math.ceil(res.count/this.limit)
      }
      else{
        Swal.fire("Error!", res.message, "error")
      }
    })
  }

  getPage(page){
    if(page=='next'){
      if(this.pageNo+7>this.totalPages){
        this.pageNo=this.totalPages-3
      }
      else{
        this.pageNo+=4
      }
      this.currentPage=this.pageNo
    }
    else if(page=='previous'){
      if(this.pageNo-4<1){
        this.pageNo=1
      }
      else{
        this.pageNo-=4
      }
      this.currentPage=this.pageNo
    }
    else{
      this.currentPage=page
    }
    this.getBills()
  }

  getUsers(){
    this.users=[]
    this._auth.userList({}).subscribe(res=>{
      if(res.success){
        this.users=res.data
        setTimeout(() => {
          $('#group').material_select();          
          $('#payee').material_select();          
        }, 100);
        // this.users.filter((item)=>{})
      }
      else{
        this.users=[]
        console.error(res.message)
      }
    })
  }

}
