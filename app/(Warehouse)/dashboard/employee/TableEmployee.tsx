import DeleteAlert from "@/components/DeleteAlert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@prisma/client";
import { EyeIcon, MoreVertical, PencilIcon, TrashIcon } from "lucide-react";
import React, { useState } from "react";

type Props = {
  data: User[];
};

const TableEmployee = ({ data }: Props) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>();
  const handleDelete = (id: string) => {
    console.log(id);
  };
  return (
    <>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={"ghost"} size={"icon"}>
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="flex flex-row gap-2">
                        <EyeIcon size={14} /> Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-row gap-2">
                        <PencilIcon size={14} /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setOpen(true);
                          setSelected(item.user_id);
                        }}
                        className="flex flex-row gap-2 text-red-500"
                      >
                        <TrashIcon size={14} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
              {selected}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpen(false);
                setSelected(undefined);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(selected as string)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TableEmployee;
