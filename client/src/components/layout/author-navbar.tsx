import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, LogOut, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AuthorNavbarProps {
  onLogout: () => void;
}

export default function AuthorNavbar({ onLogout }: AuthorNavbarProps) {
  const [location] = useLocation();

  // Fetch author profile data
  const { data: authorProfile } = useQuery({
    queryKey: ["/api/auth/author-profile"],
    queryFn: async () => {
      const response = await fetch("/api/auth/author-profile", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch author profile");
      return response.json();
    },
  });

  const navItems = [
    {
      title: "لوحة التحكم",
      href: "/author-dashboard",
      icon: BookOpen,
    },
    {
      title: "إدارة الكتب",
      href: "/author-books", 
      icon: BookOpen,
    },
    {
      title: "إدارة الفصول",
      href: "/author-chapters", 
      icon: FileText,
    },
    {
      title: "الملف الشخصي",
      href: "/author-profile",
      icon: User,
    },
  ];

  return (
    <nav className="bg-gradient-to-l from-indigo-600 via-purple-600 to-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Author Info */}
          <div className="flex items-center space-x-reverse space-x-6">
            <Link href="/author-dashboard">
              <h1 className="text-2xl font-bold text-white hover:text-purple-100 transition-colors">
                Ilibrary
              </h1>
            </Link>
            <div className="hidden md:flex items-center space-x-reverse space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-white">
                <div className="text-sm font-medium">
                  {authorProfile?.name || "المؤلف"}
                </div>
                <div className="text-xs text-purple-100">
                  لوحة تحكم المؤلف
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-reverse space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center space-x-reverse space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-purple-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-purple-100 hover:text-white hover:bg-red-500/20 border border-purple-300/30 hover:border-red-300/50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل خروج
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center space-x-reverse space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-md' 
                      : 'text-purple-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}