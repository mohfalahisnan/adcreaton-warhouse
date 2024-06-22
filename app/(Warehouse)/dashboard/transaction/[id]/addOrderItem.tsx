"use client";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";

import React, { useState } from "react";
import TableNewItem from "./TableNewItem";

const AddOrderItem = ({ orderId }: { orderId: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <ResponsiveDialog
        title="Add Product"
        description="Add product to order"
        open={open}
        onOpenChange={setOpen}
        triggerContent={<Button>Add Product</Button>}
      >
        <TableNewItem orderId={orderId} setOpen={setOpen} />
      </ResponsiveDialog>
    </div>
  );
};

export default AddOrderItem;
