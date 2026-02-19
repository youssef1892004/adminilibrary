import { useState, useEffect } from "react";
import ImageUpload from "@/components/ui/image-upload";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Edit3, Save, X, Camera, BookOpen, Star, TrendingUp, Award, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthorData {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  book_num: number;
  Category_Id?: string;
  user_id: string;
}

export default function AuthorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    image_url: "",
    book_num: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch author profile
  const { data: author, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/author-profile"],
    queryFn: async () => {
      const response = await fetch("/api/auth/author-profile", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch author profile");
      }
      const data = await response.json();
      console.log("Raw API response:", data);
      return data as AuthorData;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always refetch
  });

  // Update form data when author data is loaded
  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name || "",
        bio: author.bio || "",
        image_url: author.image_url || "",
        book_num: author.book_num || 0
      });
    }
  }, [author, isLoading]);

  // Force refetch when component mounts - ensuring fresh data
  useEffect(() => {
    console.log("Component mounted - ensuring fresh data");
    queryClient.removeQueries({ queryKey: ["/api/books"] });
    queryClient.removeQueries({ queryKey: ["/api/chapters"] });
    refetch();
  }, []);

  // Update author profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<AuthorData>) => {
      const response = await fetch("/api/auth/author-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update author profile");
      }
      return await response.json() as AuthorData;
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });
      // مسح وإعادة جلب جميع البيانات المتعلقة بالمؤلف
      queryClient.removeQueries({ queryKey: ["/api/auth/author-profile"] });
      queryClient.removeQueries({ queryKey: ["/api/books"] });
      queryClient.removeQueries({ queryKey: ["/api/chapters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/author-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setIsEditing(false);

      setTimeout(() => {
        refetch();
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (author) {
      setFormData({
        name: author.name || "",
        bio: author.bio || "",
        image_url: author.image_url || "",
        book_num: author.book_num || 0
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 lg:space-y-8 min-h-screen bg-slate-50" dir="rtl">

      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-8 md:p-10 text-white shadow-xl border border-sidebar-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <User className="h-6 w-6 text-blue-200" />
              </div>
              <span className="text-blue-200 font-medium">الملف الشخصي</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">إعدادات المؤلف</h1>
            <p className="text-blue-100/80 text-lg max-w-2xl">
              إدارة بياناتك الشخصية، النبذة التعريفية، وصورتك لتظهر بشكل احترافي للقراء
            </p>
          </div>

          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-white text-sidebar-primary hover:bg-blue-50 font-medium shadow-sm hover:shadow-md transition-all px-6 py-6 h-auto rounded-xl flex items-center gap-2"
            >
              <Edit3 className="h-5 w-5" />
              <span>تعديل الملف الشخصي</span>
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards - Minimal Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">إجمالي الكتب</p>
                <h3 className="text-2xl font-bold text-slate-900">{author?.book_num || 0}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">التقييم</p>
                <h3 className="text-xl font-bold text-slate-900">قريبا</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-purple-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">المشاهدات</p>
                <h3 className="text-xl font-bold text-slate-900">قريبا</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-orange-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">الجوائز</p>
                <h3 className="text-xl font-bold text-slate-900">قريبا</h3>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar/Card */}
        <div className="col-span-1">
          <Card className="border-0 shadow-sm bg-white overflow-hidden sticky top-24">
            <div className="h-32 bg-slate-100 relative">
              <div className="absolute inset-0 bg-sidebar-primary/5"></div>
            </div>
            <div className="px-6 pb-6 text-center -mt-16 relative z-10">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden mx-auto mb-4">
                  {(isEditing ? formData.image_url : author?.image_url) ? (
                    <img
                      src={isEditing ? formData.image_url : author?.image_url}
                      alt="صورة المؤلف"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <User className="h-16 w-16" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute bottom-4 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-1">
                {isEditing ? (formData.name || "اسم المؤلف") : (author?.name || "اسم المؤلف")}
              </h2>
              <p className="text-slate-500 text-sm mb-4">
                عضو منذ {new Date().getFullYear()}
              </p>

              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                  مؤلف معتمد
                </Badge>
                <Badge variant="outline" className="text-slate-500 border-slate-200">
                  {author?.book_num || 0} كتب
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Edit Form */}
        <div className="col-span-1 lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                البيانات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">اسم المؤلف الكامل</Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-slate-50 focus:bg-white transition-colors"
                      placeholder="الاسم كما سيظهر للقراء"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-md text-slate-700 font-medium">
                      {author?.name || "لم يتم التحديد"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">النبذة التعريفية (Bio)</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="min-h-[150px] bg-slate-50 focus:bg-white transition-colors resize-none"
                      placeholder="اكتب نبذة مختصرة عن نفسك، اهتماماتك، وأسلوبك الكتابي..."
                    />
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-md text-slate-600 leading-relaxed min-h-[100px]">
                      {author?.bio || "لا توجد نبذة تعريفية."}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label className="text-slate-700">الصورة الشخصية</Label>
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => handleInputChange("image_url", url)}
                      folder="authors"
                      placeholder="اضغط لتحميل صورة شخصية"
                    />
                    <p className="text-xs text-slate-400">يفضل استخدام صورة مربعة الأبعاد.</p>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                  >
                    {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="text-slate-600 border-slate-300 hover:bg-slate-50"
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}