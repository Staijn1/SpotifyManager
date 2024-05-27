import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerticalNavigationBarComponent } from './vertical-navigation-bar.component';

describe('VerticalNavigationBarComponent', () => {
  let component: VerticalNavigationBarComponent;
  let fixture: ComponentFixture<VerticalNavigationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalNavigationBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerticalNavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
