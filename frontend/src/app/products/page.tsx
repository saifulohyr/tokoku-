"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Package, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import type { Product } from "@/lib/schemas/product";
import { LiveStockBadge } from "@/components/ui/live-stock-badge";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/main-layout";

export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Produk</h1>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Gagal memuat produk</h2>
        <p className="text-muted-foreground">Pastikan backend sudah berjalan di port 3001</p>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Produk</h1>
        <p className="text-muted-foreground">
          {products?.length || 0} produk tersedia
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Belum ada produk</h2>
          <p className="text-muted-foreground">
            Tambahkan produk melalui Swagger API di backend
          </p>
        </div>
      )}
    </div>
    </MainLayout>
  );
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error("Stok habis");
      return;
    }
    
    // OPTIMISTIC UI: Instant feedback
    setIsAdding(true);
    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang`);
    
    // Reset button state after small delay for effect
    setTimeout(() => setIsAdding(false), 500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden group border-zinc-200 dark:border-zinc-800 rounded-none bg-white dark:bg-zinc-950">
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-pointer group-hover:opacity-90 transition-opacity">
        <Link href={`/products/${product.id}`}>
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-12 w-12 text-zinc-300" />
              </div>
            )}
        </Link>
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
           <LiveStockBadge stock={product.stock} />
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20 pointer-events-none">
            <Badge variant="destructive" className="uppercase tracking-widest px-4 py-2 font-bold">Sold Out</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="mb-2">
           <Link href={`/products/${product.id}`} className="hover:underline decoration-1 underline-offset-4">
              <h3 className="font-bold uppercase tracking-wide text-sm line-clamp-1">{product.name}</h3>
           </Link>
           <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Original Series</p>
           
           <div className="flex items-center text-xs font-medium bg-zinc-50 dark:bg-zinc-900 w-fit px-2 py-1 rounded-sm">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-zinc-900 dark:text-zinc-100">
                {(4.5 + (product.id % 5) * 0.1).toFixed(1)}
              </span>
              <span className="mx-2 text-zinc-300">|</span>
              <span className="text-zinc-500">
                {100 + (product.id * 12) % 1000}+ sold
              </span>
           </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
           <p className="text-lg font-black italic tracking-tight">{formatPrice(product.price)}</p>
        </div>

        <Button
          className={cn(
             "w-full gap-2 rounded-none font-bold tracking-widest uppercase h-10 transition-all duration-300",
             isAdding ? "bg-green-600 hover:bg-green-700 text-white" : "bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black"
          )}
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
        >
          {isAdding ? (
             <>
               <CheckCircle className="h-4 w-4" />
               ADDED
             </>
          ) : (
             <>
               <ShoppingCart className="h-4 w-4" />
               ADD TO CART
             </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
