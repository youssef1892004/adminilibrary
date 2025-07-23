import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Book } from "@shared/schema";

const addChapterSchema = z.object({
  title: z.string().min(1, "عنوان الفصل مطلوب"),
  content: z.string().min(1, "محتوى الفصل مطلوب"),
  chapter_num: z.number().min(1, "رقم الفصل يجب أن يكون أكبر من 0"),
  book_id: z.string().min(1, "اختيار الكتاب مطلوب"),
});

type AddChapterFormData = z.infer<typeof addChapterSchema>;

interface AddChapterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialBookId?: string;
}

export function AddChapterModal({ isOpen, onOpenChange, initialBookId }: AddChapterModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch books for selection
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const form = useForm<AddChapterFormData>({
    resolver: zodResolver(addChapterSchema),
    defaultValues: {
      title: "",
      content: "",
      chapter_num: 1,
      book_id: initialBookId || "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: AddChapterFormData) => {
      const chapterData = {
        title: data.title,
        content: data.content,
        chapter_num: data.chapter_num,
        book_id: data.book_id,
      };
      
      return apiRequest("/api/chapters", "POST", chapterData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      toast({
        title: "تم إنشاء الفصل بنجاح",
        description: "تم إضافة الفصل الجديد إلى قاعدة البيانات",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error creating chapter:", error);
      toast({
        title: "خطأ في إنشاء الفصل",
        description: "حدث خطأ أثناء إضافة الفصل",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddChapterFormData) => {
    addMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            إضافة فصل جديد
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            أدخل تفاصيل الفصل الجديد
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="book_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    الكتاب
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-700 focus:ring-emerald-500">
                        <SelectValue placeholder="اختر الكتاب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    عنوان الفصل
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثال: الفصل الأول"
                      className="bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-700 focus:ring-emerald-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chapter_num"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    رقم الفصل
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      className="bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-700 focus:ring-emerald-500"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    محتوى الفصل
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اكتب محتوى الفصل هنا..."
                      className="min-h-[120px] bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-700 focus:ring-emerald-500 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {addMutation.isPending ? "جاري الإضافة..." : "إضافة الفصل"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}