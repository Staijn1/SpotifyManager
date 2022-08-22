import {Component, Input, OnInit} from '@angular/core';
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() type: 'submit' | 'button' = 'submit'
  @Input() text = ''
  @Input() icon: string | undefined
  _classes: string[] = ['btn-primary'];
  faIcon!: IconProp;

  /**
   * If no classes with btn- are supplied, add btn-primary and all the other classes suplied
   * @param {string[]} values
   */
  @Input() set classes(values: string[]) {
    this._classes = values;
    const hasBtnClass = values.find(value => value.startsWith('btn-')) !== undefined

    if (!hasBtnClass) this._classes.push('btn-primary')
  }


  /**
   * Find the icon by the given name
   */
  ngOnInit(): void {
    if (this.icon) {
      const parts: string[] = this.icon.split(' ');

      if (parts.length != 2) {
        console.error('icon must contain 2 parameters. Example: far PlusSquare');
        this.faIcon = fas['faQuestion'];
      } else {
        if (parts[0] == 'fas') {
          this.faIcon = fas['fa' + parts[1]];
        } else {
          this.faIcon = far['fa' + parts[1]];
        }

        if (!this.faIcon) {
          console.log('fa' + parts[1]);
          console.log('fas', fas);
          console.log('far', far);
          this.faIcon = fas['faExclamation'];
        }
      }
    }
  }
}
