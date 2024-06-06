import { Satuan } from "@prisma/client";

export async function convertTotalStockToUnits(
  total: number,
  units: Satuan[]
): Promise<{ [key: string]: number }> {
  let remainingStock = total;
  const stockInUnits: { [key: string]: number } = {};

  // Sort units by multiplier in descending order
  units.sort((a, b) => b.multiplier - a.multiplier);

  for (const unit of units) {
    const quantity = Math.floor(remainingStock / unit.multiplier);
    remainingStock %= unit.multiplier;
    stockInUnits[unit.name] = quantity;
  }

  return stockInUnits;
}
