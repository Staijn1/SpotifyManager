import {Component, Input} from '@angular/core';
import {faUserFriends} from '@fortawesome/free-solid-svg-icons';
import UserObjectPublic = SpotifyApi.UserObjectPublic;

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input() avatar: UserObjectPublic | undefined;
  followersIcon = faUserFriends;
}
