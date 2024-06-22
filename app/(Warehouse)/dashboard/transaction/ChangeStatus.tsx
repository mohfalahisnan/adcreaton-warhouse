"use client";
import { queryClient } from "@/components/provider";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getOrderById, updateOrderStatus } from "@/lib/actions/order";
import { cn } from "@/lib/utils";
import { StatusOrder } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import React, { useEffect, useState } from "react";

const status = ["ON_DELEVERY", "PENDING", "SUCCESS", "FAILED", "CANCELED"];

const ChangeStatus = ({ id }: { id: string }) => {
  const [value, setValue] = useState<StatusOrder>();
  const order = useQuery({
    queryKey: ["order", id],
    queryFn: async () => await getOrderById(id),
  });
  const [open, setOpen] = useState(false);

  const updateStatus = useMutation({
    mutationFn: async () => await updateOrderStatus(id, value as StatusOrder),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });

  useEffect(() => {
    if (value === "SUCCESS") {
      return alert("Apa ada barang retur?");
    }
    updateStatus.mutate();
  }, [value]);

  if (order.isLoading) return <>Loading...</>;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-start p-0 h-auto text-left capitalize"
        >
          {order.data?.status}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {status.map((stat) => (
                <CommandItem
                  key={stat}
                  value={stat}
                  onSelect={(currentValue) => {
                    setOpen(false);
                    setValue(currentValue as StatusOrder);
                  }}
                  className="capitalize"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      stat === order.data?.status ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {stat}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ChangeStatus;
