import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRoleByEmail } from "@/lib/actions/accounts";
import { useLocalStorage } from "@/hook/useLocalstorage";

function SelectWarehouse({ name, email }: { name: string; email: string }) {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const userRole = useQuery({
    queryKey: ["role"],
    queryFn: async () => await getRoleByEmail(email),
  });
  useEffect(() => {
    if (userRole.data?.warehouse_id) {
      setWarehouseId(userRole.data.warehouse_id.toString());
    }
    setWarehouseId(userRole.data?.warehouse_id?.toString() || "1");
  }, [userRole.data, userRole.data?.warehouse_id]);
  if (!userRole.data) return null;
  return (
    <Button
      variant={"outline"}
      size={"sm"}
      className={`bg-primary flex justify-between w-full rounded ${userRole.data?.role === "ADMIN" && "hidden"}  ${userRole.data?.role === "APPROVAL" && "hidden"}`}
    >
      {name}
      <ChevronsUpDown size={16} />
    </Button>
  );
}

export default SelectWarehouse;
