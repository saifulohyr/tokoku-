"use client";

import { useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/main-layout";

function HomePageContent() {
  const targetRef = useRef(null);
  const { data: products, isLoading } = useProducts();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as any } 
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get 4 random products or latest for trending
  const trendingProducts = products ? products.slice(0, 4) : [];

  return (
    <MainLayout>
      {/* HERO SECTION 1: PARALLAX */}
      <section ref={targetRef} className="relative w-full h-[90vh] overflow-hidden flex items-center justify-center bg-zinc-900">
        <motion.div style={{ y, opacity }} className="absolute inset-0">
           <Image
             src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2670&auto=format&fit=crop"
             alt="Sneaker Hero"
             fill
             className="object-cover opacity-70"
             priority
           />
        </motion.div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="bg-white px-3 py-1 mb-6"
          >
             <span className="text-xs font-bold tracking-widest text-black uppercase">LOW PROFILE IN DESIGN</span>
          </motion.div>
          
          <motion.h1 
             className="text-7xl md:text-[9rem] font-black italic tracking-tighter text-white drop-shadow-xl mb-4 leading-[0.85]"
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
          >
            THE ORIGINAL
          </motion.h1>
          
          <motion.p 
             className="text-white text-lg md:text-2xl font-medium tracking-wide mb-8 max-w-xl"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
          >
             KULTUR. GAYA. PERFORMA.
          </motion.p>
          
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8 }}
          >
              <Link href="/products">
                <Button className="bg-white text-black hover:bg-zinc-200 font-bold tracking-widest px-8 py-6 rounded-none uppercase text-sm h-14">
                   BELANJA SEKARANG <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: CATEGORY GRID (Simple Links to Products) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1 bg-white dark:bg-black">
         <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={itemVariants}
            className="relative h-[600px] group overflow-hidden bg-zinc-100 cursor-pointer"
         >
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop"
              alt="Women Fashion"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute bottom-10 left-10">
               <motion.h3 variants={itemVariants} className="text-5xl font-black italic uppercase text-white drop-shadow-md mb-4 tracking-tighter">KOLEKSI BARU</motion.h3>
               <Link href="/products">
                  <span className="bg-white text-black px-6 py-4 font-bold text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors">
                     LIHAT PRODUK
                  </span>
               </Link>
            </div>
         </motion.div>

         <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={itemVariants}
            className="relative h-[600px] group overflow-hidden bg-zinc-100 cursor-pointer"
         >
            <Image
              src="https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=2670&auto=format&fit=crop"
              alt="Men Fashion"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
             <div className="absolute bottom-10 left-10">
               <motion.h3 variants={itemVariants} className="text-5xl font-black italic uppercase text-white drop-shadow-md mb-4 tracking-tighter">BEST SELLER</motion.h3>
               <Link href="/products">
                  <span className="bg-white text-black px-6 py-4 font-bold text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors">
                     LIHAT PRODUK
                  </span>
               </Link>
            </div>
         </motion.div>
      </section>

      {/* SECTION 3: TRENDING NOW (Real Data) */}
      <section className="py-24 px-6 container mx-auto">
         <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={containerVariants}
         >
             <h2 className="text-3xl md:text-6xl font-black italic uppercase mb-16 tracking-tighter text-center md:text-left">
                TRENDING MINGGU INI
             </h2>
             
             {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                   {[1,2,3,4].map((i) => (
                      <div key={i} className="space-y-4">
                         <Skeleton className="aspect-square w-full" />
                         <Skeleton className="h-4 w-2/3" />
                         <Skeleton className="h-4 w-1/3" />
                      </div>
                   ))}
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {trendingProducts.length > 0 ? (
                        trendingProducts.map((product) => (
                           <Link href={`/products/${product.id}`} key={product.id} className="group">
                              <motion.div variants={itemVariants} className="flex flex-col cursor-pointer">
                                 <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 mb-4 overflow-hidden border border-transparent hover:border-black dark:hover:border-white transition-colors">
                                    {product.imageUrl ? (
                                       <Image
                                          src={product.imageUrl} 
                                          alt={product.name}
                                          fill
                                          className="object-cover mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-700"
                                       />
                                    ) : (
                                       <div className="absolute inset-0 flex items-center justify-center">
                                          <Package className="h-10 w-10 text-zinc-300" />
                                       </div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-white text-black px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
                                       BARU
                                    </div>
                                 </div>
                                 <div className="flex justify-between items-start">
                                   <div>
                                     <h4 className="text-sm font-bold uppercase tracking-wide line-clamp-1">{product.name}</h4>
                                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 mb-2">
                                       {product.category || "Original Series"}
                                     </p>
                                     <div className="flex items-center text-[10px] font-medium bg-zinc-50 dark:bg-zinc-900 w-fit px-1.5 py-0.5 rounded-sm">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                                        <span className="text-zinc-900 dark:text-zinc-100">
                                          {(4.5 + (product.id % 5) * 0.1).toFixed(1)}
                                        </span>
                                        <span className="mx-1.5 text-zinc-300">|</span>
                                        <span className="text-zinc-500">
                                          {100 + (product.id * 12) % 1000}+ sold
                                        </span>
                                      </div>
                                   </div>
                                   <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                                 </div>
                              </motion.div>
                           </Link>
                        ))
                    ) : (
                        <div className="col-span-4 text-center py-12 text-muted-foreground">
                           Belum ada produk trending.
                        </div>
                    )}
                </div>
             )}
         </motion.div>
      </section>

      {/* SECTION 4: STORY */}
      <section className="bg-yellow-400 dark:bg-yellow-600 py-32 px-6 mb-12 overflow-hidden">
           <div className="container mx-auto flex flex-col md:flex-row items-center gap-16">
              <motion.div 
                 className="flex-1 z-10"
                 initial={{ x: -50, opacity: 0 }}
                 whileInView={{ x: 0, opacity: 1 }}
                 transition={{ duration: 0.8 }}
                 viewport={{ once: true }}
              >
                 <h2 className="text-5xl md:text-8xl font-black italic uppercase leading-[0.9] mb-8 tracking-tighter text-black">
                    IMPOSSIBLE<br/>IS NOTHING
                 </h2>
                 <p className="text-black text-xl font-medium mb-10 max-w-md leading-relaxed">
                    Kami melihat kemungkinan di mana orang lain melihat ketidakmungkinan. 
                    Bergabunglah dengan komunitas kami dan ubah permainan.
                 </p>
                 <Link href="/about">
                    <Button className="bg-black text-white hover:bg-zinc-800 rounded-none px-10 py-7 font-bold tracking-widest uppercase h-auto text-sm transition-transform hover:scale-105">
                       TENTANG KAMI <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                 </Link>
              </motion.div>
              
              <motion.div 
                 className="flex-1 w-full relative h-[500px]"
                 initial={{ x: 50, opacity: 0 }}
                 whileInView={{ x: 0, opacity: 1 }}
                 transition={{ duration: 0.8 }}
                 viewport={{ once: true }}
              >
                 <Image
                    src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2669&auto=format&fit=crop"
                    alt="Story"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl skew-x-[-6deg]"
                 />
              </motion.div>
           </div>
      </section>

    </MainLayout>
  );
}

// Loading fallback for Suspense
function HomePageLoading() {
  return (
    <MainLayout>
      <div className="w-full h-[90vh] bg-zinc-900 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1">
        <div className="h-[600px] bg-zinc-100 animate-pulse" />
        <div className="h-[600px] bg-zinc-100 animate-pulse" />
      </div>
    </MainLayout>
  );
}

// Default export with Suspense boundary
export default function HomePage() {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageContent />
    </Suspense>
  );
}
