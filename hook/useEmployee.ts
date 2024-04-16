import { UseQueryConfig } from "@/interface";
import { getAllEmployee } from "@/lib/actions/accounts";
import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export const useGetEmployee = ({
  queryConfig,
}: {
  queryConfig?: UseQueryConfig;
}) => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => await getAllEmployee(),
    ...queryConfig,
  });
};
