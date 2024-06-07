import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Customer, Product, Satuan } from "@prisma/client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Check } from "lucide-react";
import { useState } from "react";

export const CustomerSelect = ({
  data,
  value,
  setValue,
}: {
  data: Customer[];
  value: Customer;
  setValue: React.Dispatch<React.SetStateAction<Customer | undefined>>;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-start p-0 h-auto text-left capitalize"
        >
          {value
            ? data.find((customer) => customer === value)?.name
            : "Select Customer..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Customer..." />
          <CommandList>
            <CommandEmpty>No customers found.</CommandEmpty>
            <CommandGroup>
              {data?.length > 0 &&
                data.map((customer) => (
                  <CommandItem
                    key={customer.customer_id}
                    value={customer.name}
                    onSelect={() => {
                      setValue((prev) =>
                        prev === customer ? undefined : customer,
                      );
                      setOpen(false);
                    }}
                    className="capitalize"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {customer.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const ProductSelect = ({
  data,
  value,
  setValue,
}: {
  data: Product[];
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="justify-start text-left capitalize"
        >
          {value
            ? data.find((product) => product.product_id === value)?.name
            : "Select Product..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search Product..." />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {data?.length > 0 &&
                data.map((product) => (
                  <CommandItem
                    key={product.product_id}
                    value={product.name}
                    onSelect={() => {
                      setValue((prev) =>
                        prev === product.product_id
                          ? undefined
                          : product.product_id,
                      );
                      setOpen(false);
                    }}
                    className="capitalize"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.product_id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {product.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const SatuanSelect = ({
  data,
  value,
  setValue,
}: {
  data: Satuan[];
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue placeholder="select unit" className="capitalize" />
      </SelectTrigger>
      <SelectContent>
        {data.map((satuan) => (
          <SelectItem
            key={satuan.satuan_id}
            value={satuan.satuan_id.toString()}
          >
            {satuan.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
