import { TestBed } from '@angular/core/testing';
import { TabsComponent } from './tabs.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent, NxWelcomeComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(TabsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Welcome website'
    );
  });

  it(`should have as title 'website'`, () => {
    const fixture = TestBed.createComponent(TabsComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('website');
  });
});
