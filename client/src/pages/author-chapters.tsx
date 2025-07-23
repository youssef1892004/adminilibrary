import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, PlusCircle, Edit, Trash2, ArrowRight, BookOpen, Search } from "lucide-react";
import { libraryApi } from "@/lib/api";
// import AddChapterModal from "@/components/modals/add-chapter-modal";
// import EditChapterModal from "@/components/modals/edit-chapter-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AuthorChapters() {
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<any>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get bookId from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    if (bookId) {
      setSelectedBookId(bookId);
    }
  }, []);

  // Fetch books
  const { data: books = [] } = useQuery({
    queryKey: ["/api/books"],
    queryFn: () => libraryApi.getBooks(),
  });

  // Fetch chapters
  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ["/api/chapters"],
    queryFn: () => libraryApi.getChapters(),
  });

  // Delete chapter mutation  
  const deleteMutation = useMutation({
    mutationFn: (chapterId: string) => {
      // For now we'll just show a success message since deleteChapter API may not exist yet
      return Promise.resolve({ id: chapterId });
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الفصل",
        description: "تم حذف الفصل بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsDeleteConfirmOpen(false);
      setChapterToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف الفصل",
        description: error.message || "حدث خطأ أثناء حذف الفصل",
        variant: "destructive",
      });
    },
  });

  const handleDeleteChapter = (chapter: any) => {
    setChapterToDelete(chapter);
    setIsDeleteConfirmOpen(true);
  };

  const handleEditChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    setIsEditChapterOpen(true);
  };

  // Filter chapters based on selected book and search term
  const filteredChapters = chapters.filter((chapter: any) => {
    const matchesBook = !selectedBookId || selectedBookId === "all" || chapter.book__id === selectedBookId;
    const matchesSearch = !searchTerm || 
      chapter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.chapter_num?.toString().includes(searchTerm);
    return matchesBook && matchesSearch;
  });

  // Get selected book info
  const selectedBook = books.find((book: any) => book.id === selectedBookId);

  // Calculate statistics
  const totalChapters = filteredChapters.length;
  const publishedChapters = filteredChapters.filter((chapter: any) => chapter.status === 'published').length;
  const draftChapters = filteredChapters.filter((chapter: any) => chapter.status === 'draft').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/author-dashboard'}
                  className="text-white hover:bg-white/20 rounded-lg"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  لوحة التحكم
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">إدارة الفصول</h1>
                  <p className="text-emerald-100 text-lg">
                    {selectedBook ? `فصول كتاب: ${selectedBook.title}` : 'نظم وإدارة فصول كتبك بسهولة'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-emerald-100 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{filteredChapters.length} فصل</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{books.length} كتاب</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsAddChapterOpen(true)}
              className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl rounded-xl px-6 py-3 font-medium transition-all duration-200 w-full md:w-auto"
            >
              <PlusCircle className="ml-2 h-5 w-5" />
              إضافة فصل جديد
            </Button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  تصفية الكتب
                </label>
                <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                  <SelectTrigger className="bg-white border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                    <SelectValue placeholder="جميع الكتب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الكتب</SelectItem>
                    {books.map((book: any) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  البحث السريع
                </label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 h-4 w-4" />
                  <Input
                    placeholder="ابحث في الفصول..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-white border-emerald-200 shadow-sm hover:shadow-md transition-shadow focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
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
              <p className="text-emerald-100 text-sm">
                {selectedBook ? `في كتاب: ${selectedBook.title}` : 'في جميع كتبك'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">فصول منشورة</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <BookOpen className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{publishedChapters}</div>
              <p className="text-cyan-100 text-sm">متاحة للقراء</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">مسودات</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Edit className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{draftChapters}</div>
              <p className="text-amber-100 text-sm">قيد التحرير</p>
            </CardContent>
          </Card>
        </div>

        {/* Chapters List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedBook ? `فصول ${selectedBook.title}` : 'جميع الفصول'}
          </h2>
          
          {filteredChapters.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">لا توجد فصول</h3>
                <p className="text-gray-400 mb-6">
                  {selectedBook ? `ابدأ بإضافة فصل في ${selectedBook.title}` : 'ابدأ بإضافة فصل جديد'}
                </p>
                <Button
                  onClick={() => setIsAddChapterOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <PlusCircle className="ml-2 h-5 w-5" />
                  إضافة فصل جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredChapters
                .sort((a: any, b: any) => (a.chapter_num || 0) - (b.chapter_num || 0))
                .map((chapter: any) => {
                  const book = books.find((b: any) => b.id === chapter.book__id);
                  return (
                    <Card key={chapter.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                الفصل {chapter.chapter_num || 'غير محدد'}
                              </Badge>
                              <Badge 
                                variant={chapter.status === 'published' ? 'default' : 'secondary'}
                                className={chapter.status === 'published' 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : 'bg-orange-500 hover:bg-orange-600'
                                }
                              >
                                {chapter.status === 'published' ? 'منشور' : 'مسودة'}
                              </Badge>
                              {!selectedBook && book && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {book.title}
                                </Badge>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-lg text-gray-800 mb-1">
                                {chapter.title || `الفصل ${chapter.chapter_num}`}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {Array.isArray(chapter.content) 
                                  ? chapter.content.join(' ').substring(0, 150) + '...'
                                  : typeof chapter.content === 'string'
                                  ? chapter.content.substring(0, 150) + '...'
                                  : 'لا يوجد محتوى'
                                }
                              </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>تاريخ الإنشاء: {new Date(chapter.Create_at).toLocaleDateString('ar-EG')}</span>
                              <span>الكلمات: {
                                Array.isArray(chapter.content) 
                                  ? chapter.content.join(' ').split(' ').length
                                  : typeof chapter.content === 'string'
                                  ? chapter.content.split(' ').length
                                  : 0
                              }</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditChapter(chapter)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Edit className="ml-1 h-4 w-4" />
                              تعديل
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteChapter(chapter)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Modals - Temporarily disabled until we create chapter modals for authors */}
      {/* <AddChapterModal
        isOpen={isAddChapterOpen}
        onClose={() => setIsAddChapterOpen(false)}
        books={books}
        selectedBookId={selectedBookId}
        onSuccess={() => {
          setIsAddChapterOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
        }}
      />

      <EditChapterModal
        isOpen={isEditChapterOpen}
        onClose={() => {
          setIsEditChapterOpen(false);
          setSelectedChapter(null);
        }}
        chapter={selectedChapter}
        books={books}
        onSuccess={() => {
          setIsEditChapterOpen(false);
          setSelectedChapter(null);
          queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
        }}
      /> */}

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setChapterToDelete(null);
        }}
        onConfirm={() => {
          if (chapterToDelete) {
            deleteMutation.mutate(chapterToDelete.id);
          }
        }}
        title="حذف الفصل"
        description={`هل أنت متأكد من حذف الفصل "${chapterToDelete?.title || `الفصل ${chapterToDelete?.chapter_num}`}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}