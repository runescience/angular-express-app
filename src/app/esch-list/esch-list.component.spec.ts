import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EschListComponent } from './esch-list.component';

describe('EschListComponent', () => {
  let component: EschListComponent;
  let fixture: ComponentFixture<EschListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EschListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EschListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
