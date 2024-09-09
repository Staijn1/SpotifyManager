import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DjModePageComponent } from './dj-mode-page.component';
import { ApiService } from '../../../services/api/api.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ListOfUsersPlaylistsResponse } from '@spotify-manager/core';

describe('DjModeComponent', () => {
  let component: DjModePageComponent;
  let fixture: ComponentFixture<DjModePageComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getAllUserPlaylists', 'djModePlaylist', 'applySorting']);

    await TestBed.configureTestingModule({
      imports: [DjModePageComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DjModePageComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    const mockUserPlaylists: ListOfUsersPlaylistsResponse = {
      href: '',
      items: [
        { id: 'playlist1', name: 'Playlist 1', tracks: { href: '', total: 10 } },
        { id: 'playlist2', name: 'Playlist 2', tracks: { href: '', total: 15 } }
      ],
      limit: 0,
      next: null,
      offset: 0,
      previous: null,
      total: 0
    };

    apiService.getAllUserPlaylists.and.returnValue(Promise.resolve(mockUserPlaylists));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user playlists on init', async () => {
    expect(apiService.getAllUserPlaylists).toHaveBeenCalled();
    expect(component.userplaylists?.items.length).toBe(2);
  });

  it('should call djModePlaylist and applySorting when go is called', async () => {
    const mockSortedPlaylist = [{ trackId: 'track1' }, { trackId: 'track2' }];
    apiService.djModePlaylist.and.returnValue(Promise.resolve(mockSortedPlaylist));
    apiService.applySorting.and.returnValue(Promise.resolve());

    component.playlistId = 'playlist1';
    await component.go();

    expect(apiService.djModePlaylist).toHaveBeenCalledWith('playlist1', 5);
    expect(apiService.applySorting).toHaveBeenCalledWith('playlist1', mockSortedPlaylist);
  });
});
