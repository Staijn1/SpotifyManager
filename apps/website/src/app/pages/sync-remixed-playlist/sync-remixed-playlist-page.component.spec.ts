import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SyncRemixedPlaylistPageComponent } from './sync-remixed-playlist-page.component';
import { ApiService } from '../../services/api/api.service';
import { Router } from '@angular/router';

describe('SyncRemixedPlaylistPageComponent', () => {
  let component: SyncRemixedPlaylistPageComponent;
  let fixture: ComponentFixture<SyncRemixedPlaylistPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncRemixedPlaylistPageComponent],
      providers: [
        Router,
        {
          provide: ApiService,
          useValue: {
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SyncRemixedPlaylistPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
