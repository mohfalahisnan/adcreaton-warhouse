import { Prisma } from "@prisma/client";

export interface UseQueryConfig {
  enabled?: boolean;

  initialData?: any;
  refetchInterval?: number;
}

export type ProductWithStock = Prisma.ProductGetPayload<{
  include: {
    Category: true;
    stock: {
      include: {
        warehouse: true;
        unit: true;
      };
    };
    Satuan: true;
  };
}>;

export interface ITierPrice {
  id: number;
  from: number;
  to: number;
  price: number;
}
