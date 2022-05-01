import {Component, Input} from '@angular/core';
import {faUserFriends} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input() title: string | undefined;
  @Input() image: string | undefined;
  @Input() followers: number | undefined;
  @Input() href: string | undefined;
  followersIcon = faUserFriends;
}
