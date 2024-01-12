import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  @Input() isLoading = false;
  @Input() size: "xs" | "sm" |"md" | "lg"  = 'md';
  @Input() additionalClasses: string[] = [];

  get additionalClassesJoint(): string {
    return this.additionalClasses.join(' ');
  }
}
