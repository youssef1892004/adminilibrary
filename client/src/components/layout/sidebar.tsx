import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Book,
  Tags,
  UserCog,
  ArrowLeftRight,
  Settings,
  BookOpen,
  Sparkles,
  Library,
  FileText,
  Heart,
  MessageSquare
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
    <aside className="w-72 h-full glass-effect border-l border-slate-200/30 flex flex-col shadow-2xl lg:w-72 max-w-full">
      {/* Logo Section - Enhanced Design */}
      <div className="p-6 border-b border-slate-200/20">
        <div className="flex items-center space-x-reverse space-x-3 text-right">
          <div className="text-right flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ilibrary</h1>
            <p className="text-xs text-slate-500 font-normal mt-1">نظام إدارة متطور</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent"></div>
            <Library className="w-6 h-6 text-white relative z-10" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-5 py-5 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navigation.map((item, index) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                onClick={onClose}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group relative overflow-hidden flex-row-reverse",
                  isActive
                    ? "text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white/60 hover:shadow-sm"
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
                )}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center ml-3 transition-all duration-200 relative z-10",
                  isActive
                    ? "bg-white/20"
                    : "bg-slate-100/80 group-hover:bg-slate-200"
                )}>
                  <item.icon className={cn(
                    "w-4 h-4 transition-all duration-200",
                    isActive ? "text-white" : "text-slate-600 group-hover:text-slate-800"
                  )} />
                </div>
                <span className="font-medium relative z-10 flex-1 text-right">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout - Enhanced Professional Design */}
      {user && (
        <div className="px-6 py-5 border-t border-slate-200/30 bg-gradient-to-b from-transparent to-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="text-right flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ml-2 flex-shrink-0"
              >
                خروج
              </button>
            )}
          </div>
        </div>
      )}


    </aside>
  );
}
