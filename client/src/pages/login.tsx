import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
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
        if (data.clearCache) {
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
    <div className="min-h-screen w-full flex overflow-hidden bg-slate-50">
      {/* Right Side - Visual Branding (Now on Right for RTL) */}
      <div className="hidden lg:flex w-1/2 relative bg-sidebar overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90"></div>

        {/* Abstract decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sidebar-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sidebar-accent/30 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-lg shadow-sidebar-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Muejam Library</h1>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl font-bold leading-tight">
            نظام إدارة المكتبة <br /> <span className="text-sidebar-primary">الإلكترونية المتكامل</span>
          </h2>
          <p className="text-lg text-sidebar-foreground/80 leading-relaxed">
            منصة قوية وموثوقة لإدارة الموارد المعرفية بكفاءة عالية. تحكم كامل في الكتب، المؤلفين، والمستخدمين في مكان واحد.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-sidebar-foreground/60">
          <p>جميع الحقوق محفوظة لـ Muejam Library</p>
        </div>
      </div>

      {/* Left Side - Login Form (Now on Left for RTL) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2 lg:text-right">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">تسجيل الدخول</h2>
            <p className="text-slate-500 dark:text-slate-400">
              أدخل بيانات حسابك للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8" dir="rtl">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</Label>
                <div className="relative group">
                  <Mail className="absolute right-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-sidebar-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-10 h-11 bg-slate-50 border-slate-200 focus:border-sidebar-primary focus:ring-sidebar-primary/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
                  <a href="https://chat.whatsapp.com/IDeGfAxR9iiBdMTV0lrp0k" className="text-xs font-medium text-sidebar-primary hover:text-sidebar-primary/80 transition-colors">
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-sidebar-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 h-11 bg-slate-50 border-slate-200 focus:border-sidebar-primary focus:ring-sidebar-primary/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-sidebar hover:bg-sidebar/90 text-white font-medium text-base shadow-lg shadow-sidebar/10 transition-all duration-200 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4 ml-1" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-slate-500">
              لديك مشكلة في الدخول؟ <a href="https://chat.whatsapp.com/IDeGfAxR9iiBdMTV0lrp0k" className="font-medium text-sidebar-primary hover:underline">تواصل مع الدعم الفني</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}