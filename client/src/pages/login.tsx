import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface LoginProps {
  onLogin: (userData: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // مسح جميع الـ cache عند تسجيل الدخول الناجح
        if (data.clearCache) {
          console.log("Clearing all cache after successful login");
          queryClient.clear();
        }
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${data.user.displayName}`,
        });
        onLogin(data);
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: data.message || "بيانات دخول غير صحيحة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="flex items-center justify-center w-full max-w-2xl relative z-10">
        {/* Login Card */}
        <Card className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          {/* Header gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
          
          <CardHeader className="text-center space-y-3 relative z-10 pt-6 pb-4">
            <div className="mx-auto w-14 h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ilibrary
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                نظام إدارة المكتبة الإلكترونية
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  البريد الإلكتروني
                </Label>
                <div className="relative group">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-10 text-right border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 h-10 rounded-lg transition-all duration-200"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  كلمة المرور
                </Label>
                <div className="relative group">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 text-right border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 h-10 rounded-lg transition-all duration-200"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:transform-none disabled:hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span className="text-sm">جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="text-sm">تسجيل الدخول</span>
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="text-center text-xs text-blue-700 dark:text-blue-300">
                <p className="font-bold mb-1 text-sm">مرحباً بك في نظام إدارة المكتبة الإلكترونية</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم
                </p>
              </div>
            </div>

            {/* Team Credits Section Inside Login Box - Compact Wide Layout */}
            <div className="mt-4 p-3 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">فريق العمل</h3>
              
              {/* Compact Grid Layout */}
              <div className="grid grid-cols-3 gap-2">
                {/* Built by - Abdelrahman Tony */}
                <div className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AT</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-700 dark:text-emerald-300" style={{fontSize: '10px'}}>Abdelrahman Tony</h4>
                      <p className="text-gray-500 dark:text-gray-400" style={{fontSize: '9px'}}>Developer</p>
                    </div>
                  </div>
                </div>

                {/* Managed by - Youssef Amr */}
                <div className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">YA</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-700 dark:text-blue-300" style={{fontSize: '10px'}}>Youssef Amr</h4>
                      <p className="text-gray-500 dark:text-gray-400" style={{fontSize: '9px'}}>Frontend Head</p>
                    </div>
                  </div>
                </div>

                {/* Managed by - Abdelsabour Ashref */}
                <div className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AA</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-700 dark:text-purple-300" style={{fontSize: '10px'}}>Abdelsabour Ashref</h4>
                      <p className="text-gray-500 dark:text-gray-400" style={{fontSize: '9px'}}>Backend Head</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Footer */}
              <div className="text-center pt-2 mt-2 border-t border-gray-200 dark:border-gray-600">
                <p style={{fontSize: '9px'}} className="text-gray-500 dark:text-gray-400">
                  © 2025 iLibrary Team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}