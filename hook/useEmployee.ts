import { UseQueryConfig } from "@/interface";
import { getAllEmployee, inputEmployee } from "@/lib/actions/accounts";
import { User } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";

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
export const useInputEmployee = ({
  onSuccess,
  onError,
  data,
}: {
  onSuccess: () => void;
  onError: () => void;
  data: User;
}) => {
  data.role = "EMPLOYEE";
  return useMutation({
    mutationKey: ["inputEmployee"],
    mutationFn: async () => inputEmployee(data),
    onSuccess: onSuccess,
    onError: onError,
  });
};
