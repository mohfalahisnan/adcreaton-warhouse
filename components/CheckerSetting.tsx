"use client";
import React, { useState } from "react";
import TableUsers from "./TableUsers";
import { Button } from "./ui/button";
import Condition from "./Condition";
import CheckerForm from "./CheckerForm";

type Props = {};

const CheckerSetting = (props: Props) => {
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
        {state === "add" && <CheckerForm onSuccess={() => setState("table")} />}
        {state === "table" && <TableUsers role="CHECKER" />}
      </div>
    </div>
  );
};

export default CheckerSetting;
