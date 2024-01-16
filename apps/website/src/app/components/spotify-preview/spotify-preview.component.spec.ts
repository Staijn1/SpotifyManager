import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyPreviewComponent } from './spotify-preview.component';

describe('SpotifyPreviewComponent', () => {
  let component: SpotifyPreviewComponent;
  let fixture: ComponentFixture<SpotifyPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
