"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut,
  Menu,
  Users,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLogout, useProfile } from "@/hooks/use-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { data: user, isLoading, error } = useProfile();

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Don't render admin content for non-admins
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center text-white">
          <p className="text-xl font-bold mb-2">Access Denied</p>
          <p className="text-zinc-400">You do not have permission to access this area.</p>
        </div>
      </div>
    );
  }

  const routes = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/inventory", label: "Inventory Control", icon: Package },
    { href: "/admin/orders", label: "Transactions", icon: ShoppingCart },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-white w-64 border-r border-zinc-800">
       <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
             <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black italic rounded">P</div>
             <span className="font-black italic text-xl tracking-tighter">PULLEX<span className="text-zinc-500 text-sm not-italic ml-1">/ADMIN</span></span>
          </Link>
       </div>
       
       <nav className="flex-1 px-4 space-y-2">
          {routes.map((route) => (
             <Link key={route.href} href={route.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-colors ${
                   pathname === route.href 
                     ? "bg-white text-black" 
                     : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}>
                   <route.icon className="w-4 h-4" />
                   {route.label}
                </div>
             </Link>
          ))}
       </nav>

       <div className="p-6 border-t border-zinc-900">
          <Button 
            variant="outline" 
            className="w-full justify-start text-zinc-400 border-zinc-700 hover:bg-zinc-900 hover:text-white"
            onClick={logout}
          >
             <LogOut className="mr-2 w-4 h-4" />
             Exit Console
          </Button>
       </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
       {/* Desktop Sidebar */}
       <div className="hidden lg:block relative">
          <div className="sticky top-0 h-screen">
             <Sidebar />
          </div>
       </div>

       {/* Mobile Sidebar */}
       <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white p-4 flex items-center justify-between border-b border-zinc-800">
          <span className="font-black">ADMIN CONSOLE</span>
          <Sheet>
             <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                   <Menu className="w-6 h-6" />
                </Button>
             </SheetTrigger>
             <SheetContent side="left" className="p-0 bg-black border-zinc-800 w-64">
                <Sidebar />
             </SheetContent>
          </Sheet>
       </div>

       {/* Main Content */}
       <main className="flex-1 p-6 lg:p-10 mt-14 lg:mt-0">
          {children}
       </main>
    </div>
  );
}
