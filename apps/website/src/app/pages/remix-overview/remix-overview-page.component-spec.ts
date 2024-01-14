import { SyncRemixedPlaylistPageComponent } from '../sync-remixed-playlist/sync-remixed-playlist-page.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemixOverviewPageComponent } from './remix-overview-page.component';

describe('RemixOverviewPageComponent', () => {
  let component: RemixOverviewPageComponent;
  let fixture: ComponentFixture<RemixOverviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemixOverviewPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemixOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
