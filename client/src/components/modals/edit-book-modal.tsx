import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBookSchema, type UpdateBook, type Book, type Author, type Category } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditBookModalProps {
  open: boolean;
  onClose: () => void;
  book?: Book | null;
  authors: Author[];
  categories: Category[];
}

export default function EditBookModal({ open, onClose, book, authors, categories }: EditBookModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateBook>({
    resolver: zodResolver(updateBookSchema),
    defaultValues: {
      title: "",
      description: "",
      ISBN: "",
      cover_URL: "",
      publication_date: "",
      author_id: undefined,
      category_id: undefined,
      parts_num: 1,
      total_pages: 1,
      most_view: 0,
    },
  });

  useEffect(() => {
    if (book && open) {
      form.reset({
        title: book.title || "",
        description: book.description || "",
        ISBN: book.ISBN || "",
        cover_URL: book.cover_URL || "",
        publication_date: book.publication_date || "",
        author_id: book.author_id || undefined,
        category_id: book.category_id || undefined,
        parts_num: book.parts_num || 1,
        total_pages: book.total_pages || 1,
        most_view: book.most_view || 0,
      });
    }
  }, [book, open, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateBook) => {
      if (!book?.id) throw new Error("معرف الكتاب مفقود");
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطأ في تحديث الكتاب");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الكتاب",
        description: "تم تحديث بيانات الكتاب بنجاح",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/author-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الكتاب",
        description: error.message || "حدث خطأ أثناء تحديث الكتاب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateBook) => {
    updateMutation.mutate(data);
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل الكتاب</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الكتاب</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنوان الكتاب" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ISBN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم ISBN</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل رقم ISBN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الكتاب</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل وصف الكتاب"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_URL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط غلاف الكتاب</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/cover.jpg"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="author_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المؤلف</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المؤلف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.name}
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
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التصنيف</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="publication_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ النشر</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parts_num"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد الأجزاء</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
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
                name="total_pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد الصفحات</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "جاري التحديث..." : "تحديث الكتاب"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}