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

type Props = {};

const Sidebar = (props: Props) => {
  const [value, setValue] = React.useState("Warehouse 1");
  const strg = useLocalStorage("warehouse-id", value);
  useEffect(() => {
    strg[1](value);
  }, [value]);
  useEffect(() => {}, []);
  return (
    <div className="hidden md:flex flex-col flex-shrink-0 min-h-screen bg-foreground text-background w-52">
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-left text-xl w-full mb-4 font-bold">
          Dashboard<span className="text-primary text-3xl">.</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              size={"sm"}
              className="bg-foreground flex justify-between w-full rounded"
            >
              {value} <ChevronsUpDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[13rem]">
            <DropdownMenuItem onSelect={() => setValue("Warehouse 1")}>
              Warehouse 1
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setValue("Warehouse 2")}>
              Warehouse 2
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setValue("Warehouse 3")}>
              Warehouse 3
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setValue("Warehouse 1")}>
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
