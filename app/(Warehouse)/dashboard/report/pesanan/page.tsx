"use client";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";
import { DataTable } from "@/components/table/DataTable";

import { useLocalStorage } from "@/hook/useLocalstorage";
import { getOrderDaily, orderReport } from "@/lib/actions/order";
import { Order, Payment } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";

function Pembayaran() {
  const session = useSession();
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const thisday = useQuery({
    queryKey: ["pesanan"],
    queryFn: async () => await getOrderDaily(parseFloat(warehouseId)),
  });
  const data = useQuery({
    queryKey: ["pesanans"],
    queryFn: async () => await orderReport(parseFloat(warehouseId)),
  });
  const orders = thisday.data?.orders;
  const columnsConfig: ColumnConfig<Order>[] = [
    {
      accessorKey: "order_code",
      title: "Order Code",
      renderCell(cellValue, row) {
        return <div className="capitalize">ORD-{cellValue}</div>;
      },
    },
    {
      accessorKey: "status",
      title: "Status",
    },

    {
      accessorKey: "createdAt",
      title: "Date",
      type: "date",
    },
  ];

  const actionsConfig: ActionConfig<Order>[] = [];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
  });
  const handleDelete = (selectedRows: Payment[]) => {
    // Implement your delete logic here
    console.log("Deleted rows:", selectedRows);
  };

  const handlePrint = (selectedRows: Payment[]) => {
    // Implement your edit logic here
    console.log("Edited rows:", selectedRows);
  };
  if (!orders || !data.data) return null;
  return (
    <div className="border rounded-md p-4 bg-card">
      <h3 className="font-bold text-xl">
        Order Hari ini : {thisday.data?.orders.length} pesanan
      </h3>
      <h3 className="font-bold text-xl">
        Order Minggu ini : {thisday.data?.orderWeek.length} pesanan
      </h3>

      <div className="border-t mt-8">
        <DataTable
          columns={columns as any}
          data={data.data as any}
          onDelete={handleDelete}
          onPrint={handlePrint}
          deleteButton={session.data?.user.ROLE === "ADMIN"}
          printButton={false}
          withSelected={false}
        />
      </div>
    </div>
  );
}

export default Pembayaran;
