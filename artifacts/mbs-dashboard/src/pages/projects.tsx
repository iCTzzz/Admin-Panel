import { Layout } from "@/components/layout";
import { useState } from "react";
import { useListProjects, getListProjectsQueryKey, useCreateProject, useListClients, getListClientsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Briefcase, CalendarDays, DollarSign, Building, MoreHorizontal, LayoutGrid, List } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  clientId: z.coerce.number().min(1, "El cliente es requerido"),
  status: z.enum(["active", "pending", "completed"]),
  startDate: z.string().min(1, "La fecha es requerida"),
  estimatedRevenue: z.coerce.number().min(0, "El ingreso es requerido"),
});

export default function Projects() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const queryParams = { 
    search, 
    status: statusFilter !== "all" ? statusFilter as "active" | "pending" | "completed" : undefined,
    page: 1, 
    pageSize: 50 
  };
  
  const { data, isLoading } = useListProjects(queryParams, { query: { queryKey: getListProjectsQueryKey(queryParams) } });
  const { data: clients } = useListClients({ pageSize: 100 }, { query: { queryKey: getListClientsQueryKey({ pageSize: 100 }) } });

  const createProject = useCreateProject();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", clientId: 0, status: "pending", startDate: new Date().toISOString().split('T')[0], estimatedRevenue: 0 },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createProject.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Éxito", description: "Proyecto creado correctamente" });
        setIsDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey(queryParams) });
      },
      onError: () => {
        toast({ title: "Error", description: "No se pudo crear el proyecto", variant: "destructive" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Completado</Badge>;
      case 'active': return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Activo</Badge>;
      case 'pending': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Pendiente</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              Proyectos
            </h1>
            <p className="text-muted-foreground mt-1">Seguimiento y gestión del trabajo en curso.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="hidden sm:block">
              <TabsList className="bg-secondary/50 border border-border">
                <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hover-elevate shadow-md shadow-primary/20 gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" /> Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Nombre del Proyecto</FormLabel><FormControl><Input placeholder="Rediseño del Sitio Web" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <FormField control={form.control} name="clientId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ? field.value.toString() : undefined}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.data.map(client => (
                              <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      
                      <FormField control={form.control} name="startDate" render={({ field }) => (
                        <FormItem><FormLabel>Fecha de Inicio</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    
                    <FormField control={form.control} name="estimatedRevenue" render={({ field }) => (
                      <FormItem><FormLabel>Ingreso Estimado ($)</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <div className="pt-2 flex justify-end">
                      <Button type="submit" disabled={createProject.isPending} className="w-full sm:w-auto">
                        {createProject.isPending ? "Creando..." : "Crear Proyecto"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-border/50 shadow-sm bg-card">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar proyectos..." 
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl bg-card border border-border/50" />)}
            </div>
          ) : (
            <Skeleton className="h-96 w-full rounded-xl bg-card border border-border/50" />
          )
        ) : data?.data.length === 0 ? (
          <div className="text-center p-12 border border-border/50 border-dashed rounded-xl bg-card/50">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No se encontraron proyectos</h3>
            <p className="text-muted-foreground">Intenta ajustar los filtros o la búsqueda.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((project) => (
              <Card key={project.id} className="hover-elevate border-border/50 shadow-sm flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-1 pr-2" title={project.name}>
                      {project.name}
                    </CardTitle>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Building className="h-4 w-4 mr-1.5" /> {project.clientName}
                  </div>
                </CardHeader>
                <CardContent className="py-4 flex-1">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Fecha de Inicio</p>
                      <p className="font-medium flex items-center"><CalendarDays className="h-3 w-3 mr-1.5 text-primary" /> {format(new Date(project.startDate), "d 'de' MMM, yyyy", { locale: es })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Valor</p>
                      <p className="font-medium flex items-center"><DollarSign className="h-3 w-3 mr-1 text-primary" /> {project.estimatedRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6 mt-auto">
                  <Button variant="outline" className="w-full text-xs font-medium border-border/50 hover:bg-secondary">
                    Ver Detalles
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Inicio</TableHead>
                  <TableHead className="text-right">Ingreso</TableHead>
                  <TableHead className="text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((project) => (
                  <TableRow key={project.id} className="hover:bg-secondary/30 transition-colors cursor-pointer group">
                    <TableCell className="pl-6 font-medium text-foreground">{project.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2"><Building className="h-3 w-3" />{project.clientName}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(project.startDate), "d 'de' MMM, yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${project.estimatedRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </Layout>
  );
}
