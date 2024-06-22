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
  defaultValue?: number;
};

const SelectCategory: React.FC<Props> = ({ data, form, defaultValue }) => {
  return (
    <Select
      onValueChange={(value) => form.setValue("category_id", parseInt(value))}
      defaultValue={defaultValue?.toString()}
    >
      <SelectTrigger className="capitalize">
        <SelectValue className="capitalize" placeholder="select category..." />
      </SelectTrigger>
      <SelectContent>
        {data.map((item, i) => (
          <SelectItem
            value={item.category_id.toString()}
            className="capitalize"
            key={i + item.category_id}
          >
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectCategory;
