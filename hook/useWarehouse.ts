import { UseQueryConfig } from "@/interface";
import { getWarehouses } from "@/lib/actions/warehouse";
import { Warehouse } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export const useGetWarehouses = ({
  queryConfig,
}: {
  queryConfig?: UseQueryConfig;
}) => {
  return useQuery<Warehouse[]>({
    queryKey: ["warehouses"],
    queryFn: async () => await getWarehouses(),
    ...queryConfig,
  });
};
