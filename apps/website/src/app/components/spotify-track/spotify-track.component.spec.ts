import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyTrackComponent } from './spotify-track.component';

describe('SpotifyTrackComponent', () => {
  let component: SpotifyTrackComponent;
  let fixture: ComponentFixture<SpotifyTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyTrackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpotifyTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
