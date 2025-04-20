import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YieldCalculatorPage } from './yield-calculator.page';

describe('YieldCalculatorPage', () => {
  let component: YieldCalculatorPage;
  let fixture: ComponentFixture<YieldCalculatorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(YieldCalculatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
