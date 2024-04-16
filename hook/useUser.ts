import { UseQueryConfig } from "@/interface";
import { getUserByEmail } from "@/lib/actions/accounts";
import { useQuery } from "@tanstack/react-query";

export const useGetUserByEmail = ({
  email,
  queryConfig,
}: {
  email: string;
  queryConfig: UseQueryConfig;
}) => {
  return useQuery({
    queryKey: ["user", email],
    queryFn: async () => await getUserByEmail(email),
    ...queryConfig,
  });
};
