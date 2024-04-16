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
        warhouse: true;
      };
    };
  };
}>;

export interface ITierPrice {
  id: number;
  from: number;
  to: number;
  price: number;
}
