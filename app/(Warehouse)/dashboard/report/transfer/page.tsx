"use client";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";
import { DataTable } from "@/components/table/DataTable";

import { useLocalStorage } from "@/hook/useLocalstorage";
import { getTransfer } from "@/lib/actions/payment";
import { formatRupiah } from "@/lib/formatRupiah";
import { Payment } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";

function Pembayaran() {
  const session = useSession();
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const thisday = useQuery({
    queryKey: ["transfer"],
    queryFn: async () => await getTransfer(parseFloat(warehouseId)),
  });

  const pengeluaran = thisday.data?.payment;
  const columnsConfig: ColumnConfig<Payment>[] = [
    {
      accessorKey: "amount",
      title: "Amount",
      renderCell(cellValue, row) {
        return <div>Rp. {formatRupiah(cellValue * -1)}</div>;
      },
    },
    {
      accessorKey: "notes",
      title: "notes",
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
  if (!pengeluaran || !thisday.data) return null;
  return (
    <div className="border rounded-md p-4 bg-card">
      <h3 className="font-bold text-xl">
        Pengeluaran Hari ini :{" "}
        {thisday.data?.payment.reduce(
          (total, payment) => total + payment.amount,
          0,
        )}
      </h3>
      <h3 className="font-bold text-xl">
        Pengeluaran Minggu ini :{" "}
        {thisday.data?.paymentWeek.reduce(
          (total, payment) => total + payment.amount,
          0,
        )}
      </h3>

      <div className="border-t mt-8">
        <DataTable
          columns={columns as any}
          data={thisday.data?.report as any}
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
