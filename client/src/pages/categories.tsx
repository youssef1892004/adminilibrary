import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@shared/schema";
import { 
  Plus, 
  FolderOpen, 
  Edit, 
  Trash2, 
  Search,
  Grid3X3,
  List,
  Filter,
  Archive,
  Bookmark
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="animate-pulse space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-64"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-xl w-48"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              إدارة التصنيفات
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              إدارة وتنظيم تصنيفات المكتبة الإلكترونية
            </p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 
                     text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 
                     transition-all duration-200 rounded-xl px-6 py-3 text-base font-medium
                     w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 ml-2" />
            إضافة تصنيف جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">إجمالي التصنيفات</p>
                  <p className="text-3xl font-bold text-white">{categories.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FolderOpen className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">التصنيفات النشطة</p>
                  <p className="text-3xl font-bold text-white">{filteredCategories.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Archive className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">نتائج البحث</p>
                  <p className="text-3xl font-bold text-white">{filteredCategories.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Filter className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">المفضلة</p>
                  <p className="text-3xl font-bold text-white">{categories.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Bookmark className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and View Controls */}
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="البحث في التصنيفات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Display */}
      {filteredCategories.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="p-6 bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <FolderOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد تصنيفات</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'لم يتم العثور على تصنيفات تطابق البحث' : 'لم يتم إنشاء أي تصنيفات بعد'}
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة تصنيف جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            : "space-y-4"
        }>
          {filteredCategories.map((category: Category, index: number) => (
            <Card
              key={category.id}
              className="group bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-2xl 
                       transform hover:scale-105 transition-all duration-300 rounded-2xl overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <CardContent className="p-6">
                <div className={`flex ${viewMode === 'list' ? 'flex-row items-center justify-between' : 'flex-col'} gap-4`}>
                  <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'flex-col text-center' : ''}`}>
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
                      <FolderOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className={viewMode === 'grid' ? 'text-center' : ''}>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">
                        ID: {category.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex gap-2 ${viewMode === 'grid' ? 'justify-center w-full' : ''}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      className="group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 
                               transition-all duration-200 rounded-xl"
                    >
                      <Edit className="h-4 w-4" />
                      {viewMode === 'list' && <span className="mr-2">تعديل</span>}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      className="group-hover:bg-red-50 group-hover:border-red-200 group-hover:text-red-600 
                               transition-all duration-200 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                      {viewMode === 'list' && <span className="mr-2">حذف</span>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}