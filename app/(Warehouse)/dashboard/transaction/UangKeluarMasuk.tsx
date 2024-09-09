"use client";
import { Button } from "@/components/ui/button";
import { createPayment2 } from "@/lib/actions/payment";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/components/provider";
import { useSession } from "next-auth/react";
import { PaymentMethod } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/hook/useLocalstorage";

const UangKeluarMasuk = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full text-center flex items-center justify-center">
      <Button size={"sm"} onClick={() => setOpen(true)}>
        Uang Keluar/Masuk
      </Button>
      {open && <Bayar setOpen={setOpen} />}
    </div>
  );
};

export default UangKeluarMasuk;

const Bayar = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const session = useSession();
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const [amount, setAmount] = useState<number>(0);
  const [minus, setMinus] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [note, setNote] = useState<string>();
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const create = await createPayment2({
        amount: minus ? (amount || 0) * -1 : amount || 0,
        inputBy: session?.data?.user?.name || "",
        method: method || "CASH",
        notes: note || "",
        warehouse: {
          connect: {
            warehouse_id: parseFloat(warehouseId),
          },
        },
      });
      return create;
    },

    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["payment"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
  const handleSave = () => {
    createPaymentMutation.mutate();
  };

  return (
    <div
      className="fixed bg-black/50 z-50 w-full h-full top-0 left-0 flex items-center justify-center"
      //   onClick={() => setOpen(false)}
    >
      <div className="bg-card w-full max-w-sm rounded-lg p-4 text-left">
        <div className="flex gap-2">
          <Button
            onClick={() => setMinus(false)}
            variant={!minus ? "default" : "outline"}
          >
            Masuk
          </Button>
          <Button
            onClick={() => setMinus(true)}
            variant={minus ? "default" : "outline"}
          >
            Keluar
          </Button>
        </div>
        <div>
          <Input
            className="mt-4"
            type="number"
            placeholder={`1.000.000`}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="my-2">
            <Select
              value={method}
              onValueChange={(e) => setMethod(e as PaymentMethod)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Catatan"
            value={note}
            className="mb-4"
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex flex-row items-center justify-center gap-2">
            <Button type="submit" onClick={handleSave}>
              Save
            </Button>
            <Button variant={"outline"} onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
