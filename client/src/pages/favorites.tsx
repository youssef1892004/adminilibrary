import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Heart, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FavoritesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: favorites = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
  });

  // Group favorites by book
  const groupedFavorites = favorites.reduce((acc: any, favorite: any) => {
    if (!favorite.book) return acc;

    if (!acc[favorite.book.id]) {
      acc[favorite.book.id] = {
        book: favorite.book,
        users: [],
        count: 0
      };
    }

    if (favorite.user) {
      acc[favorite.book.id].users.push(favorite.user);
    }
    acc[favorite.book.id].count++;

    return acc;
  }, {});

  const favoritesList = Object.values(groupedFavorites).filter((item: any) =>
    item.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.book.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-gray-600 mt-1">عرض الكتب المفضلة وإحصائيات المستخدمين</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Heart className="w-4 h-4 mr-1 text-red-500" />
            {favoritesList.length} كتاب
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Users className="w-4 h-4 mr-1 text-blue-500" />
            {favorites.length} إجمالي المفضلة
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث عن كتاب أو مؤلف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {favoritesList.length === 0 ? (
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoritesList.map((item: any) => (
            <Card key={item.book.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-t-4 border-t-purple-500">
              <CardContent className="p-0">
                <div className="flex h-32 relative bg-gray-100">
                  {/* Book Cover */}
                  <div className="w-24 h-32 flex-shrink-0 relative ml-4 -mb-8 mt-4 shadow-lg rounded-sm overflow-hidden">
                    <img
                      src={item.book.cover_URL || "/placeholder-book.jpg"}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-lg leading-tight mb-1 text-gray-900 line-clamp-2">
                      {item.book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.book.author_name || "مؤلف غير محدد"}
                    </p>
                    {item.book.category_name && (
                      <Badge variant="outline" className="text-xs bg-white/50">
                        {item.book.category_name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-8 px-4 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen className="w-4 h-4 mr-1 ml-1" />
                      {item.book.total_pages || 0} صفحة
                    </div>
                    <div className="flex items-center font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                      <Heart className="w-3.5 h-3.5 mr-1 ml-1 fill-current" />
                      {item.count} معجب
                    </div>
                  </div>

                  {/* Users Avatars */}
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-2">أضيف للمفضلة بواسطة:</p>
                    <div className="flex -space-x-2 space-x-reverse overflow-hidden py-1">
                      <TooltipProvider>
                        {item.users.map((user: any, index: number) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-gray-100 transition-transform hover:scale-110 hover:z-10">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700">
                                  {user.displayName?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.displayName}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                      {item.count > item.users.length && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                          +{item.count - item.users.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}