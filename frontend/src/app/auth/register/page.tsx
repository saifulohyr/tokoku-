"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth";
import { RegisterSchema, type RegisterInput } from "@/lib/schemas/auth";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      
      {/* LEFT: FORM SECTION */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 bg-white dark:bg-black animate-in fade-in slide-in-from-left duration-700">
        <div className="w-full max-w-sm mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase mb-3">
              JOIN US
            </h1>
            <p className="text-muted-foreground text-lg">
              Buat akun untuk memulai perjalanan atletik Anda bersama PULLEX.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="uppercase text-xs font-bold tracking-widest text-zinc-500">
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                className="h-12 border-0 border-b border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-transparent text-lg placeholder:text-zinc-300 transition-colors"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 font-medium animate-pulse">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="uppercase text-xs font-bold tracking-widest text-zinc-500">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@pullex.com"
                className="h-12 border-0 border-b border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-transparent text-lg placeholder:text-zinc-300 transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600 font-medium animate-pulse">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="uppercase text-xs font-bold tracking-widest text-zinc-500">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 border-0 border-b border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-transparent text-lg placeholder:text-zinc-300 transition-colors"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-red-600 font-medium animate-pulse">{errors.password.message}</p>
              ) : (
                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                   Min 8 chars, 1 uppercase, 1 lowercase, 1 number
                 </p>
              )}
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98]"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    CREATING ACCOUNT...
                  </>
                ) : (
                  <>
                    BECOME A MEMBER <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-black dark:text-white font-bold uppercase tracking-wider hover:underline ml-1">
                Login disini
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: IMAGE SECTION */}
      <div className="hidden lg:block relative bg-zinc-900 overflow-hidden">
        <motion.div 
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute inset-0"
        >
          <Image
            src="/auth-bg.png"
            alt="Register visuals"
            fill
            className="object-cover opacity-70 hover:scale-105 transition-transform duration-1000"
            priority
          />
        </motion.div>
        
        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 p-12 lg:p-24 text-white z-10 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent">
           <motion.div
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.5, duration: 0.8 }}
           >
             <h2 className="text-6xl font-black italic tracking-tighter uppercase mb-4 leading-[0.9]">
               JOIN<br/>THE<br/>ELITE.
             </h2>
             <p className="text-zinc-300 max-w-md text-lg font-light leading-relaxed">
               Akses eksklusif ke produk terbatas, event spesial, dan komunitas lari global.
             </p>
           </motion.div>
        </div>
      </div>

    </div>
  );
}
