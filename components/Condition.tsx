import React, { ReactNode } from "react";

const Condition = ({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) => {
  return <>{show ? children : ""}</>;
};

export default Condition;
