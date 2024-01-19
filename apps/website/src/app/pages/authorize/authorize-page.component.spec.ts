import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorizePageComponent } from './authorize-page.component';
import { SpotifyAuthenticationService } from '../../services/spotify-authentication/spotify-authentication.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthorizePageComponent', () => {
  let component: AuthorizePageComponent;
  let fixture: ComponentFixture<AuthorizePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: SpotifyAuthenticationService,
          useValue: {
            completeLogin: jest.fn().mockReturnValue(Promise.resolve(true))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
