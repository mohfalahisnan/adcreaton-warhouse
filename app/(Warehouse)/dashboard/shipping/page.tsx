"use client";
import { CheckCircle2, File, Plus, Printer, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteOrder, getOrder } from "@/lib/actions/order";
import { formatDate } from "@/lib/formatDate";
import { formatRupiah } from "@/lib/formatRupiah";
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
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { queryClient } from "@/components/provider";
import { Order } from "@prisma/client";
import { useLocalStorage } from "@/hook/useLocalstorage";
import { useRouter } from "next/navigation";
import { deleteShipment, getShipment } from "@/lib/actions/shipping";

export default function Shipping() {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useQuery({
    queryKey: ["shipment"],
    queryFn: async () => await getShipment(parseInt(warehouseId)),
  });
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [selected, setSelected] = useState<string>();
  const deleteQuery = useMutation({
    mutationFn: async (id: string) => await deleteShipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipment"] });
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
              <h3 className="text-lg">Shipment Deleted!</h3>
            </div>
          </div>
        ),
      });
    },
    onError(error) {
      toast({
        title: `Error`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });
  const handleDelete = (id: string) => {
    deleteQuery.mutate(id);
  };

  if (!data) return null;
  return (
    <main>
      <div className="mb-4">
        <div className="flex justify-end items-center">
          <div className="flex gap-2">
            <Link href={"/dashboard/transaction/add"}>
              <Button size={"sm"} className="flex items-center gap-2">
                <Plus size={12} /> Transaction
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export</span>
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shipment Code</TableHead>
            <TableHead className="hidden sm:table-cell">Car</TableHead>
            <TableHead className="hidden sm:table-cell">
              Shipment Date
            </TableHead>
            <TableHead className="hidden md:table-cell">
              Delivery Date
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => {
            return (
              <TableRow key={i}>
                <TableCell>{item.shipment_code}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.Car?.plat_nomor}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(item.shippedDate)}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {item.deliveryDate ? formatDate(item.deliveryDate) : "-"}
                </TableCell>

                <TableCell className="flex items-center gap-2 justify-center">
                  <Button size={"xs"}>
                    <Printer size={16} />
                  </Button>

                  <Button
                    size={"xs"}
                    variant={"destructive"}
                    onClick={() => {
                      setSelected(item.shipment_id);
                      setOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

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
              onClick={() => handleDelete(selected as string)}
              className="bg-destructive hover:bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
