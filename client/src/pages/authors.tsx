import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Author } from "@shared/schema";
import { TableColumn } from "@/types";
import { Plus, Users, Edit, Trash2, Search, Grid, List, BookOpen, User, FileCheck, FolderOpen, RotateCcw } from "lucide-react";
import AddAuthorModal from "@/components/modals/add-author-modal";
import EditAuthorModal from "@/components/modals/edit-author-modal";
import ConfirmModal from "@/components/modals/confirm-modal";

export default function Authors() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authors = [], isLoading } = useQuery({
    queryKey: ["/api/authors"],
    queryFn: libraryApi.getAuthors,
  });

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: libraryApi.getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (authorId: string) => libraryApi.deleteAuthor(authorId),
    onSuccess: () => {
      toast({
        title: "تم حذف المؤلف",
        description: "تم حذف المؤلف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
      setShowDeleteModal(false);
      setSelectedAuthor(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف المؤلف",
        description: error.message || "حدث خطأ أثناء حذف المؤلف",
        variant: "destructive",
      });
    },
  });

  const handleEditAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setShowEditModal(true);
  };

  const handleDeleteAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAuthor) {
      deleteMutation.mutate(selectedAuthor.id);
    }
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
    toast({ title: "تم التحديث", description: "تم تحديث قائمة المؤلفين" });
  };

  const filteredAuthors = authors.filter((author: any) =>
    author.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (author.bio && author.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const paginatedAuthors = filteredAuthors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: TableColumn<any>[] = [
    {
      key: "image_url",
      label: "الصورة",
      render: (value: string) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
          {value ? (
            <img
              src={value}
              alt="صورة المؤلف"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
              }}
            />
          ) : (
            <User className="h-5 w-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "اسم المؤلف",
      sortable: true,
      render: (value: string, author: any) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {author.book_num || 0} كتاب
          </div>
        </div>
      ),
    },
    {
      key: "bio",
      label: "نبذة تعريفية",
      render: (value: string | null) => (
        <div className="text-sm text-muted-foreground max-w-md">
          {value ? (
            <span className="line-clamp-2">{value}</span>
          ) : (
            <span className="italic">لا توجد نبذة تعريفية</span>
          )}
        </div>
      ),
    },
    {
      key: "Category_Id",
      label: "التصنيف",
      render: (value: string) => (
        <Badge variant="secondary" className="font-normal">{value ? value.slice(0, 8) + "..." : "غير مصنف"}</Badge>
      ),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (_, author: any) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditAuthor(author)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل المؤلف"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteAuthor(author)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="حذف المؤلف"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 min-h-screen" dir="rtl">
      {/* Enhanced Header Section - Unified Theme */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-4 sm:p-6 lg:p-8 text-white shadow-2xl border border-sidebar-border">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">إدارة المؤلفين</h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  مجموعة شاملة من المؤلفين العرب والكتاب المبدعين
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{authors.length} مؤلف</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>{categories.length} تصنيف</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{authors.reduce((total: number, author: any) => total + (author.book_num || 0), 0)} كتاب</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-white/10 rounded-xl p-1 backdrop-blur-sm">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="text-white hover:bg-white/20 flex-1 sm:flex-initial"
              >
                <List className="h-4 w-4" />
                <span className="ml-1 sm:hidden">جدول</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="text-white hover:bg-white/20 flex-1 sm:flex-initial"
              >
                <Grid className="h-4 w-4" />
                <span className="ml-1 sm:hidden">شبكة</span>
              </Button>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="text-sm sm:text-base">إضافة مؤلف جديد</span>
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-purple-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Compact Statistics Cards - Unified Dark Navy Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي المؤلفين</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{authors.length}</div>
            <p className="text-slate-400 text-xs">مؤلف مسجل</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي الكتب</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              {authors.reduce((total: number, author: any) => total + (author.book_num || 0), 0)}
            </div>
            <p className="text-slate-400 text-xs">كتاب منشور</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">التصنيفات</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{categories.length}</div>
            <p className="text-slate-400 text-xs">تصنيف متاح</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-orange-500 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">نشطين</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              {authors.filter((author: any) => (author.book_num || 0) > 0).length}
            </div>
            <p className="text-slate-400 text-xs">مؤلف نشط</p>
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
                placeholder="البحث في أسماء المؤلفين أو النبذات..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pr-10 h-10 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* View Actions */}
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
            <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex items-center">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`h-8 px-2 ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Cards Stack */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
        ) : paginatedAuthors.map((author: any) => (
          <div key={author.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                {author.image_url ? (
                  <img src={author.image_url} alt={author.name} className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                    }}
                  />
                ) : <User className="w-8 h-8 m-auto text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{author.name}</h3>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {author.Category_Id ? author.Category_Id.slice(0, 8) + "..." : "غير مصنف"}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" /> {author.book_num || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button size="sm" variant="ghost" className="flex-1 text-emerald-600 bg-emerald-50" onClick={() => handleEditAuthor(author)}>
                <Edit className="w-4 h-4 mr-2" /> تعديل
              </Button>
              <Button size="sm" variant="ghost" className="flex-1 text-red-600 bg-red-50" onClick={() => handleDeleteAuthor(author)}>
                <Trash2 className="w-4 h-4 mr-2" /> حذف
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && paginatedAuthors.length === 0 && (
          <div className="text-center py-8 text-slate-500">لا توجد نتائج</div>
        )}
      </div>

      {/* Desktop View - Grid vs Table */}
      <div className="hidden md:block pb-20">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedAuthors.map((author: any) => (
              <Card
                key={author.id}
                className="group hover:scale-[1.02] transition-all duration-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg rounded-xl bg-white dark:bg-slate-800 overflow-hidden"
              >
                <CardHeader className="pb-2 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                      {author.image_url ? (
                        <img
                          src={author.image_url}
                          alt={author.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <User className="h-8 w-8 m-auto mt-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate" title={author.name}>{author.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {author.book_num || 0} كتاب
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" onClick={() => handleEditAuthor(author)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleDeleteAuthor(author)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    {author.bio ? (
                      <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{author.bio}</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic min-h-[40px]">لا توجد نبذة تعريفية</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <FolderOpen className="h-3 w-3" />
                      <span className="truncate">
                        {author.Category_Id ? author.Category_Id.slice(0, 15) : "غير مصنف"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <DataTable
              data={paginatedAuthors}
              columns={columns}
              loading={isLoading}
              searchPlaceholder=""
              onSearch={() => { }}
              hideSearch={true}
              pagination={{
                page: currentPage,
                pageSize: itemsPerPage,
                total: filteredAuthors.length,
              }}
              onPageChange={(newPage: number) => setCurrentPage(newPage)}
            />
          </div>
        )}
      </div>

      {/* Pagination Controls - Only needed for Grid view or Mobile view since DataTable handles its own */}
      {totalPages > 1 && viewMode === "grid" && (
        <div className="flex items-center justify-center gap-2 mt-8 pb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-white hover:bg-slate-50"
          >
            السابق
          </Button>
          <span className="text-sm text-slate-600 mx-2">
            صفحة {currentPage} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-white hover:bg-slate-50"
          >
            التالي
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddAuthorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
          setShowAddModal(false);
        }}
      />

      <EditAuthorModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAuthor(null);
        }}
        author={selectedAuthor}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
          setShowEditModal(false);
          setSelectedAuthor(null);
        }}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        title="حذف المؤلف"
        description={`هل أنت متأكد من رغبتك في حذف المؤلف "${selectedAuthor?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
}