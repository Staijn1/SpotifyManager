import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DjModePageComponent } from './dj-mode-page.component';

describe('DjModeComponent', () => {
  let component: DjModePageComponent;
  let fixture: ComponentFixture<DjModePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DjModePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DjModePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
