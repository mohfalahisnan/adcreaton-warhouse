import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@prisma/client";
import { MoreVertical } from "lucide-react";
import React from "react";

type Props = {
  data: User[];
};

const TableEmployee = ({ data }: Props) => {
  return (
    <Table>
      <TableHeader className="bg-accent">
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead className="hidden md:table-cell">Position</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, i) => {
          return (
            <TableRow key={i + item.user_id}>
              <TableCell className="text-center w-8">{i + 1}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.phone || "-"}</TableCell>
              <TableCell className="hidden md:table-cell">
                {item.email || "-"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {item.position || "-"}
              </TableCell>
              <TableCell className="text-right w-5">
                <Button variant={"ghost"} size={"icon"}>
                  <MoreVertical size={18} />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TableEmployee;
