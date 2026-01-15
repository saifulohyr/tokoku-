"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Menu, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/hooks/use-cart";
import { useProfile, useLogout } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/products?category=shoes", label: "SEPATU" },
  { href: "/products?category=men", label: "PRIA" },
  { href: "/products?category=women", label: "WANITA" },
  { href: "/products?category=kids", label: "ANAK" },
  { href: "/products?sort=newest", label: "NEW ARRIVAL" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: user } = useProfile();
  const logout = useLogout();
  const totalItems = useCart((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-[11px] font-bold tracking-widest py-2.5 text-center px-4 cursor-pointer hover:bg-zinc-900 transition-colors">
        JOIN THE CLUB. GET REWARDED.
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 w-full bg-background border-b border-zinc-200">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-6 lg:px-10">
          
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0 mr-8">
            <div className="flex items-end gap-1 group">
               {/* Minimalist Logo Icon */}
              <div className="flex flex-col gap-[2px]">
                 <div className="w-6 h-1 bg-black dark:bg-white -rotate-12 group-hover:-rotate-6 transition-transform origin-bottom-left"></div>
                 <div className="w-4 h-1 bg-black dark:bg-white -rotate-12 group-hover:-rotate-6 transition-transform origin-bottom-left"></div>
                 <div className="w-2 h-1 bg-black dark:bg-white -rotate-12 group-hover:-rotate-6 transition-transform origin-bottom-left"></div>
              </div>
              <span className="text-xl font-black tracking-tighter uppercase ml-1">PULLEX</span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 justify-center flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-bold tracking-widest uppercase transition-colors hover:underline hover:underline-offset-4 decoration-2 ${
                  pathname === link.href ? "text-primary" : "text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
            
            {/* Search Bar - Animated */}
            <div className="hidden md:flex items-center relative mr-2">
               <motion.div
                 initial={false}
                 animate={{ width: isSearchOpen ? 240 : 180 }}
                 className="relative"
               >
                  <Input 
                    placeholder="Cari..." 
                    className={cn(
                      "h-9 bg-zinc-100 dark:bg-zinc-800 border-none transition-all placeholder:text-zinc-500 text-xs px-3 pl-9 font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none rounded-full"
                    )}
                    onFocus={() => setIsSearchOpen(true)}
                    onBlur={() => setIsSearchOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const target = e.target as HTMLInputElement;
                        window.location.href = `/products?search=${target.value}`;
                      }
                    }}
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
               </motion.div>
            </div>

            <ThemeToggle />

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-none border-zinc-200">
                  <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 mb-1">
                    <p className="text-sm font-bold uppercase tracking-wider">{user.fullName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer py-3 font-bold uppercase text-xs tracking-wider">
                      <Package className="mr-3 h-4 w-4" />
                      Pesanan Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer py-3 text-red-600 font-bold uppercase text-xs tracking-wider">
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <Link href="/auth/login">
                   <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent">
                    <User className="h-5 w-5" />
                   </Button>
                </Link>
            )}



            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 hover:bg-transparent">
                <ShoppingBag className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <Badge
                    className="absolute top-1 right-0 h-4 w-4 flex items-center justify-center p-0 text-[9px] bg-yellow-400 text-black hover:bg-yellow-500 rounded-full border-none"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 pt-10">
                 <div className="px-6 pb-6 border-b border-zinc-100">
                     <span className="text-2xl font-black tracking-tighter uppercase">PULLEX</span>
                 </div>
                <nav className="flex flex-col mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-6 py-4 text-sm font-bold tracking-widest uppercase border-b border-zinc-100 hover:bg-zinc-50 flex justify-between items-center"
                    >
                      {link.label}
                      <span className="text-xs">→</span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
}
