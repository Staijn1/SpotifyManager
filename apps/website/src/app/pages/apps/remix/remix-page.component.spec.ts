import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemixPageComponent } from './remix-page.component';
import { of } from 'rxjs';
import { provideMockStore } from '@ngrx/store/testing';
import { SpotifyAPIService } from '../../../services/spotifyAPI/spotify-api.service';
import { ApiService } from '../../../services/api/api.service';
import { MessageService } from '../../../services/message/message.service';

describe('RemixPageComponent', () => {
  let component: RemixPageComponent;
  let fixture: ComponentFixture<RemixPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: SpotifyAPIService,
          useValue: {
            getUserPlaylist: jest.fn().mockReturnValue(Promise.resolve({})),
            getGeneric: jest.fn().mockReturnValue(Promise.resolve({}))
          }
        },
        {
          provide: ApiService,
          useValue: {
            remixPlaylist: jest.fn().mockReturnValue(of({}))
          }
        },
        {
          provide: MessageService,
          useValue: {
            setMessage: jest.fn()
          }
        },
        provideMockStore()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RemixPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
