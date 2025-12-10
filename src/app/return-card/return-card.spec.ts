import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnCard } from './return-card';

describe('ReturnCard', () => {
  let component: ReturnCard;
  let fixture: ComponentFixture<ReturnCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
