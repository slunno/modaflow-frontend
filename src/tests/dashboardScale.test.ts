import { describe, it, expect } from 'vitest';

export function calculateDashboardMaxVal(
  etapasBarrasData: Array<{ azul: number; laranja: number }>
): number {
  const totals = etapasBarrasData.map((item) => item.azul + item.laranja);
  return Math.max(...totals, 1);
}

export function calculateBarWidthPercentages(azul: number, laranja: number, maxVal: number) {
  const safeMax = Math.max(maxVal, 1);
  return {
    bluePercent: Math.min((azul / safeMax) * 100, 100),
    orangePercent: Math.min((laranja / safeMax) * 100, 100),
  };
}

describe('Dashboard Scale & Bar Chart Layout', () => {
  it('defaults maxVal to 1 when dataset is empty to prevent division by zero NaN', () => {
    const maxVal = calculateDashboardMaxVal([]);
    expect(maxVal).toBe(1);

    const widths = calculateBarWidthPercentages(0, 0, maxVal);
    expect(widths.bluePercent).toBe(0);
    expect(widths.orangePercent).toBe(0);
  });

  it('defaults maxVal to 1 when all stages have 0 items', () => {
    const data = [
      { azul: 0, laranja: 0 },
      { azul: 0, laranja: 0 },
    ];
    const maxVal = calculateDashboardMaxVal(data);
    expect(maxVal).toBe(1);
  });

  it('scales dynamically beyond the legacy fixed-12 limit without overflowing', () => {
    const data = [
      { azul: 20, laranja: 5 }, // 25 total
      { azul: 80, laranja: 70 }, // 150 total (exceeds legacy 12)
      { azul: 10, laranja: 10 }, // 20 total
    ];

    const maxVal = calculateDashboardMaxVal(data);
    expect(maxVal).toBe(150);

    const largestStageWidths = calculateBarWidthPercentages(80, 70, maxVal);
    expect(largestStageWidths.bluePercent).toBeCloseTo((80 / 150) * 100, 2);
    expect(largestStageWidths.orangePercent).toBeCloseTo((70 / 150) * 100, 2);
    expect(largestStageWidths.bluePercent + largestStageWidths.orangePercent).toBeCloseTo(100, 2);
  });

  it('clamps width percentages to a maximum of 100% even with unexpected inputs', () => {
    const widths = calculateBarWidthPercentages(200, 0, 100);
    expect(widths.bluePercent).toBe(100);
  });
});
