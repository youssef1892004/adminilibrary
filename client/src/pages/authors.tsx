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
import { Plus, Users, Edit, Trash2, Search, Filter, Grid, List, BookOpen, User, FileCheck, FolderOpen } from "lucide-react";
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

  const filteredAuthors = authors.filter((author: any) =>
    author.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (author.bio && author.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns: TableColumn<any>[] = [
    {
      key: "image_url",
      label: "الصورة",
      render: (value: string) => (
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
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
            <User className="h-6 w-6 text-gray-400" />
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
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">
            {author.book_num || 0} كتاب
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
        <Badge variant="secondary">{value ? value.slice(0, 8) + "..." : "غير مصنف"}</Badge>
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 min-h-screen" dir="rtl">
      {/* Enhanced Header Section - Responsive */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">إدارة المؤلفين</h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
                  مجموعة شاملة من المؤلفين العرب والكتاب المبدعين
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-purple-100 text-sm">
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
              className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-200 w-full sm:w-auto"
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

      {/* Compact Statistics Cards - Smaller and More Elegant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl rounded-lg lg:rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-purple-100">إجمالي المؤلفين</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{authors.length}</div>
            <p className="text-purple-100 text-xs">مؤلف مسجل</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl rounded-lg lg:rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-indigo-100">إجمالي الكتب</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              {authors.reduce((total: number, author: any) => total + (author.book_num || 0), 0)}
            </div>
            <p className="text-indigo-100 text-xs">كتاب منشور</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl rounded-lg lg:rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-emerald-100">التصنيفات</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{categories.length}</div>
            <p className="text-emerald-100 text-xs">تصنيف متاح</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl rounded-lg lg:rounded-xl overflow-hidden col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-orange-100">نشطين</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              {authors.filter((author: any) => (author.book_num || 0) > 0).length}
            </div>
            <p className="text-orange-100 text-xs">مؤلف نشط</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-600" />
              البحث والتصفية
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في أسماء المؤلفين أو النبذات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Authors Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {viewMode === "table" ? (
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <List className="h-5 w-5 text-purple-600" />
                  قائمة المؤلفين ({filteredAuthors.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  data={filteredAuthors}
                  columns={columns}
                  loading={isLoading}
                  searchPlaceholder=""
                  onSearch={() => {}}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredAuthors.map((author: any) => (
                <Card 
                  key={author.id} 
                  className="group hover:scale-[1.02] transition-all duration-300 border-0 shadow-lg hover:shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shadow-inner">
                        {author.image_url ? (
                          <img 
                            src={author.image_url} 
                            alt={author.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%237c3aed' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <User className="h-8 w-8 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{author.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {author.book_num || 0} كتاب
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {author.bio ? (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{author.bio}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">لا توجد نبذة تعريفية</p>
                      )}
                      
                      {author.Category_Id && (
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {author.Category_Id.slice(0, 8)}...
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredAuthors.length === 0 && !isLoading && (
            <Card className="border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد مؤلفين</h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  {searchQuery ? "لم يتم العثور على مؤلفين مطابقين لبحثك" : "لم يتم إضافة أي مؤلفين بعد"}
                </p>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-3"
                >
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة أول مؤلف
                </Button>
              </CardContent>
            </Card>
          )}
        </>
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
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAuthor(null);
        }}
        onConfirm={handleConfirmDelete}
        title="حذف المؤلف"
        message={`هل أنت متأكد من رغبتك في حذف المؤلف "${selectedAuthor?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        destructive
      />
    </div>
  );
}