import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from "recharts"

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function OverviewChart({ data }: { data: { name: string; value: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export function SpeciesChart({ data }: { data: { name: string; value: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    )
}
