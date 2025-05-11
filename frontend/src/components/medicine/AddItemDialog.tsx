
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

// Form schema for adding new items
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddItemDialogProps {
  activeTab: string;
  onItemAdded: (values: FormData, newId: string) => void;
}

const AddItemDialog = ({ activeTab, onItemAdded }: AddItemDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get the appropriate title for the add dialog based on active tab
  const getAddDialogTitle = () => {
    switch (activeTab) {
      case 'medicines': return 'Add New Medicine';
      case 'injections': return 'Add New InjectionModel';
      case 'vitamins': return 'Add New Vitamin';
      case 'diseases': return 'Add New Disease';
      default: return 'Add New Item';
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: FormData) => {
    // Generate a random ID (in a real app this would come from the backend)
    const newId = `${activeTab.charAt(0)}${Math.floor(Math.random() * 1000)}`;
    
    // Call parent handler
    onItemAdded(values, newId);
    
    // Display success toast
    toast.success(`${activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)} added successfully`);
    
    // Reset form and close dialog
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          <span>Add New</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getAddDialogTitle()}</DialogTitle>
          <DialogDescription>
            Enter the details for the new item
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description (optional)" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
