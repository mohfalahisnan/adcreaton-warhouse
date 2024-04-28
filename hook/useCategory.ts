"use client";
import { UseQueryConfig } from "@/interface";
import { deleteCategory, getCategory } from "@/lib/actions/category";
import { Category } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";

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

export const useDeleteCategory = ({
  onSuccess,
  onError,
}: {
  onSuccess: (any: any) => void;
  onError: (any: any) => void;
}) => {
  return useMutation({
    mutationFn: async (id: number) => await deleteCategory(id),
    onSuccess: onSuccess,
    onError: onError,
  });
};
