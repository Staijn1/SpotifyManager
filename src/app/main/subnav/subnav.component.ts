import {Component, OnInit} from '@angular/core';
import {faBalanceScale, faList, faUser} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-subnav',
  templateUrl: './subnav.component.html',
  styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit {
  account = faUser;
  playlist = faList;
  compare = faBalanceScale;

  constructor() {
  }

  ngOnInit(): void {
  }

}
