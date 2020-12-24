import {Component, Input, OnInit} from '@angular/core';
import {CustomError} from '../../types/CustomError';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  @Input() error: CustomError;

  constructor() {
  }

  ngOnInit(): void {
    // $('.toast').toast(option);
  }

}
