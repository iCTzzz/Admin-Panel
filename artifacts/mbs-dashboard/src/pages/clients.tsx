import { Layout } from "@/components/layout";
import { useState } from "react";
import { useListClients, getListClientsQueryKey, useCreateClient } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search, Plus, Users, Building, Mail, Phone, Calendar, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Phone is required"),
  company: z.string().min(2, "Company is required"),
});

export default function Clients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useListClients(
    { search, page, pageSize: 10 },
    { query: { queryKey: getListClientsQueryKey({ search, page, pageSize: 10 }) } }
  );

  const createClient = useCreateClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", company: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createClient.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Client created successfully" });
        setIsDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey({ search, page, pageSize: 10 }) });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create client", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Clients Directory
            </h1>
            <p className="text-muted-foreground mt-1">Manage your customer relationships and contacts.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hover-elevate shadow-md shadow-primary/20 gap-2">
                <Plus className="h-4 w-4" /> New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Acme Inc" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john@acme.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="555-0123" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={createClient.isPending} className="w-full sm:w-auto">
                      {createClient.isPending ? "Creating..." : "Create Client"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-secondary/10 px-6 py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              All Clients
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients..." 
                className="pl-9 h-9 bg-background"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No clients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((client) => (
                    <TableRow key={client.id} className="group hover:bg-secondary/30 transition-colors cursor-pointer">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          {client.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="h-3 w-3" /> {client.company}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm text-muted-foreground gap-1">
                          <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> {client.email}</span>
                          <span className="flex items-center gap-2"><Phone className="h-3 w-3" /> {client.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(client.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3 text-xl border-b border-border/50 pb-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                                  {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  {client.name}
                                  <div className="text-sm text-muted-foreground font-normal mt-1 flex items-center gap-1">
                                    <Building className="h-3 w-3" /> {client.company}
                                  </div>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Contact Information</h4>
                                <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-md border border-border">
                                      <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Email Address</p>
                                      <p className="text-sm font-medium">{client.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-md border border-border">
                                      <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Phone Number</p>
                                      <p className="text-sm font-medium">{client.phone}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">System Info</h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/20 p-4 rounded-lg border border-border/50">
                                  <Calendar className="h-4 w-4" /> Added on {format(new Date(client.createdAt), 'MMMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {data && data.total > data.pageSize && (
              <div className="border-t border-border/50 p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem className="px-4 text-sm text-muted-foreground">
                      Page {page} of {Math.ceil(data.total / data.pageSize)}
                    </PaginationItem>
                    <PaginationItem>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(data.total / data.pageSize)}>
                        Next
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}