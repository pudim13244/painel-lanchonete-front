import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SalesChartProps {
  data: Array<{ name: string; vendas: number }>;
  formatCurrency: (value: number) => string;
}

interface OrderTypeChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export const SalesChart = ({ data, formatCurrency }: SalesChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Vendas']} />
            <Bar dataKey="vendas" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B21735" />
                <stop offset="100%" stopColor="#EDE2DC" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const OrderTypeChart = ({ data }: OrderTypeChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Tipo de Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 