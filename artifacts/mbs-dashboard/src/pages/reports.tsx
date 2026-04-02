import { Layout } from "@/components/layout";
import { useGetRevenueByMonth, getGetRevenueByMonthQueryKey, useGetProjectsByStatus, getGetProjectsByStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  pending: "Pendiente",
  completed: "Completado",
};

export default function Reports() {
  const { data: revenueData, isLoading: isLoadingRevenue } = useGetRevenueByMonth({ query: { queryKey: getGetRevenueByMonthQueryKey() } });
  const { data: statusData, isLoading: isLoadingStatus } = useGetProjectsByStatus({ query: { queryKey: getGetProjectsByStatusQueryKey() } });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  
  const COLORS = {
    active: 'hsl(var(--primary))',
    completed: 'hsl(var(--chart-2))',
    pending: 'hsl(var(--chart-3))'
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="border-b border-border/50 pb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-primary" />
            Análisis y Reportes
          </h1>
          <p className="text-muted-foreground mt-1">Análisis detallado de métricas financieras y operativas.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfica de ingresos */}
          <Card className="border-border/50 shadow-sm col-span-2">
            <CardHeader className="border-b border-border/50 bg-secondary/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Tendencia de Ingresos
                  </CardTitle>
                  <CardDescription className="mt-1">Ingresos estimados de proyectos en los últimos 6 meses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 min-h-[400px]">
              {isLoadingRevenue ? (
                <Skeleton className="h-full w-full rounded-xl bg-secondary/50" />
              ) : revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 2 }} 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'hsl(var(--card))', strokeWidth: 2, stroke: 'hsl(var(--primary))' }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">Sin datos disponibles</div>
              )}
            </CardContent>
          </Card>

          {/* Distribución por estado */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-secondary/10">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Pipeline de Proyectos
              </CardTitle>
              <CardDescription className="mt-1">Distribución de proyectos por estado actual</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 min-h-[300px] flex items-center justify-center">
              {isLoadingStatus ? (
                <Skeleton className="h-64 w-64 rounded-full bg-secondary/50" />
              ) : statusData && statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || 'hsl(var(--muted))'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string) => [value, STATUS_LABELS[name] ?? name]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-foreground">{STATUS_LABELS[value] ?? value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground">Sin datos disponibles</div>
              )}
            </CardContent>
          </Card>

          {/* Gráfica de barras por estado */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-secondary/10">
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Volumen por Estado
              </CardTitle>
              <CardDescription className="mt-1">Conteo absoluto de proyectos por estado</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 min-h-[300px]">
              {isLoadingStatus ? (
                <Skeleton className="h-full w-full rounded-xl bg-secondary/50" />
              ) : statusData && statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData.map(d => ({ ...d, label: STATUS_LABELS[d.status] ?? d.status }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis 
                      type="category" 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--foreground))' }} 
                      width={90}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--secondary))' }} 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [value, 'Proyectos']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || 'hsl(var(--muted))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">Sin datos disponibles</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
