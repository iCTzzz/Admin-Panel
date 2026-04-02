import { Layout } from "@/components/layout";
import { useState } from "react";
import { useListServices, getListServicesQueryKey, useCreateService } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Boxes, Plus, DollarSign, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  estimatedPrice: z.coerce.number().min(0, "Price is required"),
});

export default function Services() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useListServices({ query: { queryKey: getListServicesQueryKey() } });
  const createService = useCreateService();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", estimatedPrice: 0 },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createService.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Service catalog updated" });
        setIsDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add service", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Boxes className="h-8 w-8 text-primary" />
              Service Catalog
            </h1>
            <p className="text-muted-foreground mt-1">Manage offerings and pricing parameters.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hover-elevate shadow-md shadow-primary/20 gap-2">
                <Plus className="h-4 w-4" /> Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Service Name</FormLabel><FormControl><Input placeholder="SEO Audit" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed analysis of..." className="resize-none h-24" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  
                  <FormField control={form.control} name="estimatedPrice" render={({ field }) => (
                    <FormItem><FormLabel>Base Price ($)</FormLabel><FormControl><Input type="number" placeholder="1500" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={createService.isPending} className="w-full">
                      {createService.isPending ? "Saving..." : "Save Service"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl bg-card border border-border/50" />)}
          </div>
        ) : data?.length === 0 ? (
          <div className="text-center p-16 border border-border/50 border-dashed rounded-xl bg-card/50">
            <Boxes className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-foreground mb-2">No services defined</h3>
            <p className="text-muted-foreground mb-6">Build your catalog to start attaching services to projects.</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">Add First Service</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.map((service) => (
              <Card key={service.id} className="hover-elevate border-border/50 shadow-sm flex flex-col group h-full">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="bg-secondary/50 font-mono text-xs">
                      ID-{service.id.toString().padStart(4, '0')}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold leading-tight">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-6 flex-1 text-sm text-muted-foreground">
                  <p className="line-clamp-3">{service.description}</p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50 bg-secondary/10 mt-auto flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Base Price</span>
                  <span className="text-lg font-bold text-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-0.5 text-primary" />
                    {service.estimatedPrice.toLocaleString()}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}