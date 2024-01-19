import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyUserComponent } from './spotify-user.component';

describe('SpotifyUserComponent', () => {
  let component: SpotifyUserComponent;
  let fixture: ComponentFixture<SpotifyUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
