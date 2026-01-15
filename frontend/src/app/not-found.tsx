"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-4 overflow-hidden relative">
      {/* Background Graphic */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <span className="text-[40vw] font-black tracking-tighter">404</span>
      </div>

      <div className="z-10 text-center max-w-2xl mx-auto space-y-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
           <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter mb-2">
              OOPS!
           </h1>
           <div className="h-2 w-24 bg-black dark:bg-white mx-auto mb-6"></div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
        >
           <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wide mb-4">
              LOST IN THE GAME?
           </h2>
           <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-lg mx-auto">
              Halaman yang kamu cari tidak ditemukan. Mungkin sudah dihapus, dipindahkan, atau memang tidak pernah ada.
           </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.4 }}
           className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
           <Link href="/">
              <Button size="lg" className="h-14 px-8 text-base font-bold tracking-widest uppercase bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black rounded-none">
                 <Home className="mr-2 h-5 w-5" /> Back to Home
              </Button>
           </Link>
           <Link href="/products">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base font-bold tracking-widest uppercase rounded-none border-2 border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-900">
                 <ArrowLeft className="mr-2 h-5 w-5" /> Shop Products
              </Button>
           </Link>
        </motion.div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-8 text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
        Error Code: 404_NOT_FOUND
      </div>
    </div>
  );
}
