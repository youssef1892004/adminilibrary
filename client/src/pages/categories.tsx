import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@shared/schema";
import { TableColumn } from "@/types";
import {
  Plus,
  FolderOpen,
  Edit,
  Trash2,
  Search,
  Grid,
  List,
  RotateCcw,
  Archive,
  Bookmark,
  Hash
} from "lucide-react";
import AddCategoryModal from "@/components/modals/add-category-modal";
import EditCategoryModal from "@/components/modals/edit-category-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Categories() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: libraryApi.getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => libraryApi.deleteCategory(categoryId),
    onSuccess: () => {
      toast({
        title: "تم حذف التصنيف",
        description: "تم حذف التصنيف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowDeleteDialog(false);
      setSelectedCategory(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف التصنيف",
        description: error.message || "حدث خطأ أثناء حذف التصنيف",
        variant: "destructive",
      });
    },
  });

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    toast({ title: "تم التحديث", description: "تم تحديث قائمة التصنيفات" });
  };

  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const columns: TableColumn<Category>[] = [
    {
      key: "id",
      label: "المعرف",
      render: (value) => (
        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
          <Hash className="h-3 w-3" />
          {value.slice(0, 8)}...
        </div>
      )
    },
    {
      key: "name",
      label: "اسم التصنيف",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <FolderOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="font-medium text-slate-900">{value}</span>
        </div>
      )
    },
    {
      key: "created_at", // Assuming created_at exists, generic render
      label: "تاريخ الإنشاء",
      render: () => <span className="text-slate-500 text-sm">-</span>
    },
    {
      key: "actions", // Virtual key
      label: "الإجراءات",
      render: (_, category) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditCategory(category)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteCategory(category)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                <FolderOpen className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">إدارة التصنيفات</h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  إدارة وتنظيم تصنيفات المكتبة الإلكترونية
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>{categories.length} تصنيف</span>
              </div>
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <span>{filteredCategories.length} نشط</span>
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
              <span className="text-sm sm:text-base">إضافة تصنيف جديد</span>
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-purple-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Compact Statistics Cards - Unified Dark Navy Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي التصنيفات</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{categories.length}</div>
            <p className="text-slate-400 text-xs">تصنيف مسجل</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">التصنيفات النشطة</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
              <Archive className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{filteredCategories.length}</div>
            <p className="text-slate-400 text-xs">تصنيف نشط</p>
          </CardContent>
        </Card>

        {/* Placeholder cards for consistency */}
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-cyan-500 hidden lg:block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">جديد هذا الشهر</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">-</div>
            <p className="text-slate-400 text-xs">تصنيف جديد</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-blue-500 col-span-2 lg:col-span-1 hidden lg:block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">المفضلة</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">-</div>
            <p className="text-slate-400 text-xs">تم التفضيل</p>
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
                placeholder="البحث في التصنيفات..."
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
        ) : paginatedCategories.map((category: Category) => (
          <div key={category.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <FolderOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{category.name}</h3>
                <div className="text-xs text-slate-400 font-mono mt-1">ID: {category.id.slice(0, 8)}...</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button size="sm" variant="ghost" className="flex-1 text-blue-600 bg-blue-50" onClick={() => handleEditCategory(category)}>
                <Edit className="w-4 h-4 mr-2" /> تعديل
              </Button>
              <Button size="sm" variant="ghost" className="flex-1 text-red-600 bg-red-50" onClick={() => handleDeleteCategory(category)}>
                <Trash2 className="w-4 h-4 mr-2" /> حذف
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && paginatedCategories.length === 0 && (
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
            {paginatedCategories.map((category: Category, index: number) => (
              <Card
                key={category.id}
                className="group hover:scale-[1.02] transition-all duration-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg rounded-xl bg-white dark:bg-slate-800 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none">
                      <FolderOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{category.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        ID: {category.id.slice(0, 8)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2 w-full pt-4 border-t border-slate-100 dark:border-slate-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        className="flex-1 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        className="flex-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <DataTable
              data={paginatedCategories}
              columns={columns}
              loading={isLoading}
              searchPlaceholder="" // Search handled externally
              hideSearch={true}
              pagination={{
                page: currentPage,
                pageSize: itemsPerPage,
                total: filteredCategories.length,
              }}
              onPageChange={(newPage: number) => setCurrentPage(newPage)}
            />
          </div>
        )}
      </div>

      {/* Pagination Controls - Simple for Grid */}
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
      <AddCategoryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditCategoryModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        category={selectedCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">حذف التصنيف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف التصنيف "{selectedCategory?.name}"؟
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}