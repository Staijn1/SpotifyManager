import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownDocumentationComponent } from './markdown-documentation.component';

describe('MarkdownDocumentationComponent', () => {
  let component: MarkdownDocumentationComponent;
  let fixture: ComponentFixture<MarkdownDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownDocumentationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MarkdownDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
