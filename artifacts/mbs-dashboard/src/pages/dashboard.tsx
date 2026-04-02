import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetProjectsByMonth, getGetProjectsByMonthQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Users, Briefcase, CheckCircle2, DollarSign, Activity, CalendarDays, PlusCircle, PenTool, LayoutDashboard, Boxes } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: projectsByMonth, isLoading: isLoadingChart } = useGetProjectsByMonth({ query: { queryKey: getGetProjectsByMonthQueryKey() } });
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'client_added': return <Users className="h-4 w-4 text-blue-500" />;
      case 'project_created': return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case 'project_updated': return <PenTool className="h-4 w-4 text-amber-500" />;
      case 'service_added': return <Boxes className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Resumen General
            </h1>
            <p className="text-muted-foreground mt-1">Esto es lo que está pasando en MBS hoy.</p>
          </div>
        </div>

        {/* Tarjetas de métricas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isLoadingSummary ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl bg-card" />)
          ) : (
            <>
              <Card className="hover-elevate border-border/50 shadow-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{summary?.totalClients.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span className="text-emerald-500 flex items-center"><Activity className="h-3 w-3 mr-1" /> Activos</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate border-border/50 shadow-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Proyectos Activos</CardTitle>
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Briefcase className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{summary?.activeProjects.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">En progreso actualmente</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate border-border/50 shadow-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Proyectos Completados</CardTitle>
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{summary?.completedProjects.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Entregados exitosamente</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate border-border/50 shadow-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Estimados</CardTitle>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{formatCurrency(summary?.estimatedRevenue || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Valor del pipeline</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
          {/* Gráfica */}
          <Card className="md:col-span-4 lg:col-span-5 border-border/50 shadow-sm flex flex-col">
            <CardHeader className="border-b border-border/50 bg-secondary/10 pb-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Proyectos por Mes
              </CardTitle>
              <CardDescription>Volumen de proyectos creados en los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1 min-h-[300px]">
              {isLoadingChart ? (
                <Skeleton className="h-full w-full rounded-xl bg-secondary/50" />
              ) : projectsByMonth && projectsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--secondary))' }} 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                      formatter={(value: number) => [value, 'Proyectos']}
                    />
                    <Bar dataKey="count" name="Proyectos" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {projectsByMonth.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.7 + (index * 0.05)})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sin datos disponibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card className="md:col-span-3 lg:col-span-2 border-border/50 shadow-sm flex flex-col">
            <CardHeader className="border-b border-border/50 bg-secondary/10 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas actualizaciones en los módulos</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-0 flex-1 overflow-y-auto max-h-[400px]">
              {isLoadingActivity ? (
                <div className="p-6 space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-secondary/30 transition-colors flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium leading-snug">{activity.description}</p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(activity.createdAt), "d 'de' MMM, h:mm a", { locale: es })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Sin actividad reciente.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
