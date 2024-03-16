import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Plus } from "lucide-react";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Dashboard</h3>
          <div className="flex gap-2">
            <Button
              variant={"secondary"}
              size={"sm"}
              className="flex items-center gap-2"
            >
              <Plus size={12} /> Transaction
            </Button>
            <Button
              variant={"outline"}
              size={"sm"}
              className="flex items-center gap-2"
            >
              <Download size={12} /> Report
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Sales Performance</h3>
              <Select>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>Hallo</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Sales Performance</h3>
              <Select>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>Hallo</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
