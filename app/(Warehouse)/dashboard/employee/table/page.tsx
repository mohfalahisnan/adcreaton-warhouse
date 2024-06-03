"use client";
import { DataTable } from "@/components/table/DataTable";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";

import { useGetEmployee } from "@/hook/useEmployee";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { User } from "@prisma/client";
import React from "react";

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data, isLoading } = useGetEmployee({
    warehouse_id: parseInt(warehouseId),
  });

  const emailColumn: ColumnConfig<User> = {
    accessorKey: "email",
    title: "Email",
  };
  const nameColumn: ColumnConfig<User> = {
    accessorKey: "name",
    title: "name",
  };
  const positionColumn: ColumnConfig<User> = {
    accessorKey: "position",
    title: "Position",
  };

  const columnsConfig: ColumnConfig<User>[] = [
    emailColumn,

    {
      accessorKey: "phone",
      title: "Phone",
    },
    nameColumn,
    positionColumn,
  ];

  const actionsConfig: ActionConfig<User>[] = [
    {
      label: "Copy Id",
      onClick: (employee: User) =>
        navigator.clipboard.writeText(employee.user_id),
    },
    {
      label: "Delete",
      onClick: (employee: User) => console.log("Delete", employee.user_id),
    },
  ];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
  });

  const handleDelete = (selectedRows: User[]) => {
    // Implement your delete logic here
    console.log("Deleted rows:", selectedRows);
  };

  const handleEdit = (selectedRows: User[]) => {
    // Implement your edit logic here
    console.log("Edited rows:", selectedRows);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data available.</div>;
  return (
    <DataTable
      columns={columns}
      data={data}
      onDelete={handleDelete}
      onPrint={handleEdit}
    />
  );
};

export default Page;
