import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import { libraryApi } from "@/lib/api";
// import AddBookModal from "@/components/modals/add-book-modal";
// import EditBookModal from "@/components/modals/edit-book-modal";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة تحكم المؤلف</h1>
            <p className="text-gray-600">إدارة كتبك وفصولك</p>
          </div>
          <Button
            onClick={() => setIsAddBookOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusCircle className="ml-2 h-5 w-5" />
            إضافة كتاب جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">إجمالي الكتب</CardTitle>
                <BookOpen className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBooks}</div>
              <p className="text-blue-100 text-sm mt-1">جميع كتبك</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">إجمالي الفصول</CardTitle>
                <FileText className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalChapters}</div>
              <p className="text-emerald-100 text-sm mt-1">في جميع الكتب</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">كتب منشورة</CardTitle>
                <Eye className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{publishedBooks}</div>
              <p className="text-green-100 text-sm mt-1">متاحة للقراء</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">مسودات</CardTitle>
                <Edit className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{draftBooks}</div>
              <p className="text-orange-100 text-sm mt-1">قيد التحرير</p>
            </CardContent>
          </Card>
        </div>

        {/* Books Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">كتبي</h2>
          
          {books.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">لا توجد كتب</h3>
                <p className="text-gray-400 mb-6">ابدأ بإضافة كتابك الأول</p>
                <Button
                  onClick={() => setIsAddBookOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <PlusCircle className="ml-2 h-5 w-5" />
                  إضافة كتاب جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book: any) => (
                <Card key={book.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-200 overflow-hidden">
                  <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-blue-100 relative">
                    {book.image_url ? (
                      <img
                        src={book.image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-purple-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={book.status === 'published' ? 'default' : 'secondary'}
                        className={book.status === 'published' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-orange-500 hover:bg-orange-600'
                        }
                      >
                        {book.status === 'published' ? 'منشور' : 'مسودة'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{book.description || 'لا يوجد وصف'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>الفصول: {book.chapters_count || 0}</span>
                      <span>الصفحات: {book.pages_num || 0}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewChapters(book)}
                        className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <FileText className="ml-1 h-4 w-4" />
                        الفصول
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBook(book)}
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Edit className="ml-1 h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBook(book)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
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

      {/* Modals - Temporarily disabled until we create book modals for authors */}
      {/* <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        categories={categories}
        onSuccess={() => {
          setIsAddBookOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/books"] });
        }}
      />

      <EditBookModal
        isOpen={isEditBookOpen}
        onClose={() => {
          setIsEditBookOpen(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
        categories={categories}
        onSuccess={() => {
          setIsEditBookOpen(false);
          setSelectedBook(null);
          queryClient.invalidateQueries({ queryKey: ["/api/books"] });
        }}
      /> */}

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setBookToDelete(null);
        }}
        onConfirm={() => {
          if (bookToDelete) {
            deleteMutation.mutate(bookToDelete.id);
          }
        }}
        title="حذف الكتاب"
        description={`هل أنت متأكد من حذف الكتاب "${bookToDelete?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}