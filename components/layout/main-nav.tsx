import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Props = {};

const MainNav = (props: Props) => {
  return (
    <nav className="h-16 flex justify-between items-center text-background">
      <div></div>
      <div className="px-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
};

export default MainNav;
