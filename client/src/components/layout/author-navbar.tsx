import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, LogOut, User } from "lucide-react";

interface AuthorNavbarProps {
  onLogout: () => void;
}

export default function AuthorNavbar({ onLogout }: AuthorNavbarProps) {
  const [location] = useLocation();

  const navItems = [
    {
      title: "لوحة التحكم",
      href: "/author-dashboard",
      icon: BookOpen,
    },
    {
      title: "إدارة الفصول",
      href: "/author-chapters", 
      icon: FileText,
    },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/author-dashboard">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Ilibrary
              </h1>
            </Link>
            <span className="mr-3 text-sm text-gray-500 bg-purple-100 px-2 py-1 rounded-full">
              مؤلف
            </span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-purple-100 text-purple-700 shadow-sm"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <Icon className="ml-2 h-4 w-4" />
                    {item.title}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>مؤلف</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="ml-1 h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-4 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-purple-100 text-purple-700 shadow-sm"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <Icon className="ml-2 h-4 w-4" />
                    {item.title}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}