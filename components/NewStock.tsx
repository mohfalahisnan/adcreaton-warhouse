import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMutation } from "@tanstack/react-query";
import { newStock, updateStock } from "@/lib/actions/stock";
import { queryClient } from "./provider";
import { toast } from "./ui/use-toast";
import { handlePrismaError } from "@/lib/handlePrismaError";

type Props = {
  productId: string;
  warehouseId: number;
};

const NewStock = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [stockNumber, setStockNumber] = useState(0);
  const update = useMutation({
    mutationFn: async () =>
      await newStock(props.productId, props.warehouseId, stockNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError(error) {
      const errorMessage = handlePrismaError(error);
      toast({
        title: `Error`,
        description: `${errorMessage}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (stockNumber <= 0) {
      alert("Value cannot be 0");
    } else {
      update.mutate();
    }
  };
  return (
    <>
      <div>
        <Button variant={"ghost"} size={"sm"} onClick={() => setOpen(true)}>
          No Data
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
          <Input
            type="number"
            value={stockNumber}
            onChange={(e) => setStockNumber(parseFloat(e.target.value))}
          />
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </>
  );
};

export default NewStock;
