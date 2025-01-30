import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectWorkflowsComponent } from './select-workflows.component';

describe('SelectWorkflowsComponent', () => {
  let component: SelectWorkflowsComponent;
  let fixture: ComponentFixture<SelectWorkflowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectWorkflowsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectWorkflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
