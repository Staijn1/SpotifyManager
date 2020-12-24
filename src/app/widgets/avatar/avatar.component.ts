import {Component, Input, OnInit} from '@angular/core';
import {faUserFriends} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  @Input() title: string;
  @Input() image: string;
  @Input() followers: string;
  @Input() href: string;
  followersIcon = faUserFriends;

  constructor() {
  }

  ngOnInit(): void {
  }

}
