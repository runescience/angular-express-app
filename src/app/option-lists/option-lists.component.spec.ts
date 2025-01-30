import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionListsComponent } from './option-lists.component';

describe('OptionListsComponent', () => {
  let component: OptionListsComponent;
  let fixture: ComponentFixture<OptionListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptionListsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
