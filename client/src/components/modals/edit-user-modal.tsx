import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

interface UpdateUserData {
  displayName: string;
  email: string;
  phoneNumber?: string;
  defaultRole: string;
  emailVerified: boolean;
  disabled: boolean;
  locale: string;
}

export default function EditUserModal({ open, onClose, user }: EditUserModalProps) {
  const { toast } = useToast();

  const form = useForm<UpdateUserData>({
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      defaultRole: "user",
      emailVerified: false,
      disabled: false,
      locale: "en",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        defaultRole: user.defaultRole || "user",
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        locale: user.locale || "ar",
      });
    }
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => 
      apiRequest(`/api/users/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUserData) => {
    if (!user) return;
    
    // إصلاح مشكلة phoneNumber - إذا كان فارغًا، يجب أن يكون null
    const cleanedData = {
      ...data,
      phoneNumber: data.phoneNumber?.trim() || undefined
    } as UpdateUserData;
    
    updateUserMutation.mutate({ id: user.id, data: cleanedData });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل المستخدم</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل الاسم الكامل" {...field} />
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
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="أدخل البريد الإلكتروني" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="أدخل رقم الهاتف" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الدور</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="anonymous">مجهول</SelectItem>
                      <SelectItem value="me">مدير</SelectItem>
                      <SelectItem value="author">مؤلف</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locale</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select locale" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Email Verified</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Account Disabled</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "جارِ التحديث..." : "تحديث المستخدم"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
