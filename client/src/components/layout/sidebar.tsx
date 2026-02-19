import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Book,
  Tags,
  UserCog,
  Heart,
  MessageSquare,
  Library,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "إدارة المستخدمين", href: "/users", icon: Users },
  { name: "إدارة الكتب", href: "/books", icon: Book },
  { name: "إدارة الفصول", href: "/chapters", icon: FileText },
  { name: "التصنيفات", href: "/categories", icon: Tags },
  { name: "المؤلفين", href: "/authors", icon: UserCog },
  { name: "إدارة المفضلة", href: "/favorites", icon: Heart },
  { name: "المراجعات", href: "/reviews", icon: MessageSquare },
];

interface SidebarProps {
  onClose?: () => void;
  user?: any;
  onLogout?: () => void;
}

export default function Sidebar({ onClose, user, onLogout }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col shadow-2xl transition-all duration-300 ease-in-out lg:static fixed inset-y-0 left-0 z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border bg-sidebar-accent/10">
        <div className="flex items-center space-x-reverse space-x-3 text-right">
          <div className="text-right flex-1">
            <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">Muejam Library</h1>
            <p className="text-xs text-sidebar-foreground/60 font-medium mt-1">لوحة التحكم الإدارية</p>
          </div>
          <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-lg shadow-sidebar-primary/20">
            <Library className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                onClick={onClose}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group relative overflow-hidden flex-row-reverse",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/10"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center ml-3 transition-all duration-200",
                  isActive
                    ? "bg-white/20"
                    : "bg-sidebar-accent/50 group-hover:bg-sidebar-accent/80"
                )}>
                  <item.icon className={cn(
                    "w-4 h-4",
                    isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                  )} />
                </div>
                <span className="font-medium flex-1 text-right">{item.name}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      {user && (
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-sidebar-accent/30 border border-sidebar-border/50">
            <div className="text-right flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.displayName}</p>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5 truncate">{user.email}</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 px-2 py-2 rounded-lg transition-colors"
                title="تسجيل خروج"
              >
                <span className="sr-only">تسجيل خروج</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
