import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputProjectionComponent } from './input-projection.component';

describe('NgxInputProjectionComponent', () => {
  let component: InputProjectionComponent;
  let fixture: ComponentFixture<InputProjectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputProjectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputProjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
