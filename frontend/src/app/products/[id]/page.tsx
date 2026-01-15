"use client";

import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Star, Truck, ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, Suspense } from "react";

function ProductDetailContent() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const { data: product, isLoading, error } = useProduct(productId);
  const addItem = useCart((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    
    setIsAdding(true);
    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang!`);
    
    setTimeout(() => setIsAdding(false), 1000);
  };

  if (isLoading) {
     return (
        <div className="container mx-auto px-4 py-8">
           <Skeleton className="h-8 w-1/3 mb-6" />
           <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-[400px] rounded-xl" />
              <div className="space-y-4">
                 <Skeleton className="h-10 w-3/4" />
                 <Skeleton className="h-6 w-1/4" />
                 <Skeleton className="h-32 w-full" />
              </div>
           </div>
        </div>
     );
  }

  if (error || !product) {
     return (
        <div className="container mx-auto px-4 py-8 text-center">
           <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
           <Button onClick={() => router.back()}>Go Back</Button>
        </div>
     );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
         variant="ghost" 
         className="mb-6 hover:bg-transparent pl-0" 
         onClick={() => router.back()}
      >
         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shopping
      </Button>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* Product Image */}
        <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
           {product.imageUrl ? (
              <Image 
                 src={product.imageUrl} 
                 alt={product.name} 
                 fill 
                 className="object-cover hover:scale-105 transition-transform duration-500"
              />
           ) : (
              <div className="flex items-center justify-center h-full text-zinc-400">
                 No Image Available
              </div>
           )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col space-y-6">
           <div>
              <div className="flex items-center justify-between mb-2">
                 <Badge variant="outline" className="uppercase tracking-widest text-xs font-bold px-3 py-1">
                    {product.category || "General"}
                 </Badge>
                 <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                       {(4.5 + (product.id % 5) * 0.1).toFixed(1)}
                    </span>
                    <span className="mx-1 text-zinc-300">|</span>
                    <span className="text-sm text-zinc-500">
                       {100 + (product.id * 12) % 1000}+ sold
                    </span>
                 </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 lh-tight">
                 {product.name}
              </h1>
              
              <div className="text-3xl font-bold text-black dark:text-white">
                 {formatPrice(product.price)}
              </div>
           </div>

           <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>{product.description || "No description provided for this product."}</p>
           </div>

           {/* Features Mock */}
           <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                    <Truck className="w-5 h-5" />
                 </div>
                 <div className="text-sm">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">Free Shipping</p>
                    <p className="text-zinc-500">On orders over 500k</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-50 text-green-600 rounded-full">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <div className="text-sm">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">Auth Guarantee</p>
                    <p className="text-zinc-500">100% Original</p>
                 </div>
              </div>
           </div>

           <div className="pt-4">
              {product.stock > 0 ? (
                 <div className="flex flex-col gap-3">
                     <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">Availability</span>
                        <span className="text-green-600 font-bold">In Stock ({product.stock})</span>
                     </div>
                     <Button 
                        size="lg" 
                        className={`w-full text-lg font-bold tracking-wide uppercase h-14 transition-all ${
                           isAdding 
                             ? "bg-green-600 hover:bg-green-700" 
                             : "bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        }`}
                        onClick={handleAddToCart}
                        disabled={isAdding}
                     >
                        {isAdding ? (
                           <>
                              <CheckCircle className="mr-2 h-5 w-5" /> Added!
                           </>
                        ) : (
                           <>
                              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                           </>
                        )}
                     </Button>
                 </div>
              ) : (
                 <Button disabled size="lg" className="w-full text-lg font-bold tracking-wide uppercase h-14 bg-zinc-200 text-zinc-400">
                    Out of Stock
                 </Button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for Suspense
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-1/3 mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="h-[400px] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense boundary
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent />
    </Suspense>
  );
}
