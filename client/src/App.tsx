import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import Books from "@/pages/books";
import { ChaptersPage } from "@/pages/chapters";
import Authors from "@/pages/authors";
import Categories from "@/pages/categories";
import FavoritesPage from "@/pages/favorites";
import Login from "@/pages/login";
import AuthorDashboard from "@/pages/author-dashboard";
import AuthorBooks from "@/pages/author-books";
import AuthorChapters from "@/pages/author-chapters";
import AuthorProfile from "@/pages/author-profile";
import AuthorNavbar from "@/components/layout/author-navbar";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { Menu, X } from "lucide-react";

function Router() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = (userData: any) => {
    console.log("Login successful, clearing cache and setting user");
    
    // مسح جميع الـ cache عند تسجيل الدخول الناجح
    if (userData.clearCache) {
      queryClient.clear();
      console.log("All cache cleared after login");
    }
    
    setUser(userData.user);
    
    // التحقق من صلاحيات المستخدم
    const userRoles = userData.user.roles || [];
    const hasMe = userRoles.includes('me');
    const hasAdmin = userRoles.includes('admin');
    const hasAuthor = userRoles.includes('author');
    const hasUser = userRoles.includes('user');
    const hasAnonymous = userRoles.includes('anonymous');
    
    // منع دخول المستخدمين العاديين والمجهولين
    if ((hasUser && !hasMe && !hasAdmin && !hasAuthor) || hasAnonymous) {
      // سيتم عرض صفحة منع الدخول
      return;
    }
    
    // التوجيه حسب نوع الداشبورد
    if (hasAuthor && !hasMe && !hasAdmin) {
      window.location.hash = '/author-dashboard';
    } else if (hasMe || hasAdmin) {
      window.location.hash = '/';
    }
  };

  const handleLogout = () => {
    console.log("Logout - clearing all cache");
    // مسح جميع الـ cache عند تسجيل الخروج
    queryClient.clear();
    setUser(null);
    window.location.hash = '/login';
  };

  // إذا لم يكن المستخدم مسجل الدخول، عرض صفحة تسجيل الدخول
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // تحديد نوع الداشبورد بناءً على دور المستخدم
  const userRoles = user.roles || [];
  const hasMe = userRoles.includes('me');
  const hasAdmin = userRoles.includes('admin');
  const hasAuthor = userRoles.includes('author');
  const hasUser = userRoles.includes('user');
  const hasAnonymous = userRoles.includes('anonymous');
  
  // منع دخول المستخدمين العاديين والمجهولين
  if ((hasUser && !hasMe && !hasAdmin && !hasAuthor) || hasAnonymous) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">غير مصرح لك بالدخول</h2>
          <p className="text-gray-600 mb-6">ليس لديك صلاحيات للوصول إلى هذا النظام</p>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            تسجيل خروج
          </button>
        </div>
      </div>
    );
  }
  
  // إذا كان له دور "author" فقط (بدون "me" أو "admin") يدخل لداشبورد المؤلف
  const isAuthor = hasAuthor && !hasMe && !hasAdmin;

  // إذا كان المستخدم مؤلف فقط، عرض داشبورد المؤلف
  if (isAuthor) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="author-layout bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex flex-col">
            <AuthorNavbar onLogout={handleLogout} />
            <div className="author-content">
              <Switch>
                <Route path="/" component={() => <AuthorDashboard />} />
                <Route path="/author-dashboard" component={() => <AuthorDashboard />} />
                <Route path="/author-books" component={() => <AuthorBooks />} />
                <Route path="/author-chapters" component={() => <AuthorChapters />} />
                <Route path="/author-profile" component={() => <AuthorProfile />} />
                <Route component={() => <AuthorDashboard />} />
              </Switch>
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // الداشبورد العادي للمدراء والمستخدمين العاديين
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
            <h1 className="text-xl font-bold text-gradient">Ilibrary</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user?.displayName}</span>
              <Button 
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                خروج
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/users" component={Users} />
            <Route path="/books" component={Books} />
            <Route path="/chapters" component={ChaptersPage} />
            <Route path="/categories" component={Categories} />
            <Route path="/authors" component={Authors} />
            <Route path="/favorites" component={FavoritesPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw]">
            <Sidebar user={user} onLogout={handleLogout} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
