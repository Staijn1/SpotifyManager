import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A tab component that displays a list of tabs and allows the user to select one.
 * Example usage:
 * <app-tabs
 *   [labels]="['Tab 1', 'Tab 2', 'Tab 3']"
 *   [templates]="[template1, template2, template3]">
 *   <ng-template #template1>
 *     <h1>Test</h1>
 *   </ng-template>
 *   <ng-template #template2>
 *     <p>Test 2</p>
 *   </ng-template>
 *   <ng-template #template3>
 *     <button>Button</button>
 *   </ng-template>
 * </app-tabs>
 */
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  standalone: true,
  imports: [
    CommonModule
  ],
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent {
  @Input() labels: string[] = [];
  @Input() templates: TemplateRef<HTMLElement>[] = [];
  @Input() selectedTab = 0;

  selectTab(index: number) {
    this.selectedTab = index;
  }

  /**
   * Select the next tab
   * @param rollover If true, when the last tab is selected and then nextTab is called, the first tab will be selected.
   */
  nextTab(rollover: boolean = false) {
    if (this.selectedTab == this.labels.length - 1) {
      if (rollover) {
        this.selectedTab = 0;
      }
    } else {
      this.selectedTab++;
    }
  }

  /**
   * Select the previous tab
   * @param rollover If true, when the first tab is selected and then previousTab is called, the last tab will be selected.
   */
  previousTab(rollover: boolean = false) {
    if (this.selectedTab == 0) {
      if (rollover) {
        this.selectedTab = this.labels.length - 1;
      }
    } else {
      this.selectedTab--;
    }
  }
}
