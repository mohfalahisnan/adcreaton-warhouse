"use client";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";
import { DataTable } from "@/components/table/DataTable";

import { useLocalStorage } from "@/hook/useLocalstorage";
import { getBarangKeluar } from "@/lib/actions/outbound";
import { Inbound } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";

function Pembayaran() {
  const session = useSession();
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const thisday = useQuery({
    queryKey: ["barangkeluar"],
    queryFn: async () => await getBarangKeluar(parseFloat(warehouseId)),
  });

  const barangMasuk = thisday.data?.barang;
  const columnsConfig: ColumnConfig<Inbound>[] = [
    {
      accessorKey: "quantity",
      title: "Qty",
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

  const actionsConfig: ActionConfig<Inbound>[] = [];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
  });
  const handleDelete = (selectedRows: Inbound[]) => {
    // Implement your delete logic here
    console.log("Deleted rows:", selectedRows);
  };

  const handlePrint = (selectedRows: Inbound[]) => {
    // Implement your edit logic here
    console.log("Edited rows:", selectedRows);
  };
  if (!barangMasuk || !thisday.data) return null;
  return (
    <div className="border rounded-md p-4 bg-card">
      <h3 className="font-bold text-xl">
        Barang Keluar Hari ini : {thisday.data?.barang.length}
      </h3>
      <h3 className="font-bold text-xl">
        Barang Keluar Minggu ini : {thisday.data?.barangWeek.length}
      </h3>

      <div className="border-t mt-8">
        <DataTable
          columns={columns as any}
          data={thisday.data?.list as any}
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
