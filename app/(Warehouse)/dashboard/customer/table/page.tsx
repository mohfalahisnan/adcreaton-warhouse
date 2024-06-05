"use client";
import { DataTable } from "@/components/table/DataTable";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";

import { useLocalStorage } from "@/hook/useLocalstorage";
import { getCustomersWarehouse } from "@/lib/actions/customer";
import { Customer } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useQuery({
    queryKey: ["customer"],
    queryFn: async () => await getCustomersWarehouse(parseInt(warehouseId)),
  });

  const columnsConfig: ColumnConfig<Customer>[] = [
    {
      accessorKey: "name",
      title: "Name",
    },
    {
      accessorKey: "phone",
      title: "Phone",
    },
    {
      accessorKey: "alamat",
      title: "Alamat",
    },
  ];

  const actionsConfig: ActionConfig<Customer>[] = [
    {
      label: "Copy Id",
      onClick: (employee: Customer) =>
        navigator.clipboard.writeText(JSON.stringify(employee.customer_id)),
    },
    {
      label: "Delete",
      onClick: (employee: Customer) =>
        console.log("Delete", employee.customer_id),
    },
  ];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
  });

  const handleDelete = (selectedRows: Customer[]) => {
    // Implement your delete logic here
    console.log("Deleted rows:", selectedRows);
  };

  const handleEdit = (selectedRows: Customer[]) => {
    // Implement your edit logic here
    console.log("Edited rows:", selectedRows);
  };

  if (!data) return <div>No data available.</div>;
  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        onDelete={handleDelete}
        onPrint={handleEdit}
      />
    </div>
  );
};

export default Page;
