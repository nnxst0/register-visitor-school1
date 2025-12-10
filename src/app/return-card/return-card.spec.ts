import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnCardComponent } from './return-card';

describe('ReturnCard', () => {
  let component: ReturnCardComponent;
  let fixture: ComponentFixture<ReturnCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
