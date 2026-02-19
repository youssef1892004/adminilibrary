import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Plus, BookOpen, Edit, Trash2, FileText, Users, FolderOpen, Search, List, Grid, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Chapter, Book } from "@shared/schema";
import { AddChapterModal } from "@/components/modals/add-chapter-modal";
import { EditChapterModal } from "@/components/modals/edit-chapter-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { TableColumn } from "@/types";

export function ChaptersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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

  // Filter chapters locally by book if selected
  const safeChapters = Array.isArray(chapters) ? chapters : [];
  const filteredChapters = selectedBookId === "all"
    ? safeChapters
    : safeChapters.filter((chapter: Chapter) => chapter.book_id === selectedBookId);

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

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
    toast({ title: "تم التحديث", description: "تم تحديث قائمة الفصول" });
  };

  const columns: TableColumn<Chapter>[] = [
    {
      key: "chapter_num",
      label: "رقم الفصل",
      render: (value) => (
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold">
          {value}
        </div>
      )
    },
    {
      key: "title",
      label: "عنوان الفصل",
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>
    },
    {
      key: "book_id",
      label: "الكتاب",
      render: (value) => (
        <div className="flex items-center gap-2 text-slate-600">
          <BookOpen className="h-4 w-4" />
          <span>{getBookName(value)}</span>
        </div>
      )
    },
    {
      key: "content",
      label: "المحتوى",
      render: (value) => (
        <span className="text-sm text-slate-500">
          {Array.isArray(value)
            ? `${(value as any[]).length} فقرة`
            : typeof value === 'string'
              ? `${(value as string).length} حرف`
              : '0 حرف'
          }
        </span>
      )
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (_, chapter) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(chapter)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(chapter)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 min-h-screen" dir="rtl">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-4 sm:p-6 lg:p-8 text-white shadow-2xl border border-sidebar-border">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">إدارة الفصول</h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  إدارة شاملة لفصول الكتب ومحتوياتها
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-blue-100 text-sm">
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
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="text-sm sm:text-base">إضافة فصل جديد</span>
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
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي الفصول</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{totalChapters}</div>
            <p className="text-slate-400 text-xs">فصل مسجل</p>
          </CardContent>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">متوسط الفصول</CardTitle>
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              {books.length > 0 ? Math.round(totalChapters / books.length) : 0}
            </div>
            <p className="text-slate-400 text-xs">لكل كتاب</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="بحث في الفصول..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pr-10 h-10 border-slate-200 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="h-10 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[200px]"
            >
              <option value="all">جميع الكتب</option>
              {books.map((book: Book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          {/* View Actions */}
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={chaptersLoading}
              className="h-10"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${chaptersLoading ? 'animate-spin' : ''}`} />
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
        {chaptersLoading ? (
          <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
        ) : filteredChapters.map((chapter: Chapter) => (
          <div key={chapter.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold shadow-sm">
                  {chapter.chapter_num}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{chapter.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{getBookName(chapter.book_id)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button size="sm" variant="ghost" className="flex-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100" onClick={() => handleEdit(chapter)}>
                <Edit className="w-4 h-4 mr-2" /> تعديل
              </Button>
              <Button size="sm" variant="ghost" className="flex-1 text-red-600 bg-red-50 hover:bg-red-100" onClick={() => handleDelete(chapter)}>
                <Trash2 className="w-4 h-4 mr-2" /> حذف
              </Button>
            </div>
          </div>
        ))}
        {!chaptersLoading && filteredChapters.length === 0 && (
          <div className="text-center py-8 text-slate-500">لا توجد نتائج</div>
        )}
      </div>

      {/* Desktop View - Grid vs Table */}
      <div className="hidden md:block pb-20">
        {chaptersLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChapters.map((chapter: Chapter) => (
              <div key={chapter.id} className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-lg shadow-inner">
                    {chapter.chapter_num}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handleEdit(chapter)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(chapter)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 line-clamp-1" title={chapter.title}>{chapter.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{getBookName(chapter.book_id)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 border-t pt-3">
                  <span>
                    {Array.isArray(chapter.content) ? (chapter.content as any[]).length : 0} فقرات
                  </span>
                  <span>ID: {chapter.id.slice(0, 6)}...</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <DataTable
              data={filteredChapters}
              columns={columns}
              loading={chaptersLoading}
              searchPlaceholder="" // Search handled externally
              hideSearch={true}
              pagination={{
                page: page,
                pageSize: limit,
                total: totalChapters,
              }}
              onPageChange={(newPage: number) => setPage(newPage)}
            />
          </div>
        )}
      </div>

      <AddChapterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(chapterData) => {
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