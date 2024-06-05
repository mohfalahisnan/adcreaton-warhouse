"use client";
import CustomerForm from "@/components/CustomerForm";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
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
import { Button } from "@/components/ui/button";

import { useLocalStorage } from "@/hook/useLocalstorage";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useGetProducts } from "@/hook/useProduct";
import { ProductWithStock } from "@/interface";

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useGetProducts({});
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<string>();
  //   const deleteQuery = useMutation({
  //     mutationFn: async (id: number) => await deleteCustomer(id),
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["customer"] });

  //       setOpen(false);
  //       toast({
  //         description: (
  //           <div className="flex items-center justify-between gap-2">
  //             <div>
  //               <span className="text-green-500">
  //                 <CheckCircle2 size={28} strokeWidth={1} />
  //               </span>
  //             </div>
  //             <div>
  //               <h3 className="text-lg">Customer Deleted!</h3>
  //             </div>
  //           </div>
  //         ),
  //       });
  //     },
  //     onError(error) {
  //       toast({
  //         title: `Error: ${error.message}`,
  //         description: `${error.message}`,
  //         variant: "destructive",
  //       });
  //     },
  //   });
  //   const deleteQuerys = useMutation({
  //     mutationFn: async (customers: Product[]) =>
  //       await deleteCustomers(customers),
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["products"] });

  //       setOpen(false);
  //       toast({
  //         description: (
  //           <div className="flex items-center justify-between gap-2">
  //             <div>
  //               <span className="text-green-500">
  //                 <CheckCircle2 size={28} strokeWidth={1} />
  //               </span>
  //             </div>
  //             <div>
  //               <h3 className="text-lg">Customer Deleted!</h3>
  //             </div>
  //           </div>
  //         ),
  //       });
  //     },
  //     onError(error) {
  //       toast({
  //         title: `Error: ${error.message}`,
  //         description: `${error.message}`,
  //         variant: "destructive",
  //       });
  //     },
  //   });
  const columnsConfig: ColumnConfig<ProductWithStock>[] = [
    {
      accessorKey: "name",
      title: "Name",
    },
    {
      accessorKey: "unit",
      title: "Unit",
    },
    {
      accessorKey: "sell_price",
      title: "Sell Price",
    },
  ];

  const actionsConfig: ActionConfig<ProductWithStock>[] = [
    {
      label: "Copy Id",
      onClick: (employee: ProductWithStock) =>
        navigator.clipboard.writeText(JSON.stringify(employee.product_id)),
    },
    {
      label: "Delete",
      onClick: (employee: ProductWithStock) => {
        setOpen(true);
        setSelected(employee.product_id);
      },
    },
  ];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
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
      <div className="w-full flex items-end justify-end">
        <ResponsiveDialog
          title="Add Employee"
          description=""
          triggerContent={
            <Button size={"sm"} className="flex items-center gap-2">
              <Plus size={12} /> Customer
            </Button>
          }
          open={openAdd}
          onOpenChange={setOpenAdd}
        >
          <div className="max-h-[70vh] overflow-auto">
            <CustomerForm onSuccess={() => setOpenAdd(false)} />
          </div>
        </ResponsiveDialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        onDelete={handleDelete}
        onPrint={handlePrint}
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
