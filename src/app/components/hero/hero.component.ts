import {Component, OnInit} from '@angular/core';
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements OnInit {
  carouselPrevious = faChevronLeft;
  carouselNext = faChevronRight;
  constructor() {
  }

  ngOnInit(): void {
  }

}
