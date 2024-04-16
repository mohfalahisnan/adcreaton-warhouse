import { ProductWithStock } from "@/interface";
import { getProducts } from "@/lib/actions/products";
import { useQuery } from "@tanstack/react-query";

export const useGetProducts = () => {
  return useQuery<ProductWithStock[]>({
    queryKey: ["products"],
    queryFn: async () => await getProducts(),
  });
};
