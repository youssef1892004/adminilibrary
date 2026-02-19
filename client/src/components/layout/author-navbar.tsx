import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, LogOut, User, Menu, X } from "lucide-react"; // Import Menu and X
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface AuthorNavbarProps {
  onLogout: () => void;
}

export default function AuthorNavbar({ onLogout }: AuthorNavbarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

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
    <nav className="bg-sidebar border-b border-sidebar-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Author Info */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/author-dashboard" className="flex items-center gap-2">
              <div className="bg-sidebar-primary/10 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-sidebar-primary" />
              </div>
              <h1 className="text-xl font-bold text-sidebar-foreground hidden sm:block">
                Muejam Library
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== '/author-dashboard' && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-right">
              <div className="leading-tight">
                <div className="text-sm font-medium text-sidebar-foreground">
                  {authorProfile?.name || "المؤلف"}
                </div>
                <div className="text-xs text-sidebar-foreground/60">
                  لوحة تحكم المؤلف
                </div>
              </div>
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center border border-sidebar-border">
                {authorProfile?.image_url ? (
                  <img src={authorProfile.image_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-sidebar-foreground/70" />
                )}
              </div>
            </div>

            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground/70 hover:text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline-block mr-2">خروج</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-sidebar-border bg-sidebar px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== '/author-dashboard' && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}