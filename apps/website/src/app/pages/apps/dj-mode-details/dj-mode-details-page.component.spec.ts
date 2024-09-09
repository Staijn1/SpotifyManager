import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DjModeDetailsPageComponent } from './dj-mode-details-page.component';

describe('DjModeDetailsComponent', () => {
  let component: DjModeDetailsPageComponent;
  let fixture: ComponentFixture<DjModeDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DjModeDetailsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DjModeDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
