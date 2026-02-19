import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, PlusCircle, Edit, Trash2, ArrowRight, BookOpen, Search } from "lucide-react";
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
    console.log("AuthorChapters mounted - clearing cache for fresh data");
    queryClient.removeQueries({ queryKey: ["/api/auth/author-profile"] });
    queryClient.removeQueries({ queryKey: ["/api/books"] });
    queryClient.removeQueries({ queryKey: ["/api/chapters"] });
    queryClient.removeQueries({ queryKey: ["/api/session"] });
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
    queryKey: ["/api/books"],
    queryFn: () => libraryApi.getBooks(),
  });

  // Fetch chapters with pagination
  const { data, isLoading } = useQuery<{ chapters: any[], total: number }>({
    queryKey: ["/api/chapters", page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm
      });
      const res = await fetch(`/api/chapters?${params}`);
      if (!res.ok) throw new Error('Failed to fetch chapters');
      return res.json();
    }
  });

  const chapters = data?.chapters || [];
  const totalChapters = data?.total || 0;
  const totalPages = Math.ceil(totalChapters / limit);
  const filteredChapters = chapters; // Server already filtered

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

        {/* Main Dashboard Box - Enhanced */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          <CardContent className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">إدارة الفصول</h2>
                    <p className="text-emerald-100 text-lg">جميع فصولك</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{totalChapters}</div>
                    <div className="text-emerald-100 text-sm">إجمالي الفصول</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{filteredChapters.length}</div>
                    <div className="text-emerald-100 text-sm">الفصول المعروضة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{books.length}</div>
                    <div className="text-emerald-100 text-sm">عدد الكتب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">الكل</div>
                    <div className="text-emerald-100 text-sm">الكتاب المحدد</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button
                  onClick={() => setIsAddChapterOpen(true)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl rounded-xl px-6 py-3 font-medium transition-all duration-200"
                >
                  <PlusCircle className="ml-2 h-5 w-5" />
                  إضافة فصل جديد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Box */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50">
          <CardContent className="p-6">
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset page on search
                  }}
                  className="pr-10 bg-white border-emerald-200 shadow-sm hover:shadow-md transition-shadow focus:border-emerald-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {filteredChapters.length > 0
                ? `${filteredChapters.length} فصل`
                : 'لا توجد فصول'
              }
            </h3>
            <div className="text-sm text-gray-500">
              {searchTerm && `نتائج البحث: "${searchTerm}"`}
            </div>
          </div>

          {filteredChapters.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">لا توجد فصول</h3>
                <p className="text-gray-400 mb-6"> {searchTerm ? "عذرا، لم يتم العثور على نتائج" : "ابدأ بإضافة فصل جديد"}</p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddChapterOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                    <Card key={chapter.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                الفصل {chapter.chapter_num || 'غير محدد'}
                              </Badge>
                              {book && (
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
                                  ? 'محتوى متعدد الفقرات'
                                  : typeof chapter.content === 'string'
                                    ? chapter.content.substring(0, 150) + '...'
                                    : 'لا يوجد محتوى'
                                }
                              </p>
                              <span className="text-gray-600 text-sm">الكلمات: {
                                Array.isArray(chapter.content)
                                  ? (chapter.content as any[]).join(' ').split(' ').length
                                  : typeof chapter.content === 'string'
                                    ? (chapter.content as string).split(' ').length
                                    : 0
                              }</span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>تاريخ الإنشاء: {new Date(chapter.Create_at).toLocaleDateString('ar-EG')}</span>
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