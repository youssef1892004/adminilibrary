import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { libraryApi } from "@/lib/api";
import { updateCategorySchema, type UpdateCategory, type Category } from "@shared/schema";
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

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

export default function EditCategoryModal({ open, onClose, category }: EditCategoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateCategory>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (category && open) {
      form.reset({
        name: category.name || "",
      });
    }
  }, [category, open, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCategory) => {
      if (!category?.id) throw new Error("معرف التصنيف مفقود");
      return libraryApi.updateCategory(category.id, data);
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث التصنيف",
        description: "تم تحديث بيانات التصنيف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث التصنيف",
        description: error.message || "حدث خطأ أثناء تحديث التصنيف",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateCategory) => {
    updateMutation.mutate(data);
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>تعديل التصنيف</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم التصنيف</FormLabel>
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "جاري التحديث..." : "تحديث التصنيف"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}