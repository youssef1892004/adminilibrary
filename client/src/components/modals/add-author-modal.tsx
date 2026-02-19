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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { UserPlus, Users } from "lucide-react";

// Define schema based on GraphQL requirements
const newAuthorUserSchema = z.object({
  mode: z.literal("new"),
  name: z.string().min(1, "اسم المؤلف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  bio: z.string().optional(),
  image_url: z.string().optional().or(z.literal("")),
  book_num: z.number().min(0, "عدد الكتب يجب أن يكون 0 أو أكثر").optional(),
  Category_Id: z.string().optional(),
});

const existingUserAuthorSchema = z.object({
  mode: z.literal("existing"),
  user_id: z.string().min(1, "يجب اختيار مستخدم"),
  name: z.string().min(1, "اسم المؤلف مطلوب"),
  bio: z.string().optional(),
  image_url: z.string().optional().or(z.literal("")),
  book_num: z.number().min(0, "عدد الكتب يجب أن يكون 0 أو أكثر").optional(),
  Category_Id: z.string().optional(),
});

const addAuthorSchema = z.discriminatedUnion("mode", [
  newAuthorUserSchema,
  existingUserAuthorSchema,
]);

type AddAuthorData = z.infer<typeof addAuthorSchema>;

// Helper type for form default values that includes all possible fields
type AuthorFormValues = {
  mode: "new" | "existing";
  name: string;
  email?: string;
  password?: string;
  bio?: string;
  image_url?: string;
  book_num?: number;
  Category_Id?: string;
  user_id?: string;
};

interface AddAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddAuthorModal({ isOpen, onClose, onSuccess }: AddAuthorModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: libraryApi.getCategories,
  });

  // Fetch users for selection
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: libraryApi.getUsers,
    enabled: isOpen, // Only fetch when modal is open
  });

  // Use the looser type for the form to allow switching between modes without TS errors in render
  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(addAuthorSchema),
    defaultValues: {
      mode: "new",
      name: "",
      email: "",
      password: "",
      bio: "",
      image_url: "",
      book_num: 0,
      Category_Id: "",
      user_id: "",
    },
  });

  // Reset form when tab changes to avoid validation errors from other mode
  const handleTabChange = (value: string) => {
    const mode = value as "new" | "existing";
    setActiveTab(mode);
    // Resetting with correct fields for the new mode to clear validation errors
    form.reset({
      mode,
      name: "",
      email: "",
      password: "",
      bio: "",
      image_url: "",
      book_num: 0,
      Category_Id: "",
      user_id: "",
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: AddAuthorData) => libraryApi.createAuthor(data),
    onSuccess: () => {
      toast({
        title: "تم إضافة المؤلف",
        description: "تم إضافة المؤلف وتحديث بيانات المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] }); // Invalidate users as well
      form.reset();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة المؤلف",
        description: error.message || "حدث خطأ أثناء إضافة المؤلف",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthorFormValues) => {
    // Clean empty string values
    const cleanData = {
      ...data,
      image_url: data.image_url || undefined,
      Category_Id: data.Category_Id === "none" ? undefined : data.Category_Id || undefined,
      bio: data.bio || undefined,
    } as AddAuthorData; // Cast to the discriminated union type required by the API
    createMutation.mutate(cleanData);
  };

  // Helper to handle user selection
  const handleUserSelect = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    if (user) {
      form.setValue("user_id", userId);
      form.setValue("name", user.displayName || "");
      if (user.avatarUrl) {
        form.setValue("image_url", user.avatarUrl);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            إضافة مؤلف جديد
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              مستخدم جديد
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              مستخدم موجود
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <TabsContent value="new" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المؤلف *</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل الاسم" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@domain.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>كلمة المرور *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="existing" className="space-y-4">
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اختر المستخدم *</FormLabel>
                      <Select onValueChange={handleUserSelect} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="بحث عن مستخدم..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.displayName} ({user.email})
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المؤلف (للعرض) *</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المؤلف" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Common Fields */}
              <div className="pt-4 border-t space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>النبذة التعريفية</FormLabel>
                      <FormControl>
                        <Textarea placeholder="أدخل نبذة تعريفية..." className="min-h-[100px]" {...field} />
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
                      <FormLabel>صورة المؤلف</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value && (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border mx-auto">
                              <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("cover", file);
                              try {
                                const res = await fetch("/api/upload?folder=authors", { method: "POST", body: formData });
                                if (!res.ok) throw new Error("فشل الرفع");
                                const data = await res.json();
                                form.setValue("image_url", data.url);
                                toast({ title: "تم رفع الصورة" });
                              } catch (err) {
                                toast({ title: "فشل الرفع", variant: "destructive" });
                              }
                            }}
                            className="text-sm"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="book_num"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد الكتب</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
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
                        <FormLabel>التصنيف</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التصنيف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">بدون تصنيف</SelectItem>
                            {categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={createMutation.isPending}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {createMutation.isPending ? "جارٍ الإضافة..." : "إضافة المؤلف"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}