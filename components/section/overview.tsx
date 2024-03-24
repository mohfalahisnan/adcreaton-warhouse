import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

type Props = {
  title: string;
  value: number;
  lastweak: number;
  unit: string;
};

const Overview = ({ title, value, lastweak, unit }: Props) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3>{title}</h3>
        <h3 className="text-3xl font-semibold">{value}</h3>
        <div className="flex items-center gap-1 text-sm">
          <Badge
            className="text-[8px]  h-4 px-1 py-[1px]"
            variant={lastweak >= value ? "destructive" : "success"}
          >
            {lastweak >= value ? "-" : "+"} {lastweak}
            {unit}
          </Badge>
          <span> from last weak</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default Overview;
