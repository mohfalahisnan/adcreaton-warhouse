"use client";
import { getWarehouses } from "@/lib/actions/warehouse";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import Condition from "./Condition";

const WarehouseListSetting = () => {
  const [edit, setEdit] = useState(false);
  const [selected, setSelected] = useState<number>();
  const query = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });
  return (
    <div>
      {query.isLoading && <h3>Loading...</h3>}
      <Condition show={!edit}>
        <Table>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.map((item) => {
              return (
                <TableRow key={item.warehouse_id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2">
                    <Button
                      size={"xs"}
                      onClick={() => {
                        setEdit(true);
                        setSelected(item.warehouse_id);
                      }}
                    >
                      Edit
                    </Button>
                    <Button size={"xs"} variant={"destructive"}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Condition>

      <Condition show={edit}>
        <Button
          onClick={() => {
            setSelected(undefined);
            setEdit(false);
          }}
        >
          Cancel
        </Button>
      </Condition>
    </div>
  );
};

export default WarehouseListSetting;
