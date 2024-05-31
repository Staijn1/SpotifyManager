import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DocumentationNavigationBarComponent,
  NavigationItem,
  RootNavigationItem
} from './documentation-navigation-bar.component';
import { provideRouter } from '@angular/router';

describe('DocumentationNavigationBarComponent', () => {
  let component: DocumentationNavigationBarComponent;
  let fixture: ComponentFixture<DocumentationNavigationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentationNavigationBarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentationNavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should flatten the list properly', () => {
    const hierarchyNavigationItems: RootNavigationItem[] = [
      {
        title: "root",
        icon: "root",
        children: [
          {
            markdownUrl: 'child.md',
            title: 'child',
            path: 'root/child'
          }
        ]
      },
      {
        path: "root2",
        title: "root2",
        icon: "root2",
        markdownUrl: 'root2.md',
        children: []
      }
    ];

    const flattened = DocumentationNavigationBarComponentTest.publicWrapper(hierarchyNavigationItems);
    const expected: NavigationItem[] = [
      {
        markdownUrl: 'child.md',
        title: 'child',
        path: 'root/child'
      },
      {
        path: "root2",
        title: "root2",
        markdownUrl: 'root2.md',
      }
    ];

    expect(flattened).toEqual(expected);
  });
});


export class DocumentationNavigationBarComponentTest extends DocumentationNavigationBarComponent{
  public static publicWrapper(navigationItems: RootNavigationItem[]): NavigationItem[] {
    return DocumentationNavigationBarComponentTest.flattenNavigationItems(navigationItems);
  }
}
