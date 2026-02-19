import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, PlusCircle, Edit, Trash2, Eye, LayoutDashboard, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { libraryApi } from "@/lib/api";
import ConfirmModal from "@/components/modals/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AuthorDashboard() {
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

  // Calculate statistics
  const totalBooks = books.length;
  // Calculate total chapters from the books data
  const totalChapters = books.reduce((acc: number, book: any) => acc + (book.chapter_num || 0), 0);
  const averageChaptersPerBook = totalBooks > 0 ? Math.round(totalChapters / totalBooks) : 0;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] text-white shadow-2xl shadow-blue-900/10">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                  <LayoutDashboard className="h-4 w-4 text-blue-300" />
                  <span className="text-sm font-medium text-blue-100">لوحة تحكم الكاتب</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                    أهلاً بك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">مكتبتك الرقمية</span>
                  </h1>
                  <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                    المكان الأمثل لإدارة إبداعاتك. تتبع إحصائيات كتبك، أضف فصولاً جديدة، وتفاعل مع قرائك بكل سهولة.
                  </p>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 min-w-[300px]">
                <Link href="/author-books" className="flex-1">
                  <Button className="w-full bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-700 font-bold h-14 rounded-2xl shadow-lg shadow-white/5 transition-all duration-300 border border-transparent hover:border-blue-100 flex items-center justify-center gap-3 group">
                    <div className="bg-blue-100 p-1.5 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>إدارة الكتب</span>
                    <ArrowRight className="h-4 w-4 mr-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </Button>
                </Link>

                <Link href="/author-chapters" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 h-14 rounded-2xl backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-3">
                    <FileText className="h-5 w-5" />
                    <span>الفصول</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50/80 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
                  كتب منشورة
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-900">{totalBooks}</h3>
                <p className="text-sm font-medium text-slate-500">إجمالي الكتب في مكتبتك</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50/80 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0">
                  فصول
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-900">{totalChapters}</h3>
                <p className="text-sm font-medium text-slate-500">
                  بمعدل {averageChaptersPerBook} فصل لكل كتاب
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50/80 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-0">
                  قريباً
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-900">--</h3>
                <p className="text-sm font-medium text-slate-500">إحصائيات القراء والمشاهدات</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Books Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-400" />
                آخر التحديثات
              </h2>
              <Link href="/author-books">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  عرض الجميع
                </Button>
              </Link>
            </div>

            {books.length > 0 ? (
              <div className="grid gap-4">
                {books.slice(0, 3).map((book: any) => (
                  <div key={book.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5">
                    <div className="h-20 w-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 relative shadow-sm">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg mb-1 truncate group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          <FileText className="h-3.5 w-3.5" />
                          {book.chapter_num || 0} فصول
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          {book.status === 'published' ? 'منشور' : 'مسودة'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/author-chapters?bookId=${book.id}`}>
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                          <Edit className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد كتب بعد</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">ابدأ رحلتك الكتابية اليوم وأضف كتابك الأول إلى المكتبة</p>
                <Link href="/author-books">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة كتاب جديد
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-400" />
              أحدث النشاطات
            </h2>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-16 translate-x-8"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl mb-4 text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">سجل النشاطات</h3>
                <p className="text-blue-100 leading-relaxed mb-6">
                  قريباً ستتمكن من تتبع جميع نشاطاتك، تعليقات القراء، وتقييمات كتبك من هنا مباشرة.
                </p>
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white w-full rounded-xl">
                  استكشف المزيد
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}