import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Heart, BookOpen, User, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Favorite } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FavoritesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: favorites = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: (favoriteId: string) => 
      apiRequest(`/api/favorites/${favoriteId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الكتاب من المفضلة بنجاح.",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الكتاب من المفضلة.",
        variant: "destructive",
      });
    },
  });

  const filteredFavorites = favorites.filter((favorite: any) =>
    favorite.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جارٍ تحميل المفضلة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المفضلة</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة الكتب المفضلة للمستخدمين</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            <Heart className="w-4 h-4 mr-1" />
            {favorites.length} مفضلة
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المفضلة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مفضلة</h3>
            <p className="text-gray-600">
              {searchTerm ? "لم يتم العثور على نتائج للبحث الحالي" : "لا توجد كتب مفضلة حتى الآن"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((favorite: any) => (
            <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {favorite.book?.title || "عنوان غير محدد"}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {favorite.book?.author_name || "مؤلف غير محدد"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFavoriteMutation.mutate(favorite.id)}
                    disabled={deleteFavoriteMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={favorite.user?.avatarUrl} />
                      <AvatarFallback>
                        {favorite.user?.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {favorite.user?.displayName || "مستخدم غير محدد"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {favorite.user?.email || "بريد غير محدد"}
                      </p>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{favorite.book?.total_pages || 0} صفحة</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        أُضيف في {favorite.added_at ? new Date(favorite.added_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </span>
                    </div>
                  </div>

                  {/* Book Category */}
                  {favorite.book?.category_name && (
                    <Badge variant="outline" className="text-xs">
                      {favorite.book.category_name}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}