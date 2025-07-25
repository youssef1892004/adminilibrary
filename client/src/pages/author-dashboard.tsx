import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, PlusCircle, Edit, Trash2, Eye } from "lucide-react";
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

  // Fetch chapters for statistics
  const { data: chapters = [] } = useQuery({
    queryKey: ["/api/chapters"],
    queryFn: () => libraryApi.getChapters(),
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
  const totalChapters = chapters.length;
  const bookChapterCounts = books.map((book: any) => ({
    ...book,
    chapters_count: chapters.filter((chapter: any) => chapter.book__id === book.id).length
  }));
  const publishedBooks = books.filter((book: any) => book.status === 'published').length;
  const draftBooks = books.filter((book: any) => book.status === 'draft').length;
  const averageChaptersPerBook = totalBooks > 0 ? Math.round(totalChapters / totalBooks) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30 shadow-xl">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2 drop-shadow-lg">لوحة تحكم المؤلف</h1>
                  <p className="text-emerald-100 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">إدارة شاملة لمكتبتك الرقمية وأعمالك الأدبية مع أدوات متقدمة للتحكم والنشر</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 text-emerald-100 pt-4">
                <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm border border-white/20">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-white block">{totalBooks}</span>
                    <p className="text-sm opacity-90">كتاب منشور</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm border border-white/20">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-white block">{totalChapters}</span>
                    <p className="text-sm opacity-90">فصل إجمالي</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm border border-white/20">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-white block">{averageChaptersPerBook}</span>
                    <p className="text-sm opacity-90">متوسط الفصول</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
              <Link href="/author-books">
                <Button
                  className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl hover:shadow-2xl rounded-2xl px-8 py-6 font-bold text-lg transition-all duration-300 transform hover:scale-105 border-2 border-white/30 w-full"
                >
                  <BookOpen className="ml-3 h-6 w-6" />
                  إدارة الكتب
                </Button>
              </Link>
              <Link href="/author-chapters">
                <Button
                  className="bg-white/90 text-cyan-600 hover:bg-cyan-50 shadow-xl hover:shadow-2xl rounded-2xl px-8 py-6 font-bold text-lg transition-all duration-300 transform hover:scale-105 border-2 border-white/30 w-full"
                >
                  <FileText className="ml-3 h-6 w-6" />
                  إدارة الفصول
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center py-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              أهلاً وسهلاً بك في لوحة تحكم المؤلف
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              يمكنك استخدام الشريط العلوي للتنقل بين إدارة الكتب والفصول والملف الشخصي
            </p>
          </div>
        </div>
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