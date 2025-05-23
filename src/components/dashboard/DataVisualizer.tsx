
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, Cell
} from "recharts";

interface DataPoint {
  name: string;
  [key: string]: number | string;
}

interface DataVisualizerProps {
  title: string;
  description?: string;
  type: "line" | "bar" | "pie";
  data: DataPoint[];
  dataKeys: string[];
  colors?: string[];
  className?: string;
  XAxisLabel?: string;
  YAxisLabel?: string;
  height?: number;
}

export default function DataVisualizer({
  title,
  description,
  type,
  data,
  dataKeys,
  colors = ["#0A2463", "#247BA0", "#2A9D8F", "#F4A261", "#E76F51"],
  className = "",
  XAxisLabel,
  YAxisLabel,
  height = 300,
}: DataVisualizerProps) {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                height={40}
                label={XAxisLabel ? { value: XAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
                label={YAxisLabel ? { value: YAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                  borderColor: '#374151',
                  borderRadius: '0.375rem',
                  fontSize: '12px'
                }} 
              />
              <Legend verticalAlign="top" height={36} />
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                height={40}
                label={XAxisLabel ? { value: XAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
                label={YAxisLabel ? { value: YAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                  borderColor: '#374151',
                  borderRadius: '0.375rem',
                  fontSize: '12px'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKeys[0]}
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                  borderColor: '#374151',
                  borderRadius: '0.375rem',
                  fontSize: '12px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
