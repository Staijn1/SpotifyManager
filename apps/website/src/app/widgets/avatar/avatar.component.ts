import {Component, Input} from '@angular/core';
import {faUserFriends} from '@fortawesome/free-solid-svg-icons';
import FollowersObject = SpotifyApi.FollowersObject;
import ExternalUrlObject = SpotifyApi.ExternalUrlObject;
import ImageObject = SpotifyApi.ImageObject;

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input() username: string | undefined ;
  @Input() images: ImageObject[] | undefined = [];
  @Input() followers: FollowersObject | undefined;
  @Input() externalUrls: ExternalUrlObject = {spotify: ''};
  followersIcon = faUserFriends;
}
