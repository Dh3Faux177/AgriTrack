import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgribotPage } from './agribot.page';

describe('AgribotPage', () => {
  let component: AgribotPage;
  let fixture: ComponentFixture<AgribotPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgribotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
