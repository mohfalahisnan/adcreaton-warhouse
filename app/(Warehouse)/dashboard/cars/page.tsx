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
import { useLocalStorage } from "@/hook/useLocalstorage";
import { useRouter } from "next/navigation";
import { deleteCar, getCars } from "@/lib/actions/car";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import CarForm from "@/components/CarForm";

export default function Dashboard() {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => await getCars(parseInt(warehouseId)),
  });
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [selected, setSelected] = useState<string>();
  const deleteQuery = useMutation({
    mutationFn: async (id: string) => await deleteCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
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
              <h3 className="text-lg">Car Deleted!</h3>
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
            <ResponsiveDialog
              title="Add Car"
              description=""
              triggerContent={
                <Button size={"sm"} className="flex items-center gap-2">
                  <Plus size={12} /> Car
                </Button>
              }
              open={open1}
              onOpenChange={setOpen1}
            >
              <div className="max-h-[70vh] overflow-auto">
                <CarForm onSuccess={() => setOpen1(false)} />
              </div>
            </ResponsiveDialog>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Car</TableHead>
            <TableHead className="hidden sm:table-cell">Catatan</TableHead>
            <TableHead className="hidden md:table-cell">Kelengkapan</TableHead>
            <TableHead className="hidden md:table-cell">Note</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => {
            return (
              <TableRow key={i}>
                <TableCell>
                  <div className="font-bold">{item.nama}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {item.plat_nomor}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.catatan_perbaikan || "-"}
                  <br />
                  Tanggal KIR : {item.tanggal_kir}
                  <br />
                  Tanggal Pajak : {item.tanggal_pajak}
                  <br />
                  Tanggal STNK : {item.tanggal_stnk}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {item.kelengkapan || "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.note || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {item.available ? (
                    <Badge className="text-xs" variant="success">
                      Available
                    </Badge>
                  ) : (
                    <Badge className="text-xs" variant="processing">
                      UnAvailable
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      setSelected(item.car_id);
                      setOpen(true);
                    }}
                    size={"xs"}
                    variant={"destructive"}
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
