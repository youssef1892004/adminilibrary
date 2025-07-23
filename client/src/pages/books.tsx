import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Book, Author, Category } from "@shared/schema";
import { TableColumn } from "@/types";
import { Plus, BookOpen, Eye, Edit, Trash2, FileText, Users, FolderOpen, FileCheck, Search, Filter, Grid, List } from "lucide-react";
import AddBookModal from "@/components/modals/add-book-modal";
import EditBookModal from "@/components/modals/edit-book-modal";
import ConfirmModal from "@/components/modals/confirm-modal";

export default function Books() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch books with authors and categories
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["/api/books"],
    queryFn: libraryApi.getBooks,
  });

  // Fetch authors for dropdown
  const { data: authors = [] } = useQuery({
    queryKey: ["/api/authors"],
    queryFn: libraryApi.getAuthors,
  });

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: libraryApi.getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (bookId: string) => libraryApi.deleteBook(bookId),
    onSuccess: () => {
      toast({
        title: "تم حذف الكتاب",
        description: "تم حذف الكتاب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setShowDeleteModal(false);
      setSelectedBook(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف الكتاب",
        description: error.message || "حدث خطأ أثناء حذف الكتاب",
        variant: "destructive",
      });
    },
  });

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const handleDeleteBook = (book: Book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBook) {
      deleteMutation.mutate(selectedBook.id);
    }
  };

  const filteredBooks = books.filter((book: any) =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.ISBN?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: TableColumn<any>[] = [
    {
      key: "coverImage",
      label: "الغلاف",
      render: (value: string) => (
        <div className="w-12 h-16 rounded-md overflow-hidden bg-gray-100">
          <img 
            src={value || "/placeholder-book.svg"} 
            alt="غلاف الكتاب" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E";
            }}
          />
        </div>
      ),
    },
    {
      key: "title",
      label: "العنوان",
      sortable: true,
      render: (value: string, book: any) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">
            ISBN: {book.ISBN}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "الوصف",
      render: (value: string) => (
        <div className="text-sm text-muted-foreground max-w-md">
          {value ? (
            <span className="line-clamp-2">{value}</span>
          ) : (
            <span className="italic">لا يوجد وصف</span>
          )}
        </div>
      ),
    },
    {
      key: "Category_id",
      label: "التصنيف",
      render: (value: string) => (
        <Badge variant="secondary">{value ? value.slice(0, 8) + "..." : "غير مصنف"}</Badge>
      ),
    },
    {
      key: "total_pages",
      label: "الصفحات",
      render: (value: number) => (
        <span className="text-sm">{value || 0} صفحة</span>
      ),
    },
    {
      key: "publicationDate",
      label: "تاريخ النشر",
      render: (value: string) => (
        <span className="text-sm">{value ? new Date(value).getFullYear() : "غير محدد"}</span>
      ),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (_, book: any) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = `/chapters?book=${book.id}`}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            title="عرض الفصول"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditBook(book)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل الكتاب"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteBook(book)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="حذف الكتاب"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 min-h-screen" dir="rtl">
      {/* Enhanced Header Section - Responsive */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">إدارة المكتبة</h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  مجموعة شاملة من الكتب العربية والمحتوى الرقمي
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{books.length} كتاب</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{authors.length} مؤلف</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>{categories.length} تصنيف</span>
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
              <span className="text-sm sm:text-base">إضافة كتاب جديد</span>
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-purple-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Compact Statistics Cards - Smaller and More Elegant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl rounded-lg lg:rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-blue-100">إجمالي الكتب</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{books.length}</div>
            <p className="text-blue-100 text-xs">كتاب في المكتبة</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl rounded-lg lg:rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-purple-100">المؤلفون</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{authors.length}</div>
            <p className="text-purple-100 text-xs">مؤلف مسجل</p>
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
            <CardTitle className="text-xs font-medium text-orange-100">إجمالي الصفحات</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              {books.reduce((total: number, book: any) => total + (parseInt(book.total_pages) || 0), 0).toLocaleString()}
            </div>
            <p className="text-orange-100 text-xs">صفحة إجمالية</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Data Table - Responsive */}
      <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl lg:rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 bg-blue-100 rounded-xl">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">مكتبة الكتب العربية</CardTitle>
                <p className="text-slate-600 text-xs sm:text-sm mt-1">إدارة شاملة للمحتوى الرقمي والكتب الإلكترونية</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 order-2 sm:order-1">
                <Search className="h-4 w-4 text-slate-500" />
                <span className="text-xs sm:text-sm text-slate-600">{filteredBooks.length} من {books.length} كتاب</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 order-1 sm:order-2">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-lg flex-1 sm:flex-initial"
                >
                  <List className="h-4 w-4" />
                  <span className="ml-1 sm:hidden">جدول</span>
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg flex-1 sm:flex-initial"
                >
                  <Grid className="h-4 w-4" />
                  <span className="ml-1 sm:hidden">شبكة</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === "table" ? (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="overflow-x-auto">
                <DataTable
                  data={filteredBooks}
                  columns={columns}
                  loading={isLoading}
                  searchPlaceholder="البحث في الكتب والمؤلفين والأوصاف..."
                  onSearch={setSearchQuery}
                />
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredBooks.map((book: any) => (
                  <div
                    key={book.id}
                    className="group relative bg-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200"
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                      <img
                        src={book.coverImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='1.5'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E"}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Mobile-friendly action buttons */}
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.location.href = `/chapters?book=${book.id}`}
                            className="flex-1 bg-white/90 text-slate-900 hover:bg-white text-xs sm:text-sm px-2 sm:px-3"
                          >
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                            <span className="hidden sm:inline">الفصول</span>
                            <span className="sm:hidden">فصول</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditBook(book)}
                            className="bg-white/90 text-slate-900 hover:bg-white px-2 sm:px-3"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDeleteBook(book)}
                            className="bg-white/90 text-red-600 hover:bg-red-50 px-2 sm:px-3"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-sm sm:text-base">{book.title}</h3>
                      <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{book.total_pages || 0} صفحة</span>
                        </div>
                        {book.publicationDate && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{new Date(book.publicationDate).getFullYear()}</span>
                          </div>
                        )}
                        {book.ISBN && (
                          <div className="text-xs bg-slate-100 px-2 py-1 rounded-lg truncate">
                            <span className="hidden sm:inline">ISBN: </span>{book.ISBN}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  // Loading skeleton for grid view
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-slate-200 rounded-xl aspect-[3/4] mb-3"></div>
                        <div className="p-3 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {filteredBooks.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-8 sm:py-12">
                    <div className="text-slate-400 mb-4">
                      <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
                      <p className="text-base sm:text-lg font-medium">لا توجد كتب تطابق البحث</p>
                      <p className="text-sm">جرب تغيير كلمات البحث أو أضف كتباً جديدة</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddBookModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        authors={authors}
        categories={categories}
      />

      <EditBookModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        book={selectedBook}
        authors={authors}
        categories={categories}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        title="حذف الكتاب"
        description={`هل أنت متأكد من حذف كتاب "${selectedBook?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}