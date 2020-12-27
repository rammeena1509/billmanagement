import { Component, OnInit, OnDestroy } from '@angular/core';
declare var $:any;

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit,OnDestroy {

  constructor() {
    $.fn.addCustomFile()
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    $.fn.removeCustomFile()
  }

}
