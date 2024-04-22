"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import useMediaQuery from "@/hook/useMediaQuery";

interface DrawerDialogDemoProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  actionButtons?: React.ReactNode;
  triggerTitle?: string;
  triggerContent?: React.ReactNode;
  open?: boolean; // Menambahkan prop open
  onOpenChange?: (open: boolean) => void; // Menambahkan prop onOpenChange
}

export function ResponsiveDialog({
  title,
  description,
  children,
  actionButtons,
  triggerTitle = "Open",
  triggerContent,
  open,
  onOpenChange,
}: DrawerDialogDemoProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open || isOpen} onOpenChange={onOpenChange || setIsOpen}>
        <DialogTrigger asChild>
          {triggerContent ? (
            triggerContent
          ) : (
            <Button variant="outline">{triggerTitle}</Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="capitalize">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter>{actionButtons}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open || isOpen} onOpenChange={onOpenChange || setIsOpen}>
      <DrawerTrigger asChild>
        {triggerContent ? (
          triggerContent
        ) : (
          <Button variant="outline">{triggerTitle}</Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="capitalize">{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {children}
        <DrawerFooter className="pt-2">{actionButtons}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
