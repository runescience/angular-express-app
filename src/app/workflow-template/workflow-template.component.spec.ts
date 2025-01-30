import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTemplateComponent } from './workflow-template.component';

describe('WorkflowTemplateComponent', () => {
  let component: WorkflowTemplateComponent;
  let fixture: ComponentFixture<WorkflowTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
