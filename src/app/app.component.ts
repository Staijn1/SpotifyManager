import {Component, OnInit} from '@angular/core';
import * as AOS from 'aos';

import jquery from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor() {
  }

  ngOnInit(): void {
    AOS.init();
    // @ts-ignore
    window.$ = window.jQuery = jquery;
    // @ts-ignore
    window.isotope = require('isotope-layout/dist/isotope.pkgd');
  }
}
