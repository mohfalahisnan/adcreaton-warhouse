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
import { useDeleteCategory } from "@/hook/useCategory";
import { Category } from "@prisma/client";
import {
  CheckCircle2,
  MoreVertical,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type Props = {
  data: Category[];
};

const TableCategory = ({ data }: Props) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number>(0);
  const { toast } = useToast();
  const router = useRouter();
  const deleteQuery = useDeleteCategory({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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
              <h3 className="text-lg">Category deleted!</h3>
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

  const handleDelete = async (id: number) => {
    deleteQuery.mutate(id);
  };

  return (
    <>
      <Table>
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => {
            return (
              <TableRow key={i + item.category_id}>
                <TableCell className="text-center w-8">{i + 1}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
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
                      <DropdownMenuItem className="flex flex-row gap-2">
                        <PencilIcon size={14} /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setOpen(true);
                          setSelected(item.category_id);
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
                setSelected(0);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(selected)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TableCategory;
