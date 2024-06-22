"use client";
import { DataTable } from "@/components/table/DataTable";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { useLocalStorage } from "@/hook/useLocalstorage";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import React, { useEffect, useState } from "react";
import { useGetProducts } from "@/hook/useProduct";
import { ProductWithStock } from "@/interface";
import { Satuan } from "@prisma/client";
import { convertTotalStockToUnits } from "@/lib/stockInUnit";
import UnitForm from "@/components/UnitForm";

const StockCell = ({ total, Satuan }: { total: number; Satuan: Satuan[] }) => {
  const [stockInUnits, setStockInUnits] = useState<{ [key: string]: number }>(
    {},
  );

  useEffect(() => {
    (async () => {
      const result = await convertTotalStockToUnits(total, Satuan);
      setStockInUnits(result);
    })();
  }, [total, Satuan]);

  return (
    <p className="flex items-center gap-2">
      {Object.entries(stockInUnits).map(([unit, quantity], index) => {
        if (quantity !== 0) {
          return (
            <i key={index}>
              <h3>
                {quantity} {unit}
              </h3>
            </i>
          );
        }
      })}
    </p>
  );
};

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useGetProducts({});
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<string>();
  const columnsConfig: ColumnConfig<ProductWithStock>[] = [
    {
      accessorKey: "name",
      title: "Name",
    },
    {
      accessorKey: "stock",
      title: "Stock",
      renderCell: (cellValue, row) => (
        <>
          {row.stock.map((item, i) => {
            if (warehouseId === item.warehouse_id.toString()) {
              return (
                <h3 key={i}>
                  Total: {item.total}
                  <StockCell key={i} total={item.total} Satuan={row.Satuan} />
                </h3>
              );
            }
          })}
        </>
      ),
    },
    {
      accessorKey: "Satuan",
      title: "Available Unit",
      renderCell: (cellValue) => (
        <ul>
          {cellValue.map((item: Satuan, index: number) => (
            <li key={index} className="text-xs">
              {item.name}({item.multiplier})
            </li>
          ))}
        </ul>
      ),
    },
    {
      accessorKey: "Satuan",
      title: "Action",
      renderCell(cellValue, row) {
        return <UnitForm id={row.product_id} />;
      },
    },
  ];

  const actionsConfig: ActionConfig<ProductWithStock>[] = [
    {
      label: "Copy Id",
      onClick: (product: ProductWithStock) =>
        navigator.clipboard.writeText(JSON.stringify(product.product_id)),
    },
    {
      label: "Delete",
      onClick: (product: ProductWithStock) => {
        setOpen(true);
        setSelected(product.product_id);
      },
    },
  ];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
    showAction: false,
  });
  const handleDelete = (selectedRows: ProductWithStock[]) => {
    // Implement your delete logic here
    console.log("Deleted rows:", selectedRows);
    // deleteQuerys.mutate(selectedRows);
  };

  const handlePrint = (selectedRows: ProductWithStock[]) => {
    // Implement your edit logic here
    console.log("Edited rows:", selectedRows);
  };
  if (!data) return null;
  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        onDelete={handleDelete}
        onPrint={handlePrint}
        printButton={false}
      />
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete and
              remove your data from our servers.
              {/* {selected} */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpen(false);
                setSelected(undefined);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              //   onClick={() => deleteQuery.mutate(selected as string)}
              className="bg-destructive hover:bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
