import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, MessageSquare, BookOpen, RotateCcw, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function ReviewsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const { toast } = useToast();

    const { data: reviews = [], isLoading, refetch } = useQuery<any[]>({
        queryKey: ["/api/reviews"],
    });

    const filteredReviews = reviews.filter((review: any) =>
        review.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRefresh = async () => {
        await refetch();
        toast({ title: "تم التحديث", description: "تم تحديث قائمة المراجعات" });
    };

    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-slate-200"}`}
            />
        ));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 min-h-screen" dir="rtl">
            {/* Enhanced Header Section - Unified Theme */}
            <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-4 sm:p-6 lg:p-8 text-white shadow-2xl border border-sidebar-border">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
                    <div className="space-y-3 w-full lg:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="p-2 lg:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <MessageSquare className="h-6 w-6 lg:h-8 lg:w-8 text-white fill-current" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">إدارة المراجعات</h1>
                                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                                    عرض تقييمات الكتب وإجابات المستخدمين
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center bg-white/10 rounded-xl p-1 backdrop-blur-sm self-end lg:self-center">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className="text-white hover:bg-white/20"
                        >
                            <Grid className="h-4 w-4" />
                            <span className="ml-1 sm:hidden">شبكة</span>
                        </Button>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-yellow-300/20 rounded-full blur-2xl"></div>
            </div>

            {/* Compact Statistics Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
                        <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي المراجعات</CardTitle>
                        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{reviews.length}</div>
                        <p className="text-slate-400 text-xs">مراجعة</p>
                    </CardContent>
                </Card>

                <Card className="group hover:scale-[1.02] transition-all duration-200 border-0 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg lg:rounded-xl overflow-hidden border-t-4 border-t-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative p-2 sm:p-3 lg:p-4">
                        <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">متوسط التقييم</CardTitle>
                        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 p-2 sm:p-3 lg:p-4 pt-0">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                            {reviews.length > 0
                                ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
                                : "0.0"}
                        </div>
                        <p className="text-slate-400 text-xs">نجمة</p>
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
                                placeholder="البحث عن مراجعة (اسم الكتاب أو المستخدم)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 h-10 border-slate-200 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="h-10"
                        >
                            <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            تحديث
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reviews Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredReviews.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                    <CardContent className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراجعات</h3>
                        <p className="text-gray-600">
                            {searchTerm ? "لم يتم العثور على نتائج للبحث الحالي" : "لا توجد مراجعات حتى الآن"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredReviews.map((review: any) => (
                        <Card key={review.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                            <CardContent className="p-0">
                                <div className="flex h-28 relative bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    {/* Book Info */}
                                    <div className="w-20 h-28 flex-shrink-0 relative">
                                        <img
                                            src={review.book?.cover_URL || "/placeholder-book.jpg"}
                                            alt={review.book?.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-center">
                                        <h3 className="font-bold text-base leading-tight mb-1 text-slate-900 dark:text-white line-clamp-2">
                                            {review.book?.title || "عنوان غير محدد"}
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-2">
                                            {review.book?.author_name || "مؤلف غير محدد"}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* User info */}
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                            <AvatarImage src={review.user?.avatarUrl} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                {review.user?.displayName?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {review.user?.displayName || "مستخدم غير محدد"}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {review.user?.email || "بريد غير محدد"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Q&A Section */}
                                    <div className="space-y-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-sm">
                                        {review.q1_answer && (
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-1">السؤال الأول:</p>
                                                <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 shadow-sm">{review.q1_answer}</p>
                                            </div>
                                        )}
                                        {review.q2_answer && (
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-1">السؤال الثاني:</p>
                                                <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 shadow-sm">{review.q2_answer}</p>
                                            </div>
                                        )}
                                        {review.q3_answer && (
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-1">السؤال الثالث:</p>
                                                <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 shadow-sm">{review.q3_answer}</p>
                                            </div>
                                        )}

                                        {!review.q1_answer && !review.q2_answer && !review.q3_answer && (
                                            <p className="text-slate-400 text-center italic py-2">لا توجد إجابات نصية</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
