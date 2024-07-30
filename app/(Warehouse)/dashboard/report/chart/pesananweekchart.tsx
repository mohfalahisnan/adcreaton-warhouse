"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { getOrdersDaily } from "@/lib/actions/order";
import { useLocalStorage } from "@/hook/useLocalstorage";

const chartConfig = {
  amount: {
    label: "amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function PesananDailyChart() {
  const [warehouseId, setWarehouseId] = useLocalStorage("warehouse-id", "1");
  const { data } = useQuery({
    queryKey: ["order", "daily"],
    queryFn: async () => await getOrdersDaily(parseFloat(warehouseId)),
  });
  console.log(data);
  if (!data) return null;
  const chartData = data;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Minggu ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          Total : {chartData.reduce((sum, item) => sum + item.count, 0)} pesanan
        </div>
        <ChartContainer config={chartConfig} className="w-full h-40">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="count"
              type="linear"
              fill="var(--color-amount)"
              fillOpacity={0.4}
              stroke="var(--color-amount)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
