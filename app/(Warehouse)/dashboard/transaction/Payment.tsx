"use client";
import { Button } from "@/components/ui/button";
import { createPayment, getPaymentByOrderId } from "@/lib/actions/payment";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, XCircle } from "lucide-react";
import React, { useState } from "react";
import { TransactionTable } from "./page";
import { formatRupiah } from "@/lib/formatRupiah";
import { Input } from "@/components/ui/input";
import Condition from "@/components/Condition";
import { queryClient } from "@/components/provider";
import { useSession } from "next-auth/react";
import { updateOrderStatus } from "@/lib/actions/order";

const Payment = ({ data }: { data: TransactionTable }) => {
  const [open, setOpen] = useState(false);
  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", data.order_id],
    queryFn: async () => await getPaymentByOrderId(data.order_id),
    refetchOnWindowFocus: false,
  });
  return (
    <div className="w-full text-center flex items-center justify-center">
      {isLoading ? (
        <h2>Loading...</h2>
      ) : (
        <div>
          <Condition show={payment !== null}>
            <h2 className="text-green-500 flex flex-row items-center justify-center gap-2">
              <CheckIcon size={14} /> Payment Success
            </h2>
          </Condition>
          <Condition show={payment === null}>
            <div>
              <Button size={"xs"} onClick={() => setOpen(true)}>
                Bayar
              </Button>
              <h2 className="text-red-500 flex flex-row items-center justify-center gap-2">
                <XCircle size={14} /> No Payment Found
              </h2>
            </div>
          </Condition>
        </div>
      )}
      {open && <Bayar data={data} setOpen={setOpen} />}
    </div>
  );
};

export default Payment;

const Bayar = ({
  data,
  setOpen,
}: {
  data: TransactionTable;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const session = useSession();
  const [amount, setAmount] = useState<number>();
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const create = await createPayment({
        order: {
          connect: {
            order_id: data.order_id,
          },
        },
        amount: amount || 0,
        inputBy: session?.data?.user?.name || "",
      });
      if (create) {
        return await updateOrderStatus(data.order_id, "ON_DELEVERY");
      }
    },

    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["payment", data.order_id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
  const handleSave = () => {
    createPaymentMutation.mutate();
  };

  return (
    <div
      className="fixed bg-black/50 w-full h-full top-0 left-0 flex items-center justify-center"
      //   onClick={() => setOpen(false)}
    >
      <div className="bg-card w-full max-w-sm rounded-lg p-4 text-left">
        <div>
          <h2>Order Code: {data.order_code}</h2>
          <h2>Total Amount: Rp.{formatRupiah(data.totalAmount || 0)}</h2>
        </div>
        <div>
          <Input
            className="my-4"
            type="number"
            placeholder={`${formatRupiah(data.totalAmount || 0)}`}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          {amount && (data.totalAmount || 0) - amount !== 0 && (
            <h4
              className={`${(data.totalAmount || 0) - amount !== 0 && (data.totalAmount || 0) - amount >= 0 ? "text-red-500" : "text-foreground"}`}
            >
              Kembalian : Rp.
              {formatRupiah((data.totalAmount || 0) - amount)}
            </h4>
          )}
          <div className="flex flex-row items-center justify-center gap-2">
            <Button type="submit" onClick={handleSave}>
              Bayar
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
