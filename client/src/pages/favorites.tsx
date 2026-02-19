import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Heart, BookOpen, Users, Grid, List, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable } from "@/components/ui/data-table"; // If we want a table view later

export default function FavoritesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid"); // Kept for consistency, though Grid is primary
  const { toast } = useToast();

  const { data: favorites = [], isLoading, refetch } = useQuery<any[]>({
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

  const handleRefresh = async () => {
    await refetch();
    toast({ title: "تم التحديث", description: "تم تحديث قائمة المفضلة" });
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 min-h-screen" dir="rtl">
      {/* Enhanced Header Section - Unified Theme */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-4 sm:p-6 lg:p-8 text-white shadow-2xl border border-sidebar-border">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Heart className="h-6 w-6 lg:h-8 lg:w-8 text-white fill-current" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">إدارة المفضلة</h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  عرض الكتب المفضلة وإحصائيات المستخدمين
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-white/10 rounded-xl p-1 backdrop-blur-sm self-end lg:self-center">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="text-white hover:bg-white/20"
            >
              <Grid className="h-4 w-4" />
              <span className="ml-1 sm:hidden">شبكة</span>
            </Button>
            {/* 
               <Button
                 variant={viewMode === "table" ? "secondary" : "ghost"}
                 size="sm"
                 onClick={() => setViewMode("table")}
                 className="text-white hover:bg-white/20"
               >
                 <List className="h-4 w-4" />
                 <span className="ml-1 sm:hidden">جدول</span>
               </Button>
               */}
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-pink-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Compact Statistics Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-rose-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">الكتب المفضلة</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{favoritesList.length}</div>
            <p className="text-slate-400 text-xs">كتاب</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي التفضيلات</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{favorites.length}</div>
            <p className="text-slate-400 text-xs">إعجاب</p>
          </CardContent>
        </Card>
      </div>


      {/* Actions Bar & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="البحث عن كتاب أو مؤلف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 h-10 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-10"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </div>
      </div>


      {/* Favorites Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : favoritesList.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مفضلة</h3>
            <p className="text-gray-600">
              {searchTerm ? "لم يتم العثور على نتائج للبحث الحالي" : "لا توجد كتب مفضلة حتى الآن"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoritesList.map((item: any) => (
            <Card key={item.book.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={item.book.cover_URL || "/placeholder-book.jpg"}
                    alt={item.book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <Badge variant="secondary" className="mb-2 bg-rose-500/20 text-rose-200 border-0 backdrop-blur-sm">
                      {item.book.category_name || "عام"}
                    </Badge>
                    <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-1">
                      {item.book.title}
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-1">
                      {item.book.author_name || "مؤلف غير محدد"}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500">
                      <BookOpen className="w-4 h-4 mr-1 ml-1" />
                      {item.book.total_pages || 0} صفحة
                    </div>
                    <div className="flex items-center font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                      <Heart className="w-3.5 h-3.5 mr-1 ml-1 fill-current" />
                      {item.count}
                    </div>
                  </div>

                  {/* Users Avatars */}
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                    <p className="text-xs text-slate-500 mb-2">أضيف للمفضلة بواسطة:</p>
                    <div className="flex -space-x-2 space-x-reverse overflow-hidden py-1">
                      <TooltipProvider>
                        {item.users.map((user: any, index: number) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-800 ring-1 ring-slate-100 dark:ring-slate-700 transition-transform hover:scale-110 hover:z-10">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
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
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
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