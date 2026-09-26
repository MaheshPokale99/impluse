"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type { EntryRecord } from "@/lib/students/fields";

const config = {
    averageScore: { label: "Average score", color: "var(--chart-1)" },
    lastTestScore: { label: "Last test", color: "var(--chart-2)" },
    dppCompletion: { label: "DPP completion", color: "var(--chart-3)" },
} satisfies ChartConfig;

const shortDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
});

type ScorePoint = Pick<EntryRecord, "date" | "averageScore" | "lastTestScore" | "dppCompletion">;

export function ProgressChart({ entries }: { entries: ScorePoint[] }) {
    const points = entries.toSorted((a, b) => a.date.localeCompare(b.date));
    if (points.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                The chart fills in as daily rows are added.
            </p>
        );
    }
    return (
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
            <LineChart data={points} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                    tickFormatter={(value: string) => shortDate.format(new Date(value))}
                />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={44} unit="%" />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            labelFormatter={(value) => shortDate.format(new Date(String(value)))}
                        />
                    }
                />
                <ChartLegend content={<ChartLegendContent />} />
                {Object.keys(config).map((key) => (
                    <Line
                        key={key}
                        dataKey={key}
                        type="monotone"
                        stroke={`var(--color-${key})`}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                        isAnimationActive={false}
                    />
                ))}
            </LineChart>
        </ChartContainer>
    );
}
