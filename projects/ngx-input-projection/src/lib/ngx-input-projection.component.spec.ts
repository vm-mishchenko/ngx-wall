import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxInputProjectionComponent } from './ngx-input-projection.component';

describe('NgxInputProjectionComponent', () => {
  let component: NgxInputProjectionComponent;
  let fixture: ComponentFixture<NgxInputProjectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxInputProjectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxInputProjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
