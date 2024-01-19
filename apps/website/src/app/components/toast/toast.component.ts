import { Component, Input } from '@angular/core';
import { Message } from '../../types/Message';
import { swipeRight } from '../../animations/swipeRight';

@Component({
  selector: 'app-toast',
  standalone: true,
  animations: [swipeRight],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {

  /**
   * Setter for error
   * When called the alert will be shown and closed after 5 seconds
   * @param val
   */
  @Input() set message(val: Message | undefined) {
    this._message = val;
    setTimeout(() => {
      this._message = undefined;
    }, 5000);
  }

  get message(): Message | undefined {
    return this._message;
  }

  private _message: Message | undefined;

  onAlertClick(message: Message) {
    if (message.action) {
      message.action();
    }
  }
}
