"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/components/layout/main-layout";

export default function CartPage() {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const getTotalPrice = useCart((state) => state.getTotalPrice);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Keranjang</h1>
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Keranjang</h1>
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Keranjang kosong</h2>
          <p className="text-muted-foreground mb-6">
            Belum ada produk di keranjang belanja Anda
          </p>
          <Link href="/products">
            <Button>Lihat Produk</Button>
          </Link>
        </div>
      </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Keranjang</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                transition={{ layout: { duration: 0.3 } }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`} className="hover:underline">
                           <h3 className="font-bold uppercase tracking-wide truncate">{item.name}</h3>
                        </Link>
                        <p className="text-lg font-black mt-1">
                          {formatPrice(item.price)}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                          STOCK: {item.stock}
                        </p>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.productId, item.quantity - 1);
                              }
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-4 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => {
                              if (item.quantity < item.stock) {
                                updateQuantity(item.productId, item.quantity + 1);
                              }
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (11%)</span>
                  <span>{formatPrice(getTotalPrice() * 0.11)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice() * 1.11)}</span>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button className="w-full" size="lg">
                  Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
