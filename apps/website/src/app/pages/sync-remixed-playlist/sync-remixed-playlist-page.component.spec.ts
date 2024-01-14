import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SyncRemixedPlaylistPageComponent } from './sync-remixed-playlist-page.component';

describe('PlaylistComparePageComponent', () => {
  let component: SyncRemixedPlaylistPageComponent;
  let fixture: ComponentFixture<SyncRemixedPlaylistPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncRemixedPlaylistPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SyncRemixedPlaylistPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
