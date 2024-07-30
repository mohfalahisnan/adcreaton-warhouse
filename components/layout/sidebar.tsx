"use client";
import { ChevronsUpDown } from "lucide-react";
import React from "react";
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
import { filterById } from "@/lib/filterById";
import { useRouter } from "next/navigation";
import { useSetting } from "@/hook/useSetting";
import { useSession } from "next-auth/react";

const Sidebar = () => {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const session = useSession();
  const { data } = useGetWarehouses({});
  const setting = useSetting({});
  console.log(data);
  console.log(setting.data);

  const router = useRouter();
  if (!session || !session.data) return null;
  if (!data)
    return (
      <div className="hidden md:flex flex-col flex-shrink-0 min-h-screen bg-primary text-background w-52"></div>
    );
  if (!setting.data)
    return (
      <div className="hidden md:flex flex-col flex-shrink-0 min-h-screen bg-primary text-background w-52"></div>
    );

  const selected = filterById(data, warehouseId);

  return (
    <div className="hidden md:flex flex-col flex-shrink-0 min-h-screen bg-primary text-background w-52">
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-center text-xl w-full mb-4 font-bold">
          <Image
            src={setting.data.web_logo}
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
              className="bg-primary flex justify-between w-full rounded"
              // disabled={session.data.user.ROLE !== "ADMIN"}
            >
              {selected[0]?.name}
              <ChevronsUpDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[13rem]">
            {data.map((item, i) => {
              return (
                <DropdownMenuItem
                  key={i}
                  onSelect={() => {
                    setWarehouseId(item.warehouse_id.toString());
                    router.refresh();
                  }}
                >
                  {item.name}
                </DropdownMenuItem>
              );
            })}
            {/* <DropdownMenuItem>
              <Plus size={14} />
              Add
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SidebarNavigation />
    </div>
  );
};

export default Sidebar;
