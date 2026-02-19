import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, PlusCircle, Edit, Trash2, ArrowRight, BookOpen, Search, Filter } from "lucide-react";
import { libraryApi } from "@/lib/api";
import AuthorAddChapterModal from "@/components/modals/author-add-chapter-modal";
import AuthorEditChapterModal from "@/components/modals/author-edit-chapter-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AuthorChapters() {
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<any>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Pagination & Search states
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Clear cache when component mounts to ensure fresh data
  useEffect(() => {
    console.log("AuthorChapters mounted - ensuring fresh data");
    // queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
  }, []);

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
    queryKey: ["/api/author/books"],
    queryFn: async () => {
      const res = await fetch("/api/author/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });

  // Fetch chapters with pagination
  const { data, isLoading } = useQuery<{ chapters: any[], total: number }>({
    queryKey: ["/api/chapters", page, limit, searchTerm, selectedBookId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        ...(selectedBookId ? { bookId: selectedBookId } : {})
      });
      const res = await fetch(`/api/chapters?${params}`);
      if (!res.ok) throw new Error('Failed to fetch chapters');
      return res.json();
    }
  });

  const chapters = data?.chapters || [];
  const totalChapters = data?.total || 0;
  const totalPages = Math.ceil(totalChapters / limit);
  // Optional: Client-side filtering if API doesn't fully support all filters mixed with search, 
  // but here we rely on API. 
  const filteredChapters = chapters;

  // Delete chapter mutation  
  const deleteMutation = useMutation({
    mutationFn: (chapterId: string) => libraryApi.deleteChapter(chapterId),
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

  // Create chapter mutation
  const createMutation = useMutation({
    mutationFn: (chapterData: any) => libraryApi.createChapter(chapterData),
    onSuccess: () => {
      toast({
        title: "تم إضافة الفصل",
        description: "تم إضافة الفصل بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsAddChapterOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة الفصل",
        description: error.message || "حدث خطأ أثناء إضافة الفصل",
        variant: "destructive",
      });
    },
  });

  // Edit chapter mutation
  const editMutation = useMutation({
    mutationFn: ({ chapterId, chapterData }: { chapterId: string; chapterData: any }) =>
      libraryApi.updateChapter(chapterId, chapterData),
    onSuccess: () => {
      toast({
        title: "تم تحديث الفصل",
        description: "تم تحديث الفصل بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsEditChapterOpen(false);
      setSelectedChapter(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الفصل",
        description: error.message || "حدث خطأ أثناء تحديث الفصل",
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

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 lg:space-y-8 min-h-screen bg-slate-50" dir="rtl">

      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-8 md:p-10 text-white shadow-xl border border-sidebar-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <FileText className="h-6 w-6 text-blue-200" />
              </div>
              <span className="text-blue-200 font-medium">إدارة المحتوى</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">إدارة الفصول</h1>
            <p className="text-blue-100/80 text-lg max-w-2xl">
              إدارة شاملة لفصول كتبك، كتابة وتعديل المحتوى
            </p>
          </div>

          <Button
            onClick={() => setIsAddChapterOpen(true)}
            className="bg-white text-sidebar-primary hover:bg-blue-50 font-medium shadow-sm hover:shadow-md transition-all px-6 py-6 h-auto rounded-xl flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            <span>إضافة فصل جديد</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">إجمالي الفصول</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalChapters}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">الفصول المعروضة</p>
                <h3 className="text-2xl font-bold text-slate-900">{filteredChapters.length}</h3>
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
                <p className="text-sm font-medium text-slate-500 mb-1">عدد الكتب</p>
                <h3 className="text-2xl font-bold text-slate-900">{books.length}</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Box */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:w-auto relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="ابحث في الفصول..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset page on search
                }}
                className="pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>

            {selectedBookId && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1.5 text-sm gap-2">
                  تصفية حسب كتاب محدد
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 rounded-full hover:bg-slate-200"
                    onClick={() => {
                      setSelectedBookId(null);
                      // Update URL to remove bookId without refresh
                      const url = new URL(window.location.href);
                      url.searchParams.delete('bookId');
                      window.history.pushState({}, '', url);
                    }}
                  >
                    <span className="sr-only">إزالة التصفية</span>
                    <span className="text-xs">×</span>
                  </Button>
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chapters List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-800">
            {filteredChapters.length > 0
              ? `قائمة الفصول (${filteredChapters.length})`
              : 'القائمة فارغة'
            }
          </h3>
          <div className="text-sm text-slate-500">
            {searchTerm && `نتائج البحث: "${searchTerm}"`}
          </div>
        </div>

        {filteredChapters.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-slate-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">لا توجد فصول</h3>
              <p className="text-slate-500 mb-6"> {searchTerm ? "عذرا، لم يتم العثور على نتائج" : "ابدأ بإضافة فصل جديد لمحتواك"}</p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsAddChapterOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="ml-2 h-5 w-5" />
                  إضافة فصل جديد
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredChapters
              .map((chapter: any) => {
                const book = books.find((b: any) => b.id === chapter.book__id);
                return (
                  <Card key={chapter.id} className="group border-0 shadow-sm bg-white hover:shadow-md transition-all duration-200 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Chapter Icon/Number */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg border border-blue-100">
                            {chapter.chapter_num || '#'}
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                              {chapter.title || `الفصل ${chapter.chapter_num}`}
                            </h3>
                            {book && (
                              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-normal text-xs">
                                <BookOpen className="w-3 h-3 ml-1" />
                                {book.title}
                              </Badge>
                            )}
                          </div>

                          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                            {Array.isArray(chapter.content)
                              ? 'محتوى متعدد الفقرات'
                              : typeof chapter.content === 'string'
                                ? chapter.content.substring(0, 150) + '...'
                                : 'لا يوجد محتوى'
                            }
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                            <span>تاريخ الإنشاء: {new Date(chapter.Create_at).toLocaleDateString('ar-EG')}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>
                              {Array.isArray(chapter.content)
                                ? (chapter.content as any[]).join(' ').split(' ').length
                                : typeof chapter.content === 'string'
                                  ? (chapter.content as string).split(' ').length
                                  : 0
                              } كلمة
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditChapter(chapter)}
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteChapter(chapter)}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center dir-ltr">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={() => {
          if (chapterToDelete) {
            deleteMutation.mutate(chapterToDelete.id);
          }
        }}
        title="حذف الفصل"
        description={`هل أنت متأكد من حذف الفصل "${chapterToDelete?.title || `الفصل ${chapterToDelete?.chapter_num}`}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        isLoading={deleteMutation.isPending}
      />

      <AuthorAddChapterModal
        isOpen={isAddChapterOpen}
        onClose={() => setIsAddChapterOpen(false)}
        onSubmit={(chapterData) => {
          createMutation.mutate(chapterData);
        }}
        books={books}
        isLoading={createMutation.isPending}
      />

      {selectedChapter && (
        <AuthorEditChapterModal
          isOpen={isEditChapterOpen}
          onClose={() => {
            setIsEditChapterOpen(false);
            setSelectedChapter(null);
          }}
          onSubmit={(chapterData) => {
            editMutation.mutate({
              chapterId: selectedChapter.id,
              chapterData
            });
          }}
          chapter={selectedChapter}
          books={books}
          isLoading={editMutation.isPending}
        />
      )}
    </div>
  );
}