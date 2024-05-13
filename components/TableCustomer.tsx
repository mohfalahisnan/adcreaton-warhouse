import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { queryClient } from "@/components/provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import { useToast } from "@/components/ui/use-toast";
import { useDeleteEmployee } from "@/hook/useEmployee";
import { deleteCustomer } from "@/lib/actions/customer";
import { Customer, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  MoreVertical,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type Props = {
  data: Customer[];
};

const TableCustomer = ({ data }: Props) => {
  const [open, setOpen] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [selected, setSelected] = useState<number>();
  const { toast } = useToast();
  const router = useRouter();
  const deleteData = useMutation({
    mutationFn: async (id: number) => await deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
      router.refresh();
      setOpen(false);
      toast({
        description: (
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-green-500">
                <CheckCircle2 size={28} strokeWidth={1} />
              </span>
            </div>
            <div>
              <h3 className="text-lg">Customer Delete!</h3>
            </div>
          </div>
        ),
      });
    },
    onError(error) {
      toast({
        title: `Error: ${error.message}`,
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = async (id: string) => {};

  const handleDelete = async (id: number) => {
    deleteData.mutate(id);
  };

  return (
    <>
      <Table>
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="hidden md:table-cell">Alamat</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => {
            return (
              <TableRow key={i + item.customer_id}>
                <TableCell className="text-center w-8">{i + 1}</TableCell>
                <TableCell>
                  <ResponsiveDialog
                    title={item.name}
                    description=""
                    triggerContent={<h3 className="capitalize">{item.name}</h3>}
                    actionButtons={<></>}
                  >
                    Nama: {item.name}
                    <br />
                    Phone: {item.phone}
                  </ResponsiveDialog>
                </TableCell>
                <TableCell>{item.phone || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.alamat || "-"}
                </TableCell>

                <TableCell className="text-right w-5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={"ghost"} size={"icon"}>
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {/* <DropdownMenuItem className="flex flex-row gap-2">
                        <EyeIcon size={14} /> Detail
                      </DropdownMenuItem> */}

                      <DropdownMenuItem
                        onClick={() => setEditForm(true)}
                        className="flex flex-row gap-2"
                      >
                        <PencilIcon size={14} /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setOpen(true);
                          setSelected(item.customer_id);
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
              This action cannot be undone. This will permanently delete and
              remove your data from our servers.
              {/* {selected} */}
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
            <AlertDialogAction
              onClick={() => handleDelete(selected as number)}
              className="bg-destructive hover:bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TableCustomer;
