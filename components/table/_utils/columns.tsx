"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ColumnHeader } from "../ColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRupiah } from "@/lib/formatRupiah";

type DeepKeys<T> = T extends object
  ? {
      [K in keyof T & string]: `${K}` | `${K}.${DeepKeys<T[K]>}`;
    }[keyof T & string]
  : never;

export type ColumnConfig<T> = {
  accessorKey: DeepKeys<T>;
  title: string;
  type?: "date" | "number" | "string" | "currency";
  extends?: DeepKeys<T>[];
};

export type ActionConfig<T> = {
  label: string;
  onClick: (row: T) => void;
};

export type CreateColumnsProps<T> = {
  columns: ColumnConfig<T>[];
  actions: ActionConfig<T>[];
};
const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((value, key) => value?.[key], obj);
};
export const createColumns = <T extends Record<string, any>>({
  columns,
  actions,
}: CreateColumnsProps<T>): ColumnDef<T>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  ...columns.map((column) => ({
    accessorKey: column.accessorKey,
    header: ({ column: col }: { column: ColumnDef<T> }) => (
      <ColumnHeader column={col as any} title={column.title} />
    ),
    cell: ({ row }: { row: any }) => {
      const cellValue = getNestedValue(
        row.original,
        column.accessorKey as string
      );

      if (column.type === "date") {
        const date = new Date(cellValue);
        return date.toLocaleDateString(); // Adjust the format here if needed
      } else if (column.type === "currency") {
        return `Rp ${formatRupiah(cellValue)}`;
      }
      return (
        <>
          <h3>{cellValue}</h3>
          {column.extends &&
            column.extends.map((key, i) => (
              <h3 key={i}>{getNestedValue(row.original, key)}</h3>
            ))}
        </>
      );
    },
  })),
  {
    id: "actions",
    cell: ({ row }: { row: any }) => {
      const rowData = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick(rowData)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
