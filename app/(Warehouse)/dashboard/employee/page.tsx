"use client";
import EmployeeForm from "@/components/EmployeeForm";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { queryClient } from "@/components/provider";
import { DataTable } from "@/components/table/DataTable";
import {
  ActionConfig,
  ColumnConfig,
  createColumns,
} from "@/components/table/_utils/columns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import { useDeleteEmployee, useGetEmployee } from "@/hook/useEmployee";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { deleteUsers } from "@/lib/actions/accounts";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Plus } from "lucide-react";
import React, { useState } from "react";

const Page = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data, isLoading } = useGetEmployee({
    warehouse_id: parseInt(warehouseId),
  });
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<string>();
  const deletesQuery = useMutation({
    mutationFn: async (data: User[]) => await deleteUsers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee"] });

      setOpen(false);
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Employee Deleted!</h3>
            </div>
          </div>
        ),
      });
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });
  const deleteQuery = useDeleteEmployee({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee"] });

      setOpen(false);
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Employee Deleted!</h3>
            </div>
          </div>
        ),
      });
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  const emailColumn: ColumnConfig<User> = {
    accessorKey: "email",
    title: "Email",
  };
  const nameColumn: ColumnConfig<User> = {
    accessorKey: "name",
    title: "Name",
  };
  const positionColumn: ColumnConfig<User> = {
    accessorKey: "position",
    title: "Position",
  };

  const columnsConfig: ColumnConfig<User>[] = [
    nameColumn,
    emailColumn,
    {
      accessorKey: "phone",
      title: "Phone",
    },
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
      onClick: (employee: User) => {
        setOpen(true), setSelected(employee.user_id);
      },
    },
  ];

  const columns = createColumns({
    columns: columnsConfig,
    actions: actionsConfig,
  });

  const handleDelete = (selectedRows: User[]) => {
    // Implement your delete logic here
    console.log("Deleted rows:", selectedRows);
    deletesQuery.mutate(selectedRows);
  };

  const handlePrint = (selectedRows: User[]) => {
    // Implement your edit logic here
    console.log("Edited rows:", selectedRows);
  };

  const deleteOne = (id: string) => {
    console.log(id);
    deleteQuery.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data available.</div>;
  return (
    <div>
      <div className="w-full flex items-end justify-end">
        <ResponsiveDialog
          title="Add Employee"
          description=""
          triggerContent={
            <Button size={"sm"} className="flex items-center gap-2">
              <Plus size={12} /> Employee
            </Button>
          }
          open={openAdd}
          onOpenChange={setOpenAdd}
        >
          <div className="max-h-[70vh] overflow-auto">
            <EmployeeForm onSuccess={() => setOpenAdd(false)} />
          </div>
        </ResponsiveDialog>
      </div>
      {data && (
        <DataTable
          columns={columns}
          data={data}
          onDelete={handleDelete}
          onPrint={handlePrint}
        />
      )}
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
              onClick={() => deleteOne(selected as string)}
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
