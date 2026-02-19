import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 md:space-y-8" dir="rtl">
      {/* Hero Section - Refined */}
      <div className="relative overflow-hidden rounded-3xl bg-sidebar p-5 md:p-8 shadow-2xl border border-sidebar-border/50">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">مرحباً بك في لوحة التحكم</h1>
            <p className="text-sidebar-foreground/70 text-lg max-w-xl">
              نظرة عامة على أداء المكتبة، الإحصائيات الحالية، والنشاطات الأخيرة.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
              <span className="block text-2xl font-bold text-white">{stats?.totalBooks || 0}</span>
              <span className="text-xs text-sidebar-foreground/60">كتاب</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
              <span className="block text-2xl font-bold text-white">{stats?.totalUsers || 0}</span>
              <span className="text-xs text-sidebar-foreground/60">مستخدم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats - Clean & Professional */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, index) => (
          <Link key={index} href={stat.link}>
            <Card className="group cursor-pointer border border-slate-200 dark:border-sidebar-border bg-white dark:bg-sidebar-accent/10 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-sidebar-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${index === 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    index === 1 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      index === 2 ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="border-border/50 text-muted-foreground font-normal">
                    {stat.trend}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-sidebar-primary transition-colors">{stat.value}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions - List Style */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">الإجراءات السريعة</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="group flex items-center p-4 bg-white dark:bg-sidebar-accent/10 border border-slate-200 dark:border-sidebar-border rounded-xl cursor-pointer hover:border-sidebar-primary/50 transition-all duration-200 hover:shadow-md">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-sidebar-primary group-hover:text-white transition-colors">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="mr-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-sidebar-primary transition-colors">{action.label}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 mr-auto text-slate-300 group-hover:text-sidebar-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status - Minimal */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">حالة النظام</h2>
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-sidebar-accent/10 border border-slate-200 dark:border-sidebar-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">الخادوم</span>
                </div>
                <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">Online</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-sidebar-accent/10 border border-slate-200 dark:border-sidebar-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">قاعدة البيانات</span>
                </div>
                <span className="text-xs font-mono text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">Connected</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                نصيحة اليوم
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                قم بمراجعة تقييمات الكتب بشكل دوري لمعرفة اتجاهات القراء وتحسين المحتوى.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}