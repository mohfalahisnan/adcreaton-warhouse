"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { IQueryItem } from "./TransactionForm";
import { UseMutationResult } from "@tanstack/react-query";

const TransactionPlusButton = ({
  item,
  query,
}: {
  item: IQueryItem;
  query: UseMutationResult<null | undefined, Error, IQueryItem, unknown>;
}) => {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const handleSave = async () => {
    item.quantity = qty;
    query.mutate({
      product: item.product,
      notes: item.notes,
      quantity: qty,
    });
    setOpen(false);
    setQty(1);
  };
  return (
    <>
      <div>
        <Button
          variant={"outline"}
          size={"icon"}
          className="w-8 h-8"
          onClick={() => setOpen(true)}
        >
          <Plus size={18} />
        </Button>
      </div>
      <div
        className={`fixed top-0 left-0 w-full h-screen z-50 bg-black/20 flex items-center justify-center ${!open && "hidden"}`}
        onClick={() => setOpen(false)}
      >
        <div
          className="p-4 bg-card shadow-xl flex  rounded-md"
          onClick={(e) => e.stopPropagation()}
        >
          <form action={handleSave} className="flex">
            <Input
              type="number"
              value={qty}
              onChange={(e) => setQty(parseFloat(e.target.value))}
              autoFocus={true}
            />
            <Button
              variant={"outline"}
              size={"icon"}
              type="submit"
              className="w-10 h-10 ml-2"
            >
              <Plus size={18} />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default TransactionPlusButton;
