"use client";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addRetur, getOrderItem } from "@/lib/actions/order";
import { queryClient } from "@/components/provider";
import { useRouter } from "next/navigation";

function ReturAction({ id, title }: { id: string; title?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [qty, setQty] = useState(0);
  const { data } = useQuery({
    queryKey: ["order-item", id],
    queryFn: async () => await getOrderItem(id),
  });
  const route = useRouter();
  const orderItem = data;
  const mutation = useMutation({
    mutationFn: async () =>
      await addRetur(orderItem?.order_id || "", id, qty, ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-item", id] });
      route.refresh();
      setIsOpen(false);
    },
  });
  return (
    <ResponsiveDialog
      title={title ? title : "Retur"}
      description=""
      triggerTitle={title ? title : "Retur"}
      className="sm:max-w-xl"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      {orderItem?.product.name} = {orderItem?.quantity}
      {orderItem?.satuan?.name}
      <Input
        type="number"
        name="qty"
        onChange={(e) => setQty(Number(e.target.value))}
      />
      <div className="flex justify-end mt-4">
        <Button onClick={() => mutation.mutate()}>Save</Button>
      </div>
    </ResponsiveDialog>
  );
}

export default ReturAction;
