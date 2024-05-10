"use client";
import React, { useState } from "react";
import UserForm from "./UserForm";
import TableUsers from "./TableUsers";
import { Button } from "./ui/button";
import Condition from "./Condition";

type Props = {};

const UserSetting = (props: Props) => {
  const [state, setState] = useState<"table" | "add">("table");
  return (
    <div>
      <Condition show={state === "table"}>
        <Button onClick={() => setState("add")}>Add User</Button>
      </Condition>
      <Condition show={state === "add"}>
        <Button onClick={() => setState("table")}>Users List</Button>
      </Condition>
      <div className="mt-4 max-h-200 overflow-auto">
        {state === "add" && <UserForm onSuccess={() => setState("table")} />}
        {state === "table" && <TableUsers />}
      </div>
    </div>
  );
};

export default UserSetting;
