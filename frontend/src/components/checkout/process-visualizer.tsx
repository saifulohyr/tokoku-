"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, CreditCard, Package, Lock, ShieldCheck, Truck, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProcessStep = "inventory" | "secure" | "payment" | "success" | "failed";

interface ProcessVisualizerProps {
  status: ProcessStep;
  error?: string;
  retryCount?: number;
}

export function ProcessVisualizer({ status, error, retryCount = 0 }: ProcessVisualizerProps) {
  // Map internal status to visual steps
  // 1: Checking Inventory, 2: Securing Stock, 3: Processing Payment, 4: Confirmed
  const getStepIndex = (s: ProcessStep) => {
    switch (s) {
      case "inventory": return 0;
      case "secure": return 1;
      case "payment": return 2;
      case "success": return 3;
      case "failed": return -1; // Special case
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  const steps = [
    {
      id: "inventory",
      label: "CHECKING INVENTORY",
      subtext: "Verifying stock availability globally...",
      icon: Package,
    },
    {
      id: "secure",
      label: "SECURING GOODS",
      subtext: "Locking items to prevent race conditions...",
      icon: Lock,
    },
    {
      id: "payment",
      label: "PAYMENT GATEWAY",
      subtext: "Securely transmitting encrypted data...",
      icon: CreditCard,
    },
    {
      id: "success",
      label: "ORDER CONFIRMED",
      subtext: "Transaction committed to ledger.",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* TERMINAL LOG HEADER */}
      <div className="bg-black text-green-500 font-mono text-xs p-2 rounded-t-lg flex justify-between items-center border border-zinc-800">
        <span>DISTRIBUTED_TX_MONITOR_V2.4</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>

      <Card className="rounded-t-none border-t-0 border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden bg-white dark:bg-zinc-950">
        <CardContent className="p-8">
          
          {/* ERROR STATE */}
          {status === "failed" ? (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center text-center py-8"
             >
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                   <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-500" />
                </div>
                <h2 className="text-3xl font-black italic uppercase mb-2 tracking-tighter">TRANSACTION FAILED</h2>
                <p className="text-muted-foreground mb-6 max-w-md font-mono text-sm">
                   {error || "System rolled back due to consistency check failure."}
                </p>
             </motion.div>
          ) : (
             /* SUCCESS / LOADING STATE */
             <div className="space-y-8">
               
               {/* Main Icon & Status (CENTER STAGE) */}
               <div className="flex flex-col items-center justify-center min-h-[180px] py-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center"
                    >
                       <div className="relative mb-6">
                          {/* Pulse Ring */}
                          {status !== 'success' && (
                             <motion.div 
                               className="absolute inset-0 rounded-full border-4 border-black/10 dark:border-white/10"
                               animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                               transition={{ duration: 2, repeat: Infinity }}
                             />
                          )}
                          
                          <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center border-4",
                            status === 'success' ? "bg-black text-white border-black" : "bg-white text-black border-black"
                          )}>
                             {(() => {
                                const StepIcon = steps[currentIndex]?.icon || Package;
                                return <StepIcon className="w-10 h-10" strokeWidth={1.5} />;
                             })()}
                          </div>
                       </div>
                       
                       <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-center">
                          {steps[currentIndex]?.label}
                       </h2>
                       <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                          {steps[currentIndex]?.subtext}
                          {status !== 'success' && <span className="animate-cursor-blink">_</span>}
                       </p>
                    </motion.div>
                  </AnimatePresence>
               </div>

               {/* Retry Count Indicator (If needed) */}
               {retryCount > 0 && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 py-2 px-4 rounded-full w-fit mx-auto"
                 >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                       Fault Tolerance Active: Retry Attempt #{retryCount}
                    </span>
                 </motion.div>
               )}

               {/* Progress Bar & Steps */}
               <div className="relative pt-8">
                  <div className="absolute top-[45px] left-0 w-full h-0.5 bg-zinc-100 dark:bg-zinc-800" />
                  <motion.div 
                     className="absolute top-[45px] left-0 h-0.5 bg-black dark:bg-white z-10"
                     initial={{ width: "0%" }}
                     animate={{ width: `${((currentIndex) / (steps.length - 1)) * 100}%` }}
                     transition={{ duration: 0.5 }}
                  />
                  
                  <div className="flex justify-between relative z-20">
                     {steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center gap-3 w-24">
                           <motion.div 
                              className={cn(
                                "w-3 h-3 rounded-full border-2 transition-colors duration-300",
                                idx <= currentIndex 
                                  ? "bg-black border-black dark:bg-white dark:border-white" 
                                  : "bg-white border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700"
                              )}
                              animate={idx === currentIndex ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                              transition={idx === currentIndex ? { repeat: Infinity, duration: 2 } : {}}
                           />
                           <span className={cn(
                              "text-[10px] uppercase font-bold tracking-widest text-center transition-colors duration-300",
                              idx <= currentIndex ? "text-black dark:text-white" : "text-zinc-300 dark:text-zinc-700"
                           )}>
                              STEP 0{idx + 1}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>

             </div>
          )}
        </CardContent>
      </Card>
      
      {/* Distributed System Footer */}
      <div className="mt-4 flex justify-between text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
         <span>Node: SG-1 (Primary)</span>
         <span>Latency: 24ms</span>
         <span>Sync: Active</span>
      </div>
    </div>
  );
}
