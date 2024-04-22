import { UseQueryConfig } from "@/interface";
import {
  getAllEmployee,
  addEmployee,
  deleteUser,
} from "@/lib/actions/accounts";
import { User } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetEmployee = ({
  queryConfig,
}: {
  queryConfig?: UseQueryConfig;
}) => {
  return useQuery<User[]>({
    queryKey: ["employee"],
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
    mutationFn: async () => addEmployee(data),
    onSuccess: onSuccess,
    onError: onError,
  });
};

export const useDeleteEmployee = ({
  onSuccess,
  onError,
}: {
  onSuccess: (any: any) => void;
  onError: (any: any) => void;
}) => {
  return useMutation({
    mutationFn: async (id: string) => await deleteUser(id),
    onSuccess: onSuccess,
    onError: onError,
  });
};
