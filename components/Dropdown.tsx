import React from "react";
import { Button } from "./ui/button";

type Props = {
  triggerContent: JSX.Element;
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Dropdown = ({ triggerContent, children, open, setOpen }: Props) => {
  return (
    <div className="relative">
      <Button variant={"ghost"} size={"xs"} asChild>
        {triggerContent}
      </Button>
      <div className={`absolute z-50 ${!open && "hidden"}`}>{children}</div>
    </div>
  );
};

export default Dropdown;
