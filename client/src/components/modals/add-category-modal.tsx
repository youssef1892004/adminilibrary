import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { libraryApi } from "@/lib/api";
import { insertCategorySchema, type InsertCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddCategoryModal({ open, onClose }: AddCategoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCategory) => libraryApi.createCategory(data),
    onSuccess: () => {
      toast({
        title: "تم إضافة التصنيف",
        description: "تم إضافة التصنيف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة التصنيف",
        description: error.message || "حدث خطأ أثناء إضافة التصنيف",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCategory) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>إضافة تصنيف جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم التصنيف *</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم التصنيف" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "جاري الإضافة..." : "إضافة التصنيف"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}