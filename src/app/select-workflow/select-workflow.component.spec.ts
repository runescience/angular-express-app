import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectWorkflowComponent } from './select-workflow.component';

describe('SelectWorkflowComponent', () => {
  let component: SelectWorkflowComponent;
  let fixture: ComponentFixture<SelectWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectWorkflowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
