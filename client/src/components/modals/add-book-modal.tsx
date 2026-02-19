import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookSchema, type InsertBook, type Author, type Category } from "@shared/schema";
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

interface AddBookModalProps {
  open: boolean;
  onClose: () => void;
  authors: Author[];
  categories: Category[];
}

export default function AddBookModal({ open, onClose, authors, categories }: AddBookModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const form = useForm<InsertBook>({
    resolver: zodResolver(insertBookSchema),
    defaultValues: {
      title: "",
      description: "",
      ISBN: "",
      cover_URL: "",
      publication_date: new Date().toISOString().split('T')[0],
      author_id: undefined,
      category_id: undefined,
      parts_num: 1,
      total_pages: 1,
      most_view: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBook) => {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطأ في إضافة الكتاب");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الكتاب",
        description: "تم إضافة الكتاب بنجاح",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/author-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة الكتاب",
        description: error.message || "حدث خطأ أثناء إضافة الكتاب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBook) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة كتاب جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الكتاب *</FormLabel>
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
                    <FormLabel>رقم ISBN *</FormLabel>
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
                  <FormLabel>وصف الكتاب *</FormLabel>
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
                  <FormLabel>غلاف الكتاب *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Image Preview */}
                      {field.value && (
                        <div className="relative w-32 h-44 rounded-lg overflow-hidden border border-slate-200 shadow-sm mx-auto">
                          <img
                            src={field.value}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              setUploading(true);
                              const formData = new FormData();
                              formData.append("cover", file);

                              try {
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (!res.ok) throw new Error("فشل رفع الصورة");

                                const data = await res.json();
                                form.setValue("cover_URL", data.url);
                                toast({ title: "تم رفع الصورة بنجاح" });
                              } catch (err) {
                                toast({ title: "فشل رفع الصورة", variant: "destructive" });
                              } finally {
                                setUploading(false);
                              }
                            }}
                            disabled={uploading}
                            className="cursor-pointer file:cursor-pointer file:text-blue-600 file:font-medium"
                          />
                          {uploading && <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
                        </div>

                      </div>
                    </div>
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
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
                    <FormLabel>تاريخ النشر *</FormLabel>
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
                    <FormLabel>عدد الأجزاء *</FormLabel>
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
                    <FormLabel>عدد الصفحات *</FormLabel>
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "جاري الإضافة..." : "إضافة الكتاب"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}