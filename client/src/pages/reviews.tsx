import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, MessageSquare, BookOpen, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReviewsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: reviews = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/reviews"],
    });

    const filteredReviews = reviews.filter((review: any) =>
        review.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
        ));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">جارٍ تحميل المراجعات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">إدارة المراجعات</h1>
                    <p className="text-gray-600 mt-1">عرض تقييمات الكتب وإجابات المستخدمين</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                        <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                        {reviews.length} مراجعة
                    </Badge>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="البحث عن مراجعة (اسم الكتاب أو المستخدم)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Grid */}
            {filteredReviews.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراجعات</h3>
                        <p className="text-gray-600">
                            {searchTerm ? "لم يتم العثور على نتائج للبحث الحالي" : "لا توجد مراجعات حتى الآن"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredReviews.map((review: any) => (
                        <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-t-4 border-t-yellow-400">
                            <CardContent className="p-0">
                                <div className="flex h-28 relative bg-gray-50 border-b">
                                    {/* Book Info */}
                                    <div className="w-20 h-28 flex-shrink-0 relative">
                                        <img
                                            src={review.book?.cover_URL || "/placeholder-book.jpg"}
                                            alt={review.book?.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-center">
                                        <h3 className="font-bold text-base leading-tight mb-1 text-gray-900 line-clamp-2">
                                            {review.book?.title || "عنوان غير محدد"}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-2">
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
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarImage src={review.user?.avatarUrl} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                {review.user?.displayName?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {review.user?.displayName || "مستخدم غير محدد"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {review.user?.email || "بريد غير محدد"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Q&A Section */}
                                    <div className="space-y-3 bg-gray-50 rounded-lg p-3 text-sm">
                                        {review.q1_answer && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">السؤال الأول:</p>
                                                <p className="text-gray-800 bg-white p-2 rounded border border-gray-100 shadow-sm">{review.q1_answer}</p>
                                            </div>
                                        )}
                                        {review.q2_answer && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">السؤال الثاني:</p>
                                                <p className="text-gray-800 bg-white p-2 rounded border border-gray-100 shadow-sm">{review.q2_answer}</p>
                                            </div>
                                        )}
                                        {review.q3_answer && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">السؤال الثالث:</p>
                                                <p className="text-gray-800 bg-white p-2 rounded border border-gray-100 shadow-sm">{review.q3_answer}</p>
                                            </div>
                                        )}

                                        {!review.q1_answer && !review.q2_answer && !review.q3_answer && (
                                            <p className="text-gray-500 text-center italic py-2">لا توجد إجابات نصية</p>
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
