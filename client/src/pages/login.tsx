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
      
      <div className="flex flex-col lg:flex-row w-full max-w-4xl relative z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center space-y-3 mb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  تسجيل الدخول
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm">
                  أدخل بياناتك للوصول إلى حسابك
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
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
                    className="pr-10 text-right border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 h-10 rounded-lg transition-all duration-200 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
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
                    className="pr-10 text-right border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 h-10 rounded-lg transition-all duration-200 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:transform-none disabled:hover:shadow-lg text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>تسجيل الدخول</span>
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side - Welcome Message and Team Credits */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 lg:p-6 flex flex-col justify-center text-white">
          <div className="max-w-sm mx-auto w-full text-center space-y-4 lg:space-y-6">
            {/* Welcome Section */}
            <div className="space-y-2 lg:space-y-3">
              <div className="mx-auto w-14 h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BookOpen className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl lg:text-3xl font-bold">Ilibrary</h2>
                <p className="text-blue-100 text-sm lg:text-base">نظام إدارة المكتبة الإلكترونية</p>
                <p className="text-blue-200 text-xs lg:text-sm leading-relaxed">
                  أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم
                </p>
              </div>
            </div>

            {/* Team Credits Section */}
            <div className="space-y-3 lg:space-y-4">
              <div className="w-full h-px bg-white/20"></div>
              
              <div className="space-y-3">
                <h3 className="text-lg lg:text-xl font-bold text-center">فريق العمل</h3>
                
                {/* Built by Section */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-blue-200">Built by</p>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AT</span>
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-white text-sm">Abdelrahman Tony</h4>
                        <p className="text-blue-200 text-xs">Developer</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-200">CIAO Of solidpoint.ai</p>
                    <p className="text-xs text-blue-200">Head of DevOps and Operations at ilibrary.site</p>
                  </div>
                </div>

                {/* Managed by Section */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-blue-200">Managed by</p>
                  
                  <div className="space-y-2">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">YA</span>
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-white text-sm">Youssef Amr</h4>
                          <p className="text-blue-200 text-xs">Head of Frontend at ilibrary.site</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AA</span>
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-white text-sm">Abdelsabour Ashref</h4>
                          <p className="text-blue-200 text-xs">Head of Backend at ilibrary.site</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-white/20">
                  <p className="text-xs text-blue-200">
                    © 2025 iLibrary Team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}