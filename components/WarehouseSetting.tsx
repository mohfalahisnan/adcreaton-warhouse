"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Condition from "./Condition";
import { WarehouseForm } from "./WarehouseForm";
import WarehouseListSetting from "./WarehouseListSetting";

const WarehouseSetting = () => {
  const [state, setState] = useState<"table" | "add">("table");
  return (
    <div>
      <Condition show={state === "table"}>
        <Button onClick={() => setState("add")}>Add Warehouse</Button>
      </Condition>
      <Condition show={state === "add"}>
        <Button onClick={() => setState("table")}>Warehouse List</Button>
      </Condition>
      <div className="mt-4 max-h-200 overflow-auto">
        <Condition show={state === "add"}>
          <WarehouseForm />
        </Condition>
        <Condition show={state === "table"}>
          {/* <TableUsers role="ADMIN" /> */}
          <WarehouseListSetting />
        </Condition>
      </div>
    </div>
  );
};

export default WarehouseSetting;
