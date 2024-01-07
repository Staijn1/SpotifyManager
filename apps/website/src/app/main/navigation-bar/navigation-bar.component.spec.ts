import { TestBed } from '@angular/core/testing';
import { NavigationBarComponent } from './navigation-bar.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationBarComponent, NxWelcomeComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(NavigationBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Welcome website'
    );
  });

  it(`should have as title 'website'`, () => {
    const fixture = TestBed.createComponent(NavigationBarComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('website');
  });
});
