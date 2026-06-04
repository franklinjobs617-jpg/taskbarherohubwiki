"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PricePoint { timestamp: string; price: number; listings: number; }

type Props = { data: PricePoint[]; height?: number };

export function PriceChart({ data, height = 200 }: Props) {
  if (data.length < 2) {
    return <div className="flex items-center justify-center text-[11px] text-[#6c6c6c]" style={{ height }}>Not enough data for chart</div>;
  }
  const chartData = data.map((p) => ({
    ...p,
    date: new Date(p.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#555" }} axisLine={{ stroke: "#333" }} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "#555" }} axisLine={{ stroke: "#333" }} tickLine={false} width={50} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 2, fontSize: 11 }}
          labelStyle={{ color: "#888" }}
        />
        <Line type="monotone" dataKey="price" stroke="#d4a017" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
