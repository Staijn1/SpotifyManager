import {Component, OnInit} from '@angular/core';
import {faList, faUser} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-subnav',
  templateUrl: './subnav.component.html',
  styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit {
  account = faUser;
  playlist = faList;

  constructor() {
  }

  ngOnInit(): void {
  }

}
