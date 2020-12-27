import { Component, OnInit } from '@angular/core';
declare var $:any;

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    setTimeout(()=>{
      // console.log($(".fixed-action-btn").hasClass("horizontal"));
      // $.fn.hello("ram")
      $.fn.initMNFab()
    },1000)
  }

}
