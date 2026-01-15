"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface LiveStockBadgeProps {
  stock: number;
  className?: string;
}

export function LiveStockBadge({ stock: initialStock, className }: LiveStockBadgeProps) {
  const [stock, setStock] = useState(initialStock);
  const [activeViewers, setActiveViewers] = useState(0);

  // SIMULATED REAL-TIME UPDATES
  // In a real app, this would be a Supabase Realtime subscription
  useEffect(() => {
    // Random active viewers
    setActiveViewers(Math.floor(Math.random() * 10) + 2);

    const interval = setInterval(() => {
       // 30% chance to update stock
       if (Math.random() > 0.7 && stock > 0) {
          setStock(prev => Math.max(0, prev - 1));
       }
       // Update viewers randomly
       setActiveViewers(prev => Math.max(2, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (stock === 0) {
     return (
        <div className={cn("inline-flex items-center gap-2", className)}>
           <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">SOLD OUT</span>
        </div>
     )
  }

  return (
    <div className={cn("flex flex-col gap-1 items-start", className)}>
        {/* Live Indicator */}
       <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-3 h-3">
             <motion.div 
               className="absolute inset-0 bg-green-500 rounded-full opacity-50"
               animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
             />
             <div className="w-2 h-2 bg-green-500 rounded-full z-10" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">
             LIVE STOCK:
          </span>
          
          <AnimatePresence mode="popLayout">
             <motion.span 
               key={stock}
               initial={{ y: -10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 10, opacity: 0 }}
               className="text-xs font-bold font-mono"
             >
                {stock}
             </motion.span>
          </AnimatePresence>
       </div>

       {/* Social Proof / FOMO */}
       {stock < 5 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-[9px] text-red-500 font-medium uppercase tracking-wide"
          >
             <Users className="w-3 h-3" />
             {activeViewers} orang sedang melihat ini
          </motion.div>
       )}
    </div>
  );
}
