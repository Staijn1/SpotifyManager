import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyArtistComponent } from './spotify-artist.component';

describe('SpotifyUserComponent', () => {
  let component: SpotifyArtistComponent;
  let fixture: ComponentFixture<SpotifyArtistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyArtistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
