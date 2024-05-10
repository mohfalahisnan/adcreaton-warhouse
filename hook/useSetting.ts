import { UseQueryConfig } from "@/interface";
import { getSetting } from "@/lib/actions/setting";
import { Setting } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export const useSetting = ({
  queryConfig,
}: {
  queryConfig?: UseQueryConfig;
}) => {
  return useQuery<Setting | null>({
    queryKey: ["setting"],
    queryFn: async () => await getSetting(),
    ...queryConfig,
  });
};
