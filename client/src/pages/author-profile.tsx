import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Edit3, Save, X, Camera, BookOpen, Star, TrendingUp, Award, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
    console.log("Author data received:", author);
    console.log("Is loading:", isLoading);
    if (author) {
      console.log("Setting form data with:", author);
      setFormData({
        name: author.name || "",
        bio: author.bio || "",
        image_url: author.image_url || "",
        book_num: author.book_num || 0
      });
    }
  }, [author, isLoading]);

  // Force refetch when component mounts and clear cache
  useEffect(() => {
    console.log("Component mounted - clearing cache and refetching");
    // مسح جميع الـ cache المتعلق بالمؤلف
    queryClient.removeQueries({ queryKey: ["/api/auth/author-profile"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/books"] }); // لتحديث عدد الكتب
      setIsEditing(false);
      
      // إعادة جلب البيانات
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
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="h-8 sm:h-10 bg-gray-300 dark:bg-gray-600 rounded-lg w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              </div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg w-32"></div>
            </div>
            
            {/* Profile Card Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="h-32 sm:h-40 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Enhanced Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                الملف الشخصي
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                إدارة بياناتك الشخصية وملفك كمؤلف محترف
              </p>
            </div>
          </div>
          
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Edit3 className="ml-2 h-5 w-5" />
              تعديل الملف الشخصي
            </Button>
          )}
        </div>

        {/* Statistics Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">إجمالي الكتب</p>
                  <p className="text-2xl sm:text-3xl font-bold">{author?.book_num || 0}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">التقييم</p>
                  <p className="text-2xl sm:text-3xl font-bold">قريبا</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">المشاهدات</p>
                  <p className="text-2xl sm:text-3xl font-bold">قريبا</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">الجوائز</p>
                  <p className="text-2xl sm:text-3xl font-bold">قريبا</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Author Profile Card */}
        <Card className="border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          {/* Modern Header with Cover Design */}
          <div className="relative">
            <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 dark:from-emerald-500 dark:via-teal-600 dark:to-cyan-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            {/* Profile Section */}
            <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                {/* Enhanced Profile Image */}
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-4 border-white/50 dark:border-gray-700/50 shadow-2xl flex items-center justify-center overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                    {(isEditing ? formData.image_url : author?.image_url) ? (
                      <img 
                        src={isEditing ? formData.image_url : author?.image_url} 
                        alt="صورة المؤلف" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -left-2 p-2 sm:p-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                      <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  )}
                </div>

                {/* Enhanced Profile Info */}
                <div className="flex-1 text-center sm:text-right">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {isEditing ? formData.name || "اسم المؤلف" : author?.name || "اسم المؤلف"}
                    </h2>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-300">
                      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-0">
                        <BookOpen className="h-4 w-4 ml-1" />
                        {author?.book_num || 0} كتاب منشور
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-0">
                        <Calendar className="h-4 w-4 ml-1" />
                        قريبا
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Content Section */}
          <CardContent className="p-6 sm:p-8 lg:p-10">
            <div className="space-y-6 lg:space-y-8">
              {/* Author Name Section */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  اسم المؤلف
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-lg sm:text-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="أدخل اسم المؤلف"
                  />
                ) : (
                  <div className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                    {author?.name || "لم يتم تحديد الاسم"}
                  </div>
                )}
              </div>

              {/* Author Bio Section */}
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  نبذة عن المؤلف
                </Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={6}
                    className="text-lg sm:text-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all duration-300"
                    placeholder="اكتب نبذة شاملة عن نفسك كمؤلف، خبراتك، أعمالك، وإنجازاتك الأدبية..."
                  />
                ) : (
                  <div className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600 min-h-[150px] leading-relaxed">
                    {author?.bio || "لم يتم إضافة نبذة عن المؤلف. سيساعد إضافة نبذة شخصية في التعريف بك وبأعمالك للقراء."}
                  </div>
                )}
              </div>

              {/* Profile Image URL Section - Enhanced */}
              {isEditing && (
                <div className="space-y-3">
                  <Label htmlFor="image_url" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Camera className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    رابط صورة المؤلف
                  </Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange("image_url", e.target.value)}
                    className="text-lg sm:text-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="أدخل رابط صورة عالية الجودة للملف الشخصي"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    يفضل استخدام صورة بنسبة 1:1 وبجودة عالية للحصول على أفضل مظهر
                  </p>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-gray-200 dark:border-gray-600">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {updateMutation.isPending ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg">جاري الحفظ...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Save className="h-6 w-6" />
                        <span className="text-lg">حفظ التغييرات</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <X className="h-6 w-6" />
                      <span className="text-lg">إلغاء التعديل</span>
                    </div>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}