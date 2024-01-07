import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TabsComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select tab correctly', () => {
    component.selectTab(1);
    expect(component.selectedTab).toEqual(1);
  });

  it('should go to next tab correctly', () => {
    component.labels = ['Tab 1', 'Tab 2', 'Tab 3'];
    component.selectTab(0);
    component.nextTab();
    expect(component.selectedTab).toEqual(1);
  });

  it('should not go to next tab when on last tab', () => {
    component.labels = ['Tab 1', 'Tab 2', 'Tab 3'];
    component.selectTab(2);
    component.nextTab();
    expect(component.selectedTab).toEqual(2);
  });

  it('should go to previous tab correctly', () => {
    component.labels = ['Tab 1', 'Tab 2', 'Tab 3'];
    component.selectTab(2);
    component.previousTab();
    expect(component.selectedTab).toEqual(1);
  });

  it('should not go to previous tab when on first tab', () => {
    component.labels = ['Tab 1', 'Tab 2', 'Tab 3'];
    component.selectTab(0);
    component.previousTab();
    expect(component.selectedTab).toEqual(0);
  });

  it('should go to first tab when on last tab and rollover is true', () => {
    component.labels = ['Tab 1', 'Tab 2', 'Tab 3'];
    component.selectTab(2);
    component.nextTab(true);
    expect(component.selectedTab).toEqual(0);
  });

  it('should go to last tab when on first tab and rollover is true', () => {
    component.labels = ['Tab 1', 'Tab 2', 'Tab 3'];
    component.selectTab(0);
    component.previousTab(true);
    expect(component.selectedTab).toEqual(2);
  });
});
