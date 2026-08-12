import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { App } from './app';
import { authReducer } from './state/auth/auth.reducer';
import { forksReducer } from './state/forks/forks.reducer';
import { providerConnectionsReducer } from './state/provider-connections/provider-connections.reducer';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideStore({
          auth: authReducer,
          providerConnections: providerConnectionsReducer,
          forks: forksReducer,
        }),
      ],
    }).compileComponents();
  });

  it('renders the application shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Spotify Manager');
    expect(fixture.nativeElement.textContent).toContain('Browse playlists');
  });
});
