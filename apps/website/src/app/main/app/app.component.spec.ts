import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { OAuthService } from 'angular-oauth2-oidc';
import { provideMockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
      ],
      providers: [{
        provide: OAuthService,
        useValue: {
          configure: jest.fn(),
          setupAutomaticSilentRefresh: jest.fn(),
          hasValidAccessToken: jest.fn(),
        }
      },
        provideRouter([]),
        provideMockStore({ initialState: {} })
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
