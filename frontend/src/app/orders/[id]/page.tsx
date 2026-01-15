"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  ArrowLeft,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder, useCheckPaymentStatus } from "@/hooks/use-orders";
import type { OrderStatus } from "@/lib/schemas/order";

// Status Components
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

function CheckPaymentButton({ orderId }: { orderId: number }) {
  const checkStatus = useCheckPaymentStatus();
  
  return (
    <Button 
      size="sm" 
      className="uppercase text-xs font-bold tracking-widest bg-green-600 hover:bg-green-700 w-full md:w-auto"
      onClick={() => checkStatus.mutate(orderId)}
      disabled={checkStatus.isPending}
    >
      {checkStatus.isPending ? (
        <>
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Checking...
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3 mr-1" /> Cek Status Pembayaran
        </>
      )}
    </Button>
  );
}

function OrderDetailsContent() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  
  const { data: order, isLoading, error } = useOrder(id);

  if (isNaN(id)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Order ID invalid
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
           <Skeleton className="h-8 w-48 mb-2" />
           <Skeleton className="h-4 w-24" />
        </div>
        <Card className="mb-6">
           <CardContent className="p-6">
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-24 w-full" />
           </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">
          Pesanan dengan ID #{id} tidak ditemukan.
        </p>
        <Link href="/orders">
          <Button variant="outline">Kembali ke Daftar Pesanan</Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.PENDING;

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
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  const subtotal = order.items.reduce((acc, item) => acc + item.priceAtOrder * item.quantity, 0);
  const tax = order.totalPrice - subtotal;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 hover:bg-transparent hover:underline flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            ORDER #{order.id}
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={status.variant} className="px-4 py-2 gap-2 text-sm uppercase tracking-widest font-bold">
          {status.icon}
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-black italic uppercase text-xl">Daftar Barang</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100">
                {order.items.map((item, index) => (
                  <div key={index} className="p-6 flex gap-4">
                    <div className="w-20 h-20 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                       {item.productImage ? (
                          <img src={item.productImage} alt={item.productName || "Product"} className="w-full h-full object-cover" />
                       ) : (
                          <Package className="w-8 h-8 text-zinc-300" />
                       )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold uppercase tracking-wide text-sm mb-1">
                        {item.productName || `Product #${item.productId}`}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Qty: {item.quantity} x {formatPrice(item.priceAtOrder)}
                      </p>
                      <p className="font-semibold">
                        {formatPrice(item.priceAtOrder * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address Card */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="font-black italic uppercase text-lg">Alamat Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{order.shippingAddress}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingCity}{order.shippingPostalCode && `, ${order.shippingPostalCode}`}
                </p>
                {order.shippingPhone && (
                  <p className="text-sm text-muted-foreground">
                    📞 {order.shippingPhone}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-black italic uppercase text-lg">Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1 tracking-widest">Metode</p>
                  <p className="font-medium">Virtual Account / QRIS</p>
               </div>
               <Separator />
               <div>
                  <div className="flex justify-between mb-2">
                     <span className="text-sm text-muted-foreground">Subtotal</span>
                     <span className="font-medium">{formatPrice(subtotal)}</span> 
                  </div>
                  <div className="flex justify-between mb-2">
                     <span className="text-sm text-muted-foreground">Tax (11%)</span>
                     <span className="font-medium">{formatPrice(tax)}</span> 
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100 mt-2">
                     <span className="font-black italic uppercase text-lg">Total</span>
                     <span className="font-black italic text-lg">{formatPrice(order.totalPrice)}</span>
                  </div>
               </div>

               {(order.status === 'AWAITING_PAYMENT' || order.status === 'PENDING') && (
                 <div className="pt-4">
                   <CheckPaymentButton orderId={order.id} />
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function OrderDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// Default export with Suspense boundary
export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<OrderDetailsSkeleton />}>
      <OrderDetailsContent />
    </Suspense>
  );
}
