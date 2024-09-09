"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  VisibilityState,
  SortingState,
  ColumnFiltersState,
  FilterFn,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown, Trash } from "lucide-react";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { TablePage } from "./TablePage";
import Condition from "../Condition";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDelete: (selectedRows: TData[]) => void;
  onPrint: (selectedRows: TData[]) => void;
  printButton?: boolean;
  deleteButton?: boolean;
  withSelected?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDelete,
  onPrint,
  printButton = true,
  deleteButton = true,
  withSelected = true,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const customFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const name = row.getValue("name");
    const notes = row.getValue("notes");
    const desc = row.getValue("inputBy");
    const status = row.getValue("status");
    const method = row.getValue("method");
    const productName = row.original?.product?.name;
    const customer = row.original?.customer_name?.name;
    const sales = row.original?.sales_name?.name;
    const date = row.getValue("createdAt");

    // Convert user input date from dd-MM-yyyy to Date object
    const filterDate = new Date(filterValue.split("-").reverse().join("-"));

    // Convert stored date string to Date object
    const storedDate = date ? new Date(date as any) : null;

    // Check if the dates match (ignoring time)
    const isDateMatch = storedDate
      ? storedDate.getFullYear() === filterDate.getFullYear() &&
        storedDate.getMonth() === filterDate.getMonth() &&
        storedDate.getDate() === filterDate.getDate()
      : false;

    return (
      method?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
      status?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
      customer?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
      sales?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
      name?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
      notes?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
      desc?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
      productName
        ?.toString()
        .toLowerCase()
        .includes(filterValue.toLowerCase()) ||
      isDateMatch ||
      false
    );
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: customFilter, // Use the custom filter function
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  return (
    <div className="w-full mt-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm h-9"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto" size={"sm"}>
              View <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Condition show={withSelected}>
        <div className="flex items-center justify-start space-x-2 py-4">
          <i className="text-muted-foreground">With selected :</i>
          {deleteButton && (
            <Button
              disabled={selectedRows.length <= 0}
              variant="outline"
              className="ml-auto"
              size={"sm"}
              onClick={() => setOpenDelete(true)}
            >
              Delete
            </Button>
          )}
          {printButton && (
            <Button
              disabled={selectedRows.length <= 0}
              variant="outline"
              className="ml-auto"
              size={"sm"}
              onClick={() => onPrint(selectedRows)}
            >
              Print
            </Button>
          )}
        </div>
      </Condition>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="items-start align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="my-4">
        <TablePage table={table} />
      </div>
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete the selected row(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDelete(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(selectedRows);
                setOpenDelete(false);
              }}
              className="bg-red-600 hover:bg-red-500 flex gap-2 items-center"
            >
              <Trash size={14} />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
