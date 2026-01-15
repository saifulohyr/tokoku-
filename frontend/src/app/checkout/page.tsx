"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder, useCheckPaymentStatus } from "@/hooks/use-orders";
import { useProfile } from "@/hooks/use-auth";
import { ProcessVisualizer, ProcessStep } from "@/components/checkout/process-visualizer";
import { toast } from "sonner";
import { useSnap } from "@/hooks/use-snap";
import { MainLayout } from "@/components/layout/main-layout";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const getTotalPrice = useCart((state) => state.getTotalPrice);
  const clearCart = useCart((state) => state.clearCart);
  const { data: user, isLoading: isLoadingUser } = useProfile();
  const createOrder = useCreateOrder();
  
  // Distributed System States
  const [visualStep, setVisualStep] = useState<ProcessStep>("inventory");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Shipping Address State
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");

  // Snap Hook
  const { snap, isLoaded: isSnapLoaded } = useSnap();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Checkout Handler
  const checkPaymentStatus = useCheckPaymentStatus();

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!isSnapLoaded) {
      toast.error("Sistem pembayaran sedang memuat, silakan coba sesaat lagi.");
      return;
    }

    setIsProcessing(true);
    setVisualStep("inventory");
    setRetryCount(0);

    try {
      // Step 1: Inventory (Fast)
      await new Promise(resolve => setTimeout(resolve, 500));
      setVisualStep("secure");
      
      // Step 2: Create Order
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        shippingCity,
        shippingPostalCode,
        shippingPhone,
      };

      const newOrder = await createOrder.mutateAsync(orderData);
      
      // Step 3: Payment (Snap)
      setOrderId(newOrder.id);
      setVisualStep("payment");

      if (newOrder.snapToken && window.snap) {
        window.snap.pay(newOrder.snapToken, {
          onSuccess: function(result: any) {
            setVisualStep("success");
            clearCart();
            toast.success("Pembayaran Berhasil!");
          },
          onPending: function(result: any) {
             toast.info("Menunggu pembayaran...");
             router.push(`/orders`); 
          },
          onError: function(result: any) {
             // Verify status before declaring failure
             toast.loading("Memverifikasi status pembayaran...");
             checkPaymentStatus.mutate(newOrder.id, {
                onSuccess: (data) => {
                   toast.dismiss();
                   if (data.currentStatus === 'PAID') {
                      setVisualStep("success");
                      clearCart();
                      toast.success("Pembayaran Berhasil! (Terverifikasi)");
                   } else {
                      setVisualStep("failed");
                      setErrorMsg("Pembayaran gagal.");
                      toast.error("Pembayaran gagal.");
                   }
                },
                onError: () => {
                   toast.dismiss();
                   setVisualStep("failed");
                   setErrorMsg("Pembayaran gagal.");
                   toast.error("Pembayaran gagal.");
                }
             });
          },
          onClose: function() {
             // Also check on close, just in case
             checkPaymentStatus.mutate(newOrder.id, {
                onSuccess: (data) => {
                   if (data.currentStatus === 'PAID') {
                      setVisualStep("success");
                      clearCart();
                      toast.success("Pembayaran Berhasil!");
                   } else {
                      toast.warning("Pembayaran belum diselesaikan.");
                   }
                },
                onError: () => {
                   toast.warning("Pembayaran belum diselesaikan.");
                }
             });
          }
        });
      } else {
         setVisualStep("failed");
         setErrorMsg("Gagal memuat token pembayaran.");
      }

    } catch (err: any) {
      setVisualStep("failed");
      setErrorMsg(err.message || "Gagal memproses pesanan.");
    } finally {
      // Keep processing state if successful to show success view
    }
  };

  // Not mounted yet
  if (!mounted) return null;

  // VIEW: PROCESSING / SUCCESS / FAILURE
  if (isProcessing) {
    return (
      <MainLayout>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
         <ProcessVisualizer 
            status={visualStep} 
            error={errorMsg} 
            retryCount={retryCount} 
         />
         
         {visualStep === "success" && (
            <div className="mt-8 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link href="/orders">
                  <Button className="font-bold tracking-widest uppercase bg-black text-white px-8 h-12">
                     Lihat Pesanan <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="font-bold tracking-widest uppercase h-12">
                     Belanja Lagi
                  </Button>
                </Link>
            </div>
         )}
         
         {visualStep === "failed" && (
            <div className="mt-8 flex gap-4">
                <Button 
                  onClick={() => setIsProcessing(false)} 
                  variant="outline"
                  className="font-bold tracking-widest uppercase"
                >
                   Kembali
                </Button>
            </div>
         )}
      </div>
      </MainLayout>
    );
  }

  // VIEW: EMPTY CART
  if (items.length === 0) {
    return (
      <MainLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-zinc-300" />
        <h2 className="text-4xl font-black italic uppercase mb-4 tracking-tighter">KERANJANG KOSONG</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Mulai koleksi sepatumu sekarang.
        </p>
        <Link href="/products">
          <Button className="bg-black text-white hover:bg-zinc-800 font-bold tracking-widest uppercase h-12 px-8">
            Lihat Produk Ops <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
      </MainLayout>
    );
  }

  // VIEW: CHECKOUT FORM
  return (
    <MainLayout>
    <div className="container mx-auto px-4 py-8 max-w-6xl">
       <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: FORM (Mock for now, mostly user info) */}
          <div className="flex-1">
             <h1 className="text-4xl font-black italic uppercase mb-8 tracking-tighter">CHECKOUT</h1>
             
             {/* Login Warning */}
             {!isLoadingUser && !user && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                   <p className="font-bold text-yellow-800 uppercase tracking-wide text-xs mb-1">PEMBERITAHUAN SYSTEM</p>
                   <p className="text-sm">Anda harus <Link href="/auth/login" className="font-bold underline">Login</Link> untuk menyelesaikan transaksi ini.</p>
                </div>
             )}

             <div className="space-y-6">
                <div className="border border-zinc-200 p-6 rounded-none">
                   <h3 className="font-black italic uppercase text-xl mb-4">ALAMAT PENGIRIMAN</h3>
                   {user ? (
                      <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <p className="font-bold uppercase tracking-wider text-sm">{user.fullName}</p>
                             <p className="text-muted-foreground text-xs">{user.email}</p>
                           </div>
                         </div>
                         <div className="space-y-3 pt-2">
                           <div>
                             <Label htmlFor="shippingAddress" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Alamat Lengkap *</Label>
                             <Input
                               id="shippingAddress"
                               value={shippingAddress}
                               onChange={(e) => setShippingAddress(e.target.value)}
                               placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan"
                               className="mt-1"
                               required
                             />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                             <div>
                               <Label htmlFor="shippingCity" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Kota *</Label>
                               <Input
                                 id="shippingCity"
                                 value={shippingCity}
                                 onChange={(e) => setShippingCity(e.target.value)}
                                 placeholder="Jakarta Selatan"
                                 className="mt-1"
                                 required
                               />
                             </div>
                             <div>
                               <Label htmlFor="shippingPostalCode" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Kode Pos *</Label>
                               <Input
                                 id="shippingPostalCode"
                                 value={shippingPostalCode}
                                 onChange={(e) => setShippingPostalCode(e.target.value)}
                                 placeholder="12345"
                                 className="mt-1"
                                 required
                               />
                             </div>
                           </div>
                           <div>
                             <Label htmlFor="shippingPhone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">No. Telepon *</Label>
                             <Input
                               id="shippingPhone"
                               value={shippingPhone}
                               onChange={(e) => setShippingPhone(e.target.value)}
                               placeholder="081234567890"
                               className="mt-1"
                               required
                             />
                           </div>
                         </div>
                      </div>
                   ) : (
                      <div className="h-20 bg-zinc-100 animate-pulse" />
                   )}
                </div>

                <div className="border border-zinc-200 p-6 rounded-none">
                   <h3 className="font-black italic uppercase text-xl mb-4">METODE PEMBAYARAN</h3>
                   <div className="flex items-center gap-4 border border-black p-4 bg-black text-white">
                      <div className="w-4 h-4 rounded-full border-2 border-white bg-white flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-black" />
                      </div>
                      <span className="font-bold uppercase tracking-widest text-sm">VIRTUAL ACCOUNT (AUTO)</span>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:w-[400px]">
             <div className="bg-zinc-50 p-8 sticky top-24 border border-zinc-200">
                <h3 className="font-black italic uppercase text-xl mb-6">RINGKASAN</h3>
                
                <div className="space-y-4 mb-8">
                   {items.map((item) => (
                      <div key={item.productId} className="flex justify-between items-start text-sm">
                         <div>
                            <p className="font-bold uppercase tracking-wide">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                         </div>
                         <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                   ))}
                </div>

                <Separator className="bg-zinc-200 mb-4" />

                <div className="flex justify-between items-center mb-2">
                   <span className="text-sm uppercase tracking-widest text-muted-foreground">SUBTOTAL</span>
                   <span className="font-bold">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                   <span className="text-sm uppercase tracking-widest text-muted-foreground">TAX (11%)</span>
                   <span className="font-bold">{formatPrice(getTotalPrice() * 0.11)}</span>
                </div>

                <div className="flex justify-between items-center mb-8 pt-4 border-t border-black">
                   <span className="font-black italic uppercase text-xl">TOTAL</span>
                   <span className="font-black italic text-xl">{formatPrice(getTotalPrice() * 1.11)}</span>
                </div>

                <Button
                   className="w-full bg-black hover:bg-zinc-800 text-white font-bold tracking-widest uppercase h-14 rounded-none text-base"
                   onClick={handleCheckout}
                   disabled={!user || isProcessing}
                >
                   {isProcessing ? "PROCESSING..." : "BAYAR SEKARANG"}
                </Button>
                
                <p className="text-[10px] text-center text-zinc-400 mt-4 uppercase tracking-widest">
                   SECURE CHECKOUT POWERED BY DISTRIBUTED LEDGER
                </p>
             </div>
          </div>

       </div>
    </div>
    </MainLayout>
  );
}

