"use client";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";
import { DataTable } from "@/components/table/DataTable";

import { useLocalStorage } from "@/hook/useLocalstorage";
import { getPaymentDaily, getPayments } from "@/lib/actions/payment";
import { formatRupiah } from "@/lib/formatRupiah";
import { Payment } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";

function Pembayaran() {
  const session = useSession();
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const thisday = useQuery({
    queryKey: ["payment"],
    queryFn: async () => await getPaymentDaily(parseFloat(warehouseId)),
  });
  const data = useQuery({
    queryKey: ["payments"],
    queryFn: async () => await getPayments(parseFloat(warehouseId)),
  });
  const payment = thisday.data?.payments;
  const columnsConfig: ColumnConfig<Payment>[] = [
    {
      accessorKey: "amount",
      title: "Amount",
      renderCell(cellValue, row) {
        return <div>Rp .{formatRupiah(cellValue)}</div>;
      },
    },
    {
      accessorKey: "method",
      title: "Method",
    },
    {
      accessorKey: "notes",
      title: "Note",
    },
    {
      accessorKey: "orderId",
      title: "Kas/Order",
      renderCell(cellValue, row) {
        return <div>{!cellValue ? "Kas" : "Order"}</div>;
      },
    },
    {
      accessorKey: "inputBy",
      title: "InputBy",
    },
    {
      accessorKey: "createdAt",
      title: "Date",
      type: "date",
    },
  ];

  const actionsConfig: ActionConfig<Payment>[] = [];

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
  if (!payment || !data.data) return null;
  return (
    <div className="border rounded-md p-4 bg-card">
      <h3 className="font-bold text-xl">
        Kas Hari ini : Rp.
        {formatRupiah(thisday.data?.totalAmount || 0)}
      </h3>
      <h3 className="font-bold text-xl">
        Order Hari ini : Rp.
        {formatRupiah(thisday.data?.totalAmountWithOrderId || 0)}
      </h3>

      <div className="border-t mt-8">
        <DataTable
          columns={columns}
          data={data.data}
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
