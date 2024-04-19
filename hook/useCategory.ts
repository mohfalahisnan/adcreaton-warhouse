"use client";
import { UseQueryConfig } from "@/interface";
import { getCategory } from "@/lib/actions/category";
import { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export const useGetCategory = ({
  queryConfig,
}: {
  queryConfig?: UseQueryConfig;
}) => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => await getCategory(),
    ...queryConfig,
  });
};
