import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  User, 
  FolderOpen,
  FileText,
  Star,
  Heart,
  TrendingUp,
  Plus,
  Activity,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { libraryApi } from "@/lib/api";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard-stats"],
    queryFn: libraryApi.getDashboardStats,
  });

  const primaryStats = [
    {
      label: "إجمالي المستخدمين",
      value: stats?.totalUsers || 0,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      description: "المستخدمين المسجلين",
      link: "/users",
      trend: "+12%"
    },
    {
      label: "إجمالي الكتب",
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      description: "الكتب في المكتبة",
      link: "/books",
      trend: "+8%"
    },
    {
      label: "المؤلفين",
      value: stats?.totalAuthors || 0,
      icon: User,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      description: "مؤلفي الكتب",
      link: "/authors",
      trend: "+5%"
    },
    {
      label: "التصنيفات",
      value: stats?.totalCategories || 0,
      icon: FolderOpen,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
      description: "تصنيفات الكتب",
      link: "/categories",
      trend: "+3%"
    },
  ];

  const secondaryStats = [
    {
      label: "الفصول",
      value: stats?.totalChapters || 0,
      icon: FileText,
      gradient: "from-indigo-500 to-indigo-600",
      description: "فصول الكتب",
      change: "+24"
    },
    {
      label: "التقييمات",
      value: stats?.totalReviews || 0,
      icon: Star,
      gradient: "from-yellow-500 to-yellow-600",
      description: "تقييمات القراء",
      change: "+12"
    },
    {
      label: "المفضلة",
      value: stats?.totalFavorites || 0,
      icon: Heart,
      gradient: "from-rose-500 to-rose-600",
      description: "الكتب المفضلة",
      change: "+8"
    },
    {
      label: "متوسط التقييم",
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0",
      icon: Sparkles,
      gradient: "from-amber-500 to-amber-600",
      description: "من 5 نجوم",
      change: "+0.2"
    },
  ];

  const quickActions = [
    {
      label: "إضافة كتاب جديد",
      icon: BookOpen,
      href: "/books",
      gradient: "from-emerald-500 to-emerald-600",
      description: "أضف كتاب جديد للمكتبة"
    },
    {
      label: "إضافة مؤلف جديد", 
      icon: User,
      href: "/authors",
      gradient: "from-purple-500 to-purple-600",
      description: "سجل مؤلف جديد"
    },
    {
      label: "إضافة تصنيف جديد",
      icon: FolderOpen,
      href: "/categories", 
      gradient: "from-amber-500 to-amber-600",
      description: "أنشئ تصنيف جديد"
    },
    {
      label: "إدارة المستخدمين",
      icon: Users,
      href: "/users",
      gradient: "from-blue-500 to-blue-600",
      description: "راجع وأدر المستخدمين"
    },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-32 border border-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6" dir="rtl">


      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-3xl p-8 mb-8 border border-slate-200/50 shadow-xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-3">مرحباً بك في لوحة التحكم</h1>
          <p className="text-slate-600 text-lg">نظرة شاملة على إحصائيات المكتبة الإلكترونية</p>
        </div>
      </div>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {primaryStats.map((stat, index) => (
          <Link key={index} href={stat.link}>
            <Card className={`card-professional stat-card cursor-pointer rounded-2xl overflow-hidden border-0 animate-slide-in-up animate-delay-${index * 100}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-medium text-emerald-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {secondaryStats.map((stat, index) => (
          <Card key={index} className={`card-professional rounded-xl border-0 animate-slide-in-up animate-delay-${(index + 4) * 100}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.description}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs font-medium text-emerald-600">
                  {stat.change} هذا الشهر
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-3 text-gradient">الإجراءات السريعة</h2>
          <p className="text-slate-600">ابدأ بإضافة محتوى جديد أو إدارة البيانات الموجودة</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className={`card-professional cursor-pointer rounded-2xl border-0 overflow-hidden group animate-slide-in-up animate-delay-${(index + 8) * 100}`}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{action.label}</h3>
                    <p className="text-sm text-slate-600">{action.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <Button className="btn-gradient text-white px-6 py-2 rounded-xl text-sm font-medium">
                      ابدأ الآن
                      <Plus className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Status & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-professional border-0 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              حالة النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">GraphQL API</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">متصل</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">خدمة التطبيق</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">يعمل</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-700">آخر تحديث</span>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">الآن</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional border-0 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              نصائح سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                تحسين الأداء
              </h4>
              <p className="text-sm text-amber-700">استخدم فلاتر التصنيف لتسهيل البحث في الكتب</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                إدارة المحتوى
              </h4>
              <p className="text-sm text-blue-700">أضف وصف مفصل للكتب لتحسين تجربة المستخدمين</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}