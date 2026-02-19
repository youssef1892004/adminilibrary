import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Plus, BookOpen, Edit, Trash2, FileText, Users, FolderOpen, FileCheck, Search, List, Grid } from "lucide-react";
import type { Chapter, Book } from "@shared/schema";
import { AddChapterModal } from "@/components/modals/add-chapter-modal";
import { EditChapterModal } from "@/components/modals/edit-chapter-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function ChaptersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>("all");

  // Pagination & Search states
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch chapters with pagination
  const { data, isLoading: chaptersLoading } = useQuery<{ chapters: Chapter[], total: number }>({
    queryKey: ["/api/chapters", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search
      });
      const res = await fetch(`/api/chapters?${params}`);
      if (!res.ok) throw new Error('Failed to fetch chapters');
      return res.json();
    }
  });

  const chapters = data?.chapters || [];
  const totalChapters = data?.total || 0;
  const totalPages = Math.ceil(totalChapters / limit);

  // Fetch books for filtering
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  // Filter chapters locally by book if selected (server-side filtering by book not yet implemented in UI flow for global admin)
  const filteredChapters = selectedBookId === "all"
    ? chapters
    : chapters.filter((chapter: Chapter) => chapter.book_id === selectedBookId);

  // Get book name helper
  const getBookName = (bookId: string) => {
    const book = books.find((b: Book) => b.id === bookId);
    return book?.title || "غير محدد";
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/chapters/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      toast({
        title: "تم حذف الفصل بنجاح",
        description: "تم حذف الفصل من قاعدة البيانات",
      });
      setIsDeleteModalOpen(false);
      setSelectedChapter(null);
    },
    onError: () => {
      toast({
        title: "خطأ في حذف الفصل",
        description: "حدث خطأ أثناء حذف الفصل",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsEditModalOpen(true);
  };

  const handleDelete = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedChapter) {
      deleteMutation.mutate(selectedChapter.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 min-h-screen" dir="rtl">
      {/* Enhanced Header Section - Responsive */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">إدارة الفصول</h1>
                <p className="text-emerald-100 text-sm sm:text-base lg:text-lg">
                  إدارة شاملة لفصول الكتب ومحتوياتها
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-emerald-100 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{totalChapters} فصل</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{books.length} كتاب</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="text-sm sm:text-base">إضافة فصل جديد</span>
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-cyan-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Book Filter Card & Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl lg:rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">تصفية حسب الكتاب</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900 font-medium shadow-sm"
            >
              <option value="all">جميع الكتب</option>
              {books.map((book: Book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl lg:rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">بحث في الفصول</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Input
              placeholder="ابحث عن عنوان الفصل..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 font-medium shadow-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Data Table - Responsive */}
      <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl lg:rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">قائمة الفصول</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  عرض {filteredChapters.length} من أصل {totalChapters} نتائج
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="overflow-x-auto">
              {chaptersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  <span className="mr-3 text-slate-600">جاري تحميل الفصول...</span>
                </div>
              ) : !filteredChapters || filteredChapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium mb-2">لا توجد فصول</h3>
                  <p className="text-sm text-center">
                    {search ? "لا توجد نتائج تطابق بحثك" : "لم يتم العثور على أي فصول"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChapters.map((chapter: Chapter) => (
                    <div
                      key={chapter.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <span className="text-emerald-600 font-bold text-sm">
                                {chapter.chapter_num}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 truncate">
                              {chapter.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{getBookName(chapter.book_id)}</span>
                              </div>
                            </div>
                            {!!chapter.content && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>
                                  {Array.isArray(chapter.content)
                                    ? `${(chapter.content as any[]).length} فقرة`
                                    : typeof chapter.content === 'string'
                                      ? `${(chapter.content as string).length} حرف`
                                      : '0 حرف'
                                  }
                                </span>
                              </div>
                            )}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(chapter)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="تعديل الفصل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(chapter)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف الفصل"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
        </CardContent>
      </Card>

      <AddChapterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(chapterData) => {
          // Create chapter using API
          apiRequest("/api/chapters", "POST", chapterData)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
              toast({
                title: "تم إضافة الفصل",
                description: "تم إضافة الفصل بنجاح",
              });
              setIsAddModalOpen(false);
            })
            .catch((error) => {
              toast({
                title: "خطأ في إضافة الفصل",
                description: error.message || "حدث خطأ أثناء إضافة الفصل",
                variant: "destructive",
              });
            });
        }}
        books={books}
        isLoading={false}
      />

      {selectedChapter && (
        <EditChapterModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(chapterData) => {
            // Update chapter using API
            apiRequest(`/api/chapters/${selectedChapter.id}`, "PUT", chapterData)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
                toast({
                  title: "تم تحديث الفصل",
                  description: "تم تحديث الفصل بنجاح",
                });
                setIsEditModalOpen(false);
                setSelectedChapter(null);
              })
              .catch((error) => {
                toast({
                  title: "خطأ في تحديث الفصل",
                  description: error.message || "حدث خطأ أثناء تحديث الفصل",
                  variant: "destructive",
                });
              });
          }}
          chapter={selectedChapter}
          books={books}
          isLoading={false}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="حذف الفصل"
        description={`هل أنت متأكد من حذف الفصل "${selectedChapter?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}