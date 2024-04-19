import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Category } from "@prisma/client";
import { UseFormReturn } from "react-hook-form";


type Props = {
  data: Category[];
  form: UseFormReturn<any>;
};

const SelectCategory = ({ data, form }: Props) => {
  return (
    <Select
      onValueChange={(value) => form.setValue("category_id", parseInt(value))}
    >
      <SelectTrigger className="capitalize">
        <SelectValue className="capitalize" placeholder="select category..." />
      </SelectTrigger>
      <SelectContent>
        
       {data.map((item, i) => {
            return (
              <SelectItem
                value={item.category_id.toString()}
                className="capitalize"
                key={i + item.category_id}
              >
                {item.name}
              </SelectItem>
            );
        })}
      
      </SelectContent>
    </Select>
  );
};

export default SelectCategory;
