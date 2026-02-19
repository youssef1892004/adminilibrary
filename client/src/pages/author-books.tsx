import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, PlusCircle, Edit, Trash2, Search, Grid, List, Save, X, FileText } from "lucide-react";
import { libraryApi } from "@/lib/api";
import ConfirmModal from "@/components/modals/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ui/image-upload";

export default function AuthorBooks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<any>(null);
  const [currentAuthorId, setCurrentAuthorId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "",
    ISBN: "",
    total_pages: "",
    chapter_num: "",
    publicationDate: "",
    Category_id: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Clear cache when component mounts to ensure fresh data
  useEffect(() => {
    console.log("AuthorBooks mounted - ensuring fresh data");
    // queryClient.invalidateQueries({ queryKey: ["/api/books"] });
  }, []);

  // Get current user session and author info
  const { data: sessionData } = useQuery({
    queryKey: ["/api/session"],
    queryFn: async () => {
      const response = await fetch("/api/session", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Not authenticated");
      }
      return response.json();
    },
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Update currentAuthorId when session data changes
  useEffect(() => {
    if (sessionData?.user?.authorId) {
      setCurrentAuthorId(sessionData.user.authorId);
      console.log("Current Author ID set to:", sessionData.user.authorId);
    }
  }, [sessionData]);

  // Fetch books using dedicated author endpoint
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["/api/author/books"],
    queryFn: async () => {
      const response = await fetch("/api/author/books", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => libraryApi.getCategories(),
  });

  // Delete book mutation - uses dedicated author endpoint
  const deleteMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const response = await fetch(`/api/author/books/${bookId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطأ في حذف الكتاب");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الكتاب",
        description: "تم حذف الكتاب بنجاح",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/author/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/author-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
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

  // Update book mutation - uses dedicated author endpoint
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; book: any }) => {
      const response = await fetch(`/api/author/books/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data.book),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطأ في تحديث الكتاب");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الكتاب",
        description: "تم تحديث بيانات الكتاب بنجاح",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/author/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/author-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsEditModalOpen(false);
      setSelectedBook(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الكتاب",
        description: error.message || "حدث خطأ أثناء تحديث الكتاب",
        variant: "destructive",
      });
    },
  });

  // Create book mutation - uses dedicated author endpoint
  const createMutation = useMutation({
    mutationFn: async (book: any) => {
      const response = await fetch("/api/author/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(book),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطأ في إضافة الكتاب");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الكتاب",
        description: "تم إضافة الكتاب الجديد بنجاح",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/author/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/author-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة الكتاب",
        description: error.message || "حدث خطأ أثناء إضافة الكتاب",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      coverImage: "",
      ISBN: "",
      total_pages: "",
      chapter_num: "",
      publicationDate: "",
      Category_id: ""
    });
  };

  const handleEditBook = (book: any) => {
    setSelectedBook(book);
    setFormData({
      title: book.title || "",
      description: book.description || "",
      coverImage: book.coverImage || "",
      ISBN: book.ISBN?.toString() || "",
      total_pages: book.total_pages?.toString() || "",
      chapter_num: book.chapter_num?.toString() || "",
      publicationDate: book.publicationDate || "",
      Category_id: book.Category_id || ""
    });
    setIsEditModalOpen(true);
  };

  const handleAddBook = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveBook = () => {
    // For creating books, don't include author_id - backend will assign it automatically based on session
    const bookData = {
      title: formData.title || "",
      description: formData.description || "",
      cover_URL: formData.coverImage || "",
      ISBN: formData.ISBN || "",
      total_pages: formData.total_pages ? parseInt(formData.total_pages) : 1,
      parts_num: formData.chapter_num ? parseInt(formData.chapter_num) : 1,
      publication_date: formData.publicationDate || new Date().toISOString().split('T')[0],
      category_id: formData.Category_id || null,
      most_view: 0
    };

    console.log("Book data to save:", bookData);

    if (selectedBook) {
      updateMutation.mutate({ id: selectedBook.id, book: bookData });
    } else {
      createMutation.mutate(bookData);
    }
  };

  // Filter books based on search term
  const filteredBooks = books.filter((book: any) =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalBooks = books.length;
  const totalPages = books.reduce((sum: number, book: any) => sum + (book.total_pages || 0), 0);
  const totalChapters = books.reduce((sum: number, book: any) => sum + (book.chapter_num || 0), 0);
  const averagePages = totalBooks > 0 ? Math.round(totalPages / totalBooks) : 0;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 lg:space-y-8 min-h-screen bg-slate-50" dir="rtl">

      {/* Enhanced Header Section - Consistent with Dashboard */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-8 md:p-10 text-white shadow-xl border border-sidebar-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <BookOpen className="h-6 w-6 text-blue-200" />
              </div>
              <span className="text-blue-200 font-medium">إدارة المحتوى</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">إدارة الكتب</h1>
            <p className="text-blue-100/80 text-lg max-w-2xl">
              إدارة شاملة لمكتبة الكتب الخاصة بك، إضافة وتعديل الكتب بسهولة
            </p>
          </div>

          <Button
            onClick={handleAddBook}
            className="bg-white text-sidebar-primary hover:bg-blue-50 font-medium shadow-sm hover:shadow-md transition-all px-6 py-6 h-auto rounded-xl flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            <span>إضافة كتاب جديد</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Minimal Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">إجمالي الكتب</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalBooks}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">إجمالي الصفحات</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalPages.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-purple-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">إجمالي الفصول</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalChapters}</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-orange-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">متوسط الصفحات</p>
                <h3 className="text-2xl font-bold text-slate-900">{averagePages}</h3>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:w-auto relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="ابحث عن كتاب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : ''}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Display */}
      {filteredBooks.length === 0 ? (
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد كتب"}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {searchTerm
                  ? `لم يتم العثور على كتب تحتوي على "${searchTerm}"`
                  : "ابدأ بإضافة أول كتاب لك لبناء مكتبتك الرقمية"
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleAddBook}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة كتاب جديد
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredBooks.map((book: any) => (
            <Card key={book.id} className="group border-0 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              {viewMode === "grid" ? (
                <>
                  {/* Grid View */}
                  <div className="relative h-52 bg-slate-100 overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <BookOpen className="h-12 w-12 text-slate-400" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => handleEditBook(book)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="rounded-full shadow-lg" onClick={() => handleDeleteBook(book)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="absolute top-2 left-2">
                      <Badge className="bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm hover:bg-white">
                        {book.chapter_num || 0} فصل
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {book.title || "بدون عنوان"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[2.5em]">
                        {book.description || "لا يوجد وصف"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {book.total_pages || 0} صفحة
                      </span>
                      <span>{book.publicationDate ? new Date(book.publicationDate).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-4">
                  {/* List View */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 truncate">
                        {book.title || "بدون عنوان"}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {book.description || "لا يوجد وصف"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <Badge variant="outline" className="text-slate-500 border-slate-200 font-normal">
                          {book.chapter_num || 0} فصل
                        </Badge>
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {book.total_pages || 0} صفحة</span>
                        <span>ISBN: {book.ISBN || "غير محدد"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEditBook(book)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteBook(book)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="تأكيد حذف الكتاب"
        description={`هل أنت متأكد من حذف الكتاب "${bookToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={() => bookToDelete && deleteMutation.mutate(bookToDelete.id)}
        onOpenChange={(open) => {
          setIsDeleteConfirmOpen(open);
          if (!open) {
            setBookToDelete(null);
          }
        }}
        isLoading={deleteMutation.isPending}
      />

      {/* Edit/Add Book Modal */}
      <Dialog open={isEditModalOpen || isAddModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditModalOpen(false);
          setIsAddModalOpen(false);
          setSelectedBook(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedBook ? "تعديل الكتاب" : "إضافة كتاب جديد"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">عنوان الكتاب</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="أدخل عنوان الكتاب"
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">وصف الكتاب</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="أدخل وصف مختصر للكتاب"
                rows={3}
                className="w-full resize-none"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-sm font-medium">رابط صورة الغلاف</Label>
              <ImageUpload
                value={formData.coverImage}
                onChange={(url) => handleInputChange("coverImage", url)}
                folder="books"
                placeholder="اضغط لتحميل صورة الغلاف"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">الفئة</Label>
              <Select
                value={formData.Category_id}
                onValueChange={(value) => handleInputChange("Category_id", value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر فئة الكتاب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون فئة</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ISBN and Pages Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ISBN" className="text-sm font-medium">رقم ISBN</Label>
                <Input
                  id="ISBN"
                  type="number"
                  value={formData.ISBN}
                  onChange={(e) => handleInputChange("ISBN", e.target.value)}
                  placeholder="أدخل رقم ISBN"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_pages" className="text-sm font-medium">عدد الصفحات</Label>
                <Input
                  id="total_pages"
                  type="number"
                  value={formData.total_pages}
                  onChange={(e) => handleInputChange("total_pages", e.target.value)}
                  placeholder="أدخل عدد الصفحات"
                  className="w-full"
                />
              </div>
            </div>

            {/* Chapters and Publication Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chapter_num" className="text-sm font-medium">عدد الفصول</Label>
                <Input
                  id="chapter_num"
                  type="number"
                  value={formData.chapter_num}
                  onChange={(e) => handleInputChange("chapter_num", e.target.value)}
                  placeholder="أدخل عدد الفصول"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicationDate" className="text-sm font-medium">تاريخ النشر</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) => handleInputChange("publicationDate", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              onClick={handleSaveBook}
              disabled={updateMutation.isPending || createMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {(updateMutation.isPending || createMutation.isPending) ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>{selectedBook ? "تحديث الكتاب" : "إضافة الكتاب"}</span>
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setIsAddModalOpen(false);
                setSelectedBook(null);
                resetForm();
              }}
              className="flex-1"
            >
              <X className="h-4 w-4 ml-1" />
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}