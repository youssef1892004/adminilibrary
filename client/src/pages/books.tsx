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
import { Plus, BookOpen, Eye, Edit, Trash2, FileText, Users, FolderOpen, FileCheck, Search, Filter, Grid, List, RotateCcw } from "lucide-react";
import AddBookModal from "@/components/modals/add-book-modal";
import EditBookModal from "@/components/modals/edit-book-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import { BookSearch } from "@/components/books/book-search";

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

  // Refetch handler
  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/books"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/authors"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] })
    ]);
    toast({ title: "تم التحديث", description: "تم تحديث قائمة الكتب" });
  };

  const filteredBooks = books.filter((book: any) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const titleMatch = book.title?.toLowerCase().includes(term);
    const isbnMatch = book.ISBN ? String(book.ISBN).toLowerCase().includes(term) : false;

    // Author match
    const author = authors.find((a: any) => a.id === book.author_id);
    const authorMatch = author ? author.name.toLowerCase().includes(term) : false;

    return titleMatch || isbnMatch || authorMatch;
  }).sort((a: any, b: any) => {
    // Sort by Publication Date (Newest First)
    return new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime();
  });

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
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-4 sm:p-6 lg:p-8 text-white shadow-2xl border border-sidebar-border">
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

      {/* Compact Statistics Cards - Unified Dark Navy Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي الكتب</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{books.length}</div>
            <p className="text-slate-400 text-xs">كتاب في المكتبة</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">المؤلفون</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{authors.length}</div>
            <p className="text-slate-400 text-xs">مؤلف مسجل</p>
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
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي الصفحات</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              {books.reduce((total: number, book: any) => total + (parseInt(book.total_pages) || 0), 0).toLocaleString()}
            </div>
            <p className="text-slate-400 text-xs">صفحة إجمالية</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1">
            <BookSearch
              books={books}
              authors={authors}
              onSearch={setSearchQuery}
              onSelect={(book) => setSearchQuery(book.title)}
            />
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
        {filteredBooks.map((book: any) => (
          <div key={book.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex gap-4">
              <img
                src={book.coverImage || "/placeholder-book.svg"}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E";
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{book.title}</h3>
                <p className="text-sm text-slate-500 mb-2 truncate">ISBN: {book.ISBN}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {categories.find((c: any) => c.id === book.Category_id)?.name || "غير مصنف"}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center">
                    <FileText className="w-3 h-3 mr-1" /> {book.total_pages}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => window.location.href = `/chapters?book=${book.id}`}>
                <FileText className="w-4 h-4 mr-2" /> الفصول
              </Button>
              <Button size="sm" variant="ghost" className="text-emerald-600 bg-emerald-50" onClick={() => handleEditBook(book)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600 bg-red-50" onClick={() => handleDeleteBook(book)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Grid vs Table */}
      <div className="hidden md:block pb-20">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book: any) => (
              <div key={book.id} className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
                <div className="aspect-[2/3] relative overflow-hidden bg-slate-100">
                  <img
                    src={book.coverImage || "/placeholder-book.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-slate-900" onClick={() => window.location.href = `/chapters?book=${book.id}`}>
                        <FileText className="w-4 h-4 mr-2" /> الفصول
                      </Button>
                      <div className="flex gap-1">
                        <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white text-emerald-600" onClick={() => handleEditBook(book)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white text-red-600" onClick={() => handleDeleteBook(book)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1" title={book.title}>{book.title}</h3>
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>{new Date(book.publicationDate).getFullYear()}</span>
                    <span>{book.total_pages} صفحة</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs font-normal">
                      {categories.find((c: any) => c.id === book.Category_id)?.name || "غير مصنف"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <DataTable
              data={filteredBooks}
              columns={columns}
              loading={isLoading}
              searchPlaceholder=""
              hideSearch={true}
            />
          </div>
        )}
      </div>

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