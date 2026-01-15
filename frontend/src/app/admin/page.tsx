"use client";

import { useAdminStats } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package, ShoppingCart, Loader2 } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (error) {
    return (
      <div className="p-6">
         <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-6">COMMAND CENTER</h1>
         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error loading dashboard!</strong>
            <span className="block sm:inline"> {error.message || "Failed to fetch stats."}</span>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">COMMAND CENTER</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
           System Healthy
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From all PAID orders
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registered accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalProducts ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active in inventory
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

       {/* Recent Orders - Simplified */}
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
             <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                   {/* Placeholder for now or map from stats if available */}
                   {stats?.recentOrders?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent orders.</p>
                   ) : (
                      stats?.recentOrders?.map(order => (
                         <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div>
                               <p className="text-sm font-medium leading-none mb-1">Order #{order.id}</p>
                               <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  order.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                               }`}>
                                  {order.status}
                               </span>
                            </div>
                            <div className="font-bold text-sm">{formatCurrency(Number(order.totalPrice))}</div>
                         </div>
                      ))
                   )}
                </div>
             </CardContent>
          </Card>
       </div>
    </div>
  );
}
