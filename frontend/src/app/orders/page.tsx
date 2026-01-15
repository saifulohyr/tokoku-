"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, CreditCard, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders, useCheckPaymentStatus } from "@/hooks/use-orders";
import { useProfile } from "@/hooks/use-auth";
import type { OrderStatus } from "@/lib/schemas/order";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/main-layout";

// Component for check payment status button
function CheckPaymentButton({ orderId }: { orderId: number }) {
  const checkStatus = useCheckPaymentStatus();
  
  return (
    <Button 
      size="sm" 
      className="uppercase text-xs font-bold tracking-widest bg-green-600 hover:bg-green-700"
      onClick={() => checkStatus.mutate(orderId)}
      disabled={checkStatus.isPending}
    >
      {checkStatus.isPending ? (
        <>
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Checking...
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3 mr-1" /> Cek Status
        </>
      )}
    </Button>
  );
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: {
    label: "Menunggu",
    icon: <Clock className="h-4 w-4" />,
    variant: "secondary",
  },
  AWAITING_PAYMENT: {
    label: "Menunggu Pembayaran",
    icon: <CreditCard className="h-4 w-4" />,
    variant: "outline",
  },
  PAID: {
    label: "Dibayar",
    icon: <CheckCircle className="h-4 w-4" />,
    variant: "default",
  },
  FAILED: {
    label: "Gagal",
    icon: <XCircle className="h-4 w-4" />,
    variant: "destructive",
  },
  CANCELLED: {
    label: "Dibatalkan",
    icon: <XCircle className="h-4 w-4" />,
    variant: "destructive",
  },
  REFUNDED: {
    label: "Dikembalikan",
    icon: <CreditCard className="h-4 w-4" />,
    variant: "secondary",
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useProfile();
  const { data: orders, isLoading: isLoadingOrders } = useOrders();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace('/auth/login');
    }
  }, [user, isLoadingUser, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  // Loading
  if (isLoadingUser) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }
  if (!isLoadingUser && !user) {
    return (
      <MainLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Login diperlukan</h2>
        <p className="text-muted-foreground mb-6">
          Silakan login untuk melihat riwayat pesanan Anda
        </p>
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
      </MainLayout>
    );
  }

  // Loading
  if (isLoadingOrders) {
    return (
      <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Pesanan Saya</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Pesanan Saya</h1>

      {orders && orders.length > 0 ? (
        <div className="relative space-y-8 pl-8 border-l-2 border-zinc-200 dark:border-zinc-800 ml-4">
          {orders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            
            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 border-white dark:border-black bg-black dark:bg-white z-10" />

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-black italic text-lg tracking-tight">
                            ORDER #{order.id}
                          </h3>
                          <Badge variant={status.variant} className="gap-1 rounded-sm uppercase tracking-widest text-[10px] font-bold">
                            {status.icon}
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm font-medium">
                          {order.items.length} ITEM(S) | {order.paymentId ? "PAID" : "UNPAID"}
                        </p>
                        
                        {/* Mini Item Preview (First 3 items) */}
                        <div className="flex gap-2 mt-4">
                           {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-10 h-10 bg-zinc-100 rounded-sm overflow-hidden relative">
                                 {/* Just a placeholder if no image in order item schema yet */}
                                 <Package className="w-full h-full p-2 text-zinc-300" /> 
                              </div>
                           ))}
                           {order.items.length > 3 && (
                              <div className="w-10 h-10 bg-zinc-100 rounded-sm flex items-center justify-center text-xs font-bold text-zinc-500">
                                 +{order.items.length - 3}
                              </div>
                           )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black italic tracking-tighter">
                          {formatPrice(order.totalPrice)}
                        </p>
                        <div className="flex flex-col gap-2 mt-2">
                           {(order.status === 'AWAITING_PAYMENT' || order.status === 'PENDING') && (
                              <CheckPaymentButton orderId={order.id} />
                           )}
                           <Link href={`/orders/${order.id}`}>
                             <Button variant="outline" size="sm" className="uppercase text-xs font-bold tracking-widest w-full">
                               View Details
                             </Button>
                           </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Belum ada pesanan</h2>
          <p className="text-muted-foreground mb-6">
            Anda belum memiliki riwayat pesanan
          </p>
          <Link href="/products">
            <Button>Mulai Belanja</Button>
          </Link>
        </div>
      )}
    </div>
    </MainLayout>
  );
}
