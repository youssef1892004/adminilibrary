import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, PlusCircle, Edit, Trash2, Eye, LayoutDashboard, TrendingUp } from "lucide-react";
import { libraryApi } from "@/lib/api";
import ConfirmModal from "@/components/modals/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function AuthorDashboard() {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Clear cache when component mounts to ensure fresh data
  useEffect(() => {
    console.log("AuthorDashboard mounted - clearing cache for fresh data");
    queryClient.removeQueries({ queryKey: ["/api/auth/author-profile"] });
    queryClient.removeQueries({ queryKey: ["/api/books"] });
    queryClient.removeQueries({ queryKey: ["/api/chapters"] });
  }, []);

  // Fetch author's books
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["/api/books"],
    queryFn: () => libraryApi.getBooks(),
  });

  // Fetch categories for book creation
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => libraryApi.getCategories(),
  });





  // Delete book mutation
  const deleteMutation = useMutation({
    mutationFn: (bookId: string) => libraryApi.deleteBook(bookId),
    onSuccess: () => {
      toast({
        title: "تم حذف الكتاب",
        description: "تم حذف الكتاب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setIsDeleteConfirmOpen(false);
      setBookToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف الكتاب",
        description: error.message || "حدث خطأ أثناء حذف الكتاب",
        variant: "destructive",
      });
    },
  });

  const handleDeleteBook = (book: any) => {
    setBookToDelete(book);
    setIsDeleteConfirmOpen(true);
  };

  const handleEditBook = (book: any) => {
    setSelectedBook(book);
    setIsEditBookOpen(true);
  };

  const handleViewChapters = (book: any) => {
    // Navigate to chapters page with book filter
    window.location.href = `/author-chapters?bookId=${book.id}`;
  };

  // Calculate statistics
  const totalBooks = books.length;
  // Calculate total chapters from the books data which now has accurate counts
  const totalChapters = books.reduce((acc: number, book: any) => acc + (book.chapter_num || 0), 0);

  const publishedBooks = books.filter((book: any) => book.status === 'published').length;
  const draftBooks = books.filter((book: any) => book.status === 'draft').length;
  const averageChaptersPerBook = totalBooks > 0 ? Math.round(totalChapters / totalBooks) : 0;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="h-48 bg-gray-200 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50 min-h-screen" dir="rtl">

      {/* Unified Header Section */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-6 lg:p-10 text-white shadow-xl border border-sidebar-border">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <LayoutDashboard className="h-6 w-6 text-blue-200" />
              </div>
              <span className="text-blue-200 font-medium">لوحة التحكم</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              أهلاً وسهلاً بك في مكتبتك
            </h1>
            <p className="text-blue-100/80 text-lg max-w-2xl leading-relaxed">
              إدارة شاملة لمكتبتك الرقمية وأعمالك الأدبية مع أدوات متقدمة للتحكم والنشر
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            <Link href="/author-books">
              <Button className="w-full sm:w-auto bg-white text-sidebar-primary hover:bg-blue-50 font-medium shadow-sm hover:shadow-md transition-all text-base py-6 h-auto px-6 rounded-xl">
                <BookOpen className="ml-2 h-5 w-5" />
                إدارة الكتب
              </Button>
            </Link>
            <Link href="/author-chapters">
              <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-medium text-base py-6 h-auto px-6 rounded-xl backdrop-blur-sm">
                <FileText className="ml-2 h-5 w-5" />
                إدارة الفصول
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">الكتب المنشورة</h3>
                <div className="text-3xl font-bold text-slate-900">{totalBooks}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500">
              <span className="text-blue-600 font-medium ml-1">كتب</span>
              في مكتبتك الخاصة
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">إجمالي الفصول</h3>
                <div className="text-3xl font-bold text-slate-900">{totalChapters}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500">
              <span className="text-emerald-600 font-medium ml-1">{averageChaptersPerBook}</span>
              متوسط لكل كتاب
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden border-t-4 border-t-purple-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">المشاهدات</h3>
                <div className="text-3xl font-bold text-slate-900">0</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500">
              <TrendingUp className="h-3 w-3 ml-1 text-slate-400" />
              إحصائيات القراء
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">آخر الكتب المضافة</CardTitle>
          </CardHeader>
          <CardContent>
            {books.length > 0 ? (
              <div className="space-y-4">
                {books.slice(0, 3).map((book: any) => (
                  <div key={book.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{book.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            {book.chapter_num || 0} فصول
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleEditBook(book)}>
                      <Edit className="h-4 w-4 text-slate-500" />
                    </Button>
                  </div>
                ))}
                <Link href="/author-books">
                  <div className="text-center mt-4">
                    <Button variant="link" className="text-blue-600">عرض كل الكتب</Button>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p>لا توجد كتب مضافة بعد</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">نشاط حديث</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500">
              <p>سيتم عرض نشاطاتك الأخيرة هنا قريباً...</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="حذف الكتاب"
        description={`هل أنت متأكد من حذف كتاب "${bookToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={() => {
          if (bookToDelete) {
            deleteMutation.mutate(bookToDelete.id);
          }
        }}
        onOpenChange={(open) => {
          setIsDeleteConfirmOpen(open);
          if (!open) {
            setBookToDelete(null);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}