"use client";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";

import React, { useState } from "react";
import TableEditItem from "./TableEditItem";

const EditOrderItem = ({
  orderId,
  orderItemId,
}: {
  orderId: string;
  orderItemId: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <ResponsiveDialog
        title="Edit Order Item"
        description="Edit order item"
        open={open}
        onOpenChange={setOpen}
        triggerContent={<Button size={"xs"}>Edit</Button>}
      >
        <TableEditItem
          orderId={orderId}
          setOpen={setOpen}
          orderItemId={orderItemId}
        />
      </ResponsiveDialog>
    </div>
  );
};

export default EditOrderItem;
