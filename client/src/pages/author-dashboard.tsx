import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import { libraryApi } from "@/lib/api";
import ConfirmModal from "@/components/modals/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AuthorDashboard() {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const totalChapters = books.reduce((sum: number, book: any) => sum + (book.chapters_count || 0), 0);
  const publishedBooks = books.filter((book: any) => book.status === 'published').length;
  const draftBooks = books.filter((book: any) => book.status === 'draft').length;

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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">لوحة تحكم المؤلف</h1>
                  <p className="text-indigo-100 text-lg">إدارة شاملة لكتبك وأعمالك الأدبية</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-indigo-100 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{totalBooks} كتاب</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{totalChapters} فصل</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsAddBookOpen(true)}
              className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl rounded-xl px-6 py-3 font-medium transition-all duration-200 w-full md:w-auto"
            >
              <PlusCircle className="ml-2 h-5 w-5" />
              إضافة كتاب جديد
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">إجمالي الكتب</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <BookOpen className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{totalBooks}</div>
              <p className="text-blue-100 text-sm">جميع أعمالك الأدبية</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">إجمالي الفصول</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <FileText className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{totalChapters}</div>
              <p className="text-emerald-100 text-sm">جميع الفصول المنشورة</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">كتب منشورة</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Eye className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{publishedBooks}</div>
              <p className="text-purple-100 text-sm">متاحة للقراء</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">مسودات</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Edit className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{draftBooks}</div>
              <p className="text-orange-100 text-sm">قيد التحرير</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Books Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">مكتبتي الشخصية</h2>
            <Button
              onClick={() => window.location.href = '/author-chapters'}
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <FileText className="ml-2 h-4 w-4" />
              إدارة الفصول
            </Button>
          </div>
          
          {books.length === 0 ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-16 text-center">
                <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">ابدأ رحلتك الأدبية</h3>
                <p className="text-gray-500 mb-8 text-lg">لا توجد كتب بعد. أضف كتابك الأول وشارك إبداعك مع العالم</p>
                <Button
                  onClick={() => setIsAddBookOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PlusCircle className="ml-2 h-6 w-6" />
                  إضافة كتابي الأول
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book: any) => (
                <Card key={book.id} className="border-0 shadow-xl bg-white hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
                  <div className="aspect-[3/4] bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
                    {book.image_url ? (
                      <img
                        src={book.image_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-20 w-20 text-indigo-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={book.status === 'published' ? 'default' : 'secondary'}
                        className={book.status === 'published' 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }
                      >
                        {book.status === 'published' ? 'منشور' : 'مسودة'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">{book.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{book.description || 'لا يوجد وصف متاح'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-indigo-600">
                        <FileText className="h-4 w-4" />
                        <span>{book.chapters_count || 0} فصل</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{book.pages_num || 0} صفحة</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewChapters(book)}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <FileText className="ml-1 h-4 w-4" />
                        الفصول
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBook(book)}
                        className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Edit className="ml-1 h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBook(book)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setBookToDelete(null);
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}