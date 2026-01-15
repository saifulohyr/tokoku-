"use client";

import { useAdminOrders } from "@/hooks/use-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error } = useAdminOrders();
  const [filter, setFilter] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredOrders = orders?.filter((order) =>
    order.id.toString().includes(filter) ||
    order.user?.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    order.status.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
       <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
             <strong className="font-bold">Error loading orders!</strong>
             <span className="block sm:inline"> {error.message || "Failed to fetch orders."}</span>
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">ORDER MANAGEMENT</h1>
        <Badge variant="outline" className="text-sm">
          {filteredOrders?.length ?? 0} Transactions
        </Badge>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold uppercase tracking-wider">All Transactions</CardTitle>
              <div className="relative w-64">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search Order ID, User, or Status..." 
                   className="pl-9"
                   value={filter}
                   onChange={(e) => setFilter(e.target.value)}
                 />
              </div>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>User & Shipping</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                       No orders found.
                    </TableCell>
                 </TableRow>
              ) : (
                 filteredOrders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium align-top">#{order.id}</TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="font-medium">{order.user?.fullName}</span>
                            <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                         </div>
                         {order.shippingAddress && (
                           <div className="mt-2 text-xs text-muted-foreground border-t pt-1">
                              <p className="font-semibold text-zinc-700">Shipping:</p>
                              <p>{order.shippingAddress}</p>
                              <p>{order.shippingCity}, {order.shippingPostalCode}</p>
                              <p>{order.shippingPhone}</p>
                           </div>
                         )}
                      </TableCell>
                      <TableCell className="font-bold align-top">{formatPrice(Number(order.totalPrice))}</TableCell>
                      <TableCell className="align-top">
                         <Badge 
                            variant={order.status === 'PAID' ? 'default' : 'secondary'}
                            className={`uppercase ${
                               order.status === 'PAID' ? 'bg-green-600 hover:bg-green-700' :
                               order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                               order.status === 'FAILED' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''
                            }`}
                         >
                            {order.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="uppercase text-xs align-top">{order.paymentId || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground align-top">
                         {order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                         }) : '-'}
                      </TableCell>
                    </TableRow>
                 ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
