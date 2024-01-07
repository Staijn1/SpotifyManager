import {Component, Input, OnInit} from '@angular/core';
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() type: 'submit' | 'button' = 'submit'
  @Input() text = ''
  @Input() icon: string | undefined
  @Input() href: string | undefined
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
        const key = 'fa' + parts[1]
        switch (parts[0]) {
          case 'fas':
            this.faIcon = fas[key];
            break;
          case 'far':
            this.faIcon = far[key];
            break;
          case 'fab':
            this.faIcon = fab[key];
            break;
          default:
            this.iconNotFoundState(parts[1]);
        }
        if (!this.faIcon) this.iconNotFoundState(parts[1]);

      }
    }
  }

  /**
   * Log icons and set exclamation mark icon if no icon is found
   */
  iconNotFoundState(iconName: string): void {
    console.log('fa' + iconName);
    console.log('fas', fas);
    console.log('far', far);
    console.log('fab', fab);
    this.faIcon = fas['faExclamation'];
  }
}
