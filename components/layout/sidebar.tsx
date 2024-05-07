"use client";
import { ChevronsUpDown, Plus } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import SidebarNavigation from "./sidebar-navigation";
import { useLocalStorage } from "@/hook/useLocalstorage";
import Image from "next/image";
import { useGetWarehouses } from "@/hook/useWarehouse";
import { Warehouse } from "@prisma/client";

function filterById(items: Warehouse[], id: string): Warehouse[] {
  return items.filter((item) => item.warehouse_id === parseFloat(id));
}

const Sidebar = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useGetWarehouses({});
  if (!data) return null;
  const selected = filterById(data, warehouseId);
  return (
    <div className="hidden md:flex flex-col flex-shrink-0 min-h-screen bg-foreground text-background w-52">
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-center text-xl w-full mb-4 font-bold">
          <Image
            src={"/logo.png"}
            width={200}
            height={100}
            alt="logo"
            className="w-3/4"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              size={"sm"}
              className="bg-foreground flex justify-between w-full rounded"
            >
              {selected[0].name}
              <ChevronsUpDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[13rem]">
            {data.map((item, i) => {
              return (
                <DropdownMenuItem
                  key={i}
                  onSelect={() => setWarehouseId(item.warehouse_id.toString())}
                >
                  {item.name}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuItem>
              <Plus size={14} />
              Add
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SidebarNavigation />
    </div>
  );
};

export default Sidebar;
