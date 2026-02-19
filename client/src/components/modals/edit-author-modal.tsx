import { useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { libraryApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
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

// Define schema based on GraphQL requirements
const editAuthorSchema = z.object({
  name: z.string().min(1, "اسم المؤلف مطلوب"),
  bio: z.string().optional(),
  image_url: z.string().optional().or(z.literal("")),
  book_num: z.number().min(0, "عدد الكتب يجب أن يكون 0 أو أكثر").optional(),
  Category_Id: z.string().optional(),
});

type EditAuthorData = z.infer<typeof editAuthorSchema>;

interface EditAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  author?: any | null;
  onSuccess?: () => void;
}

export default function EditAuthorModal({ isOpen, onClose, author, onSuccess }: EditAuthorModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: libraryApi.getCategories,
  });

  const form = useForm<EditAuthorData>({
    resolver: zodResolver(editAuthorSchema),
    defaultValues: {
      name: "",
      bio: "",
      image_url: "",
      book_num: 0,
      Category_Id: "",
    },
  });

  useEffect(() => {
    if (author && isOpen) {
      form.reset({
        name: author.name || "",
        bio: author.bio || "",
        image_url: author.image_url || "",
        book_num: author.book_num || 0,
        Category_Id: author.Category_Id || "",
      });
    }
  }, [author, isOpen, form]);

  const updateMutation = useMutation({
    mutationFn: (data: EditAuthorData) => {
      if (!author?.id) throw new Error("معرف المؤلف مفقود");
      return libraryApi.updateAuthor(author.id, data);
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث المؤلف",
        description: "تم تحديث بيانات المؤلف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث المؤلف",
        description: error.message || "حدث خطأ أثناء تحديث المؤلف",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditAuthorData) => {
    // Clean empty string values and handle "none" category
    const cleanData = {
      ...data,
      image_url: data.image_url || undefined,
      Category_Id: data.Category_Id === "none" ? undefined : data.Category_Id || undefined,
      bio: data.bio || undefined,
    };
    updateMutation.mutate(cleanData);
  };

  if (!author) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            تعديل المؤلف
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">اسم المؤلف *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل اسم المؤلف"
                      className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">النبذة التعريفية</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل نبذة تعريفية عن المؤلف..."
                      className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">صورة المؤلف</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Image Preview */}
                      {field.value && (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-slate-200 shadow-sm mx-auto">
                          <img
                            src={field.value}
                            alt="Author preview"
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

                              // Create FormData
                              const formData = new FormData();
                              formData.append("cover", file);

                              try {
                                const res = await fetch("/api/upload?folder=authors", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (!res.ok) throw new Error("فشل رفع الصورة");

                                const data = await res.json();
                                form.setValue("image_url", data.url);
                                toast({ title: "تم رفع الصورة بنجاح" });
                              } catch (err) {
                                toast({ title: "فشل رفع الصورة", variant: "destructive" });
                              }
                            }}
                            className="cursor-pointer file:cursor-pointer file:text-purple-600 file:font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="book_num"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">عدد الكتب</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Category_Id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">التصنيف</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">بدون تصنيف</SelectItem>
                      {categories.map((category: any) => (
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

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={updateMutation.isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {updateMutation.isPending ? "جارٍ التحديث..." : "تحديث المؤلف"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}