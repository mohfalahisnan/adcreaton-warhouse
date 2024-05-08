import { Customer, Warehouse } from "@prisma/client";

export function filterById(items: Warehouse[], id: string): Warehouse[] {
  return items.filter((item) => item.warehouse_id === parseFloat(id));
}

export function filterCustomerById(items: Customer[], id: string): Customer[] {
  return items.filter((item) => item.customer_id === parseFloat(id));
}

export function hasWarehouseId(
  warehouses: Warehouse[] | any[],
  targetId: number
): boolean {
  return warehouses.some((warehouse) => warehouse.warehouse_id === targetId);
}
