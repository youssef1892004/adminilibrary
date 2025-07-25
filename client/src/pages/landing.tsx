import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Star, TrendingUp, LogIn } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-blue-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ilibrary
            </h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <LogIn className="ml-2 h-4 w-4" />
            تسجيل الدخول
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-800 dark:text-white mb-6">
            مرحباً بك في 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Ilibrary</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            نظام إدارة المكتبة الرقمية الشامل - إدارة الكتب والمؤلفين والفئات والمستخدمين بكل سهولة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              <LogIn className="ml-2 h-5 w-5" />
              البدء الآن
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            المميزات الرئيسية
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-gray-800 dark:text-white">إدارة الكتب</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  إضافة وتعديل وحذف الكتب مع إمكانية إدارة الفصول والمحتوى
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-gray-800 dark:text-white">إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  تسجيل وإدارة المستخدمين مع نظام الأدوار والصلاحيات
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <Star className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-gray-800 dark:text-white">التقييمات والمراجعات</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  نظام تقييم شامل مع إمكانية كتابة المراجعات المفصلة
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-gray-800 dark:text-white">الإحصائيات المتقدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  تقارير مفصلة وإحصائيات شاملة لجميع أنشطة المكتبة
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                ابدأ رحلتك معنا اليوم
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                انضم إلى نظام Ilibrary واستمتع بإدارة مكتبتك الرقمية بكل احترافية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
              >
                <LogIn className="ml-2 h-5 w-5" />
                تسجيل الدخول الآن
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">Ilibrary</span>
          </div>
          <p className="text-gray-400">
            © 2025 Ilibrary. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}