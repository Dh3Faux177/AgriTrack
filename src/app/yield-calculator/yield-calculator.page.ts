import { Component } from '@angular/core';

@Component({
  selector: 'app-yield-calculator',
  standalone: false,
  templateUrl: './yield-calculator.page.html',
  styleUrls: ['./yield-calculator.page.scss'],
})
export class YieldCalculatorPage {
  plantDensity: number | null = null; // Plants per square meter (A)
  fruitsPerPlant: number | null = null; // Fruits per plant (B)
  weightPerFruit: number | null = null; // Weight per chili (grams) (C)
  totalYield: number | null = null; // Yield in t/ha

  constructor() {}

  calculateYield() {
    if (this.plantDensity && this.fruitsPerPlant && this.weightPerFruit) {
      this.totalYield = (this.plantDensity * this.fruitsPerPlant * this.weightPerFruit) / 10000;
    } else {
      this.totalYield = null;
    }
  }
}