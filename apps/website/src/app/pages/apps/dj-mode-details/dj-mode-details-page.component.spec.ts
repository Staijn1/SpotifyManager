import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DjModeDetailsPageComponent } from './dj-mode-details-page.component';
import { ApiService } from "../../../services/api/api.service";
import { ActivatedRoute } from "@angular/router";
import { of } from 'rxjs';

class ActivatedRouteStub {
  paramMap = of({
    get: (key: string) => 'testPlaylistId'
  });
}

describe('DjModeDetailsComponent', () => {
  let component: DjModeDetailsPageComponent;
  let fixture: ComponentFixture<DjModeDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DjModeDetailsPageComponent],
      providers: [
        { provide: ApiService, useValue: jest.fn() },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DjModeDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
