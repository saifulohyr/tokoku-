"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown, Plus, Search, Filter } from "lucide-react";
import { useProducts, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { EditProductDialog } from "./edit-product-dialog";
import type { Product } from "@/lib/schemas/product";

export function InventoryTable() {
  const { data: products, isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sorting Handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => {
    if (sortColumn === "price") {
        return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
    }
    if (sortColumn === "stock") {
        return sortDirection === "asc" ? a.stock - b.stock : b.stock - a.stock;
    }
    return 0; // Default sort by name (implicit in DB or stable sort)
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Actions
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (updatedData: Partial<Product>) => {
    if (editingProduct && updatedData) {
       updateProduct.mutate({
          id: editingProduct.id,
          data: {
             name: updatedData.name,
             price: updatedData.price,
             stock: updatedData.stock,
             description: updatedData.description || undefined,
             category: updatedData.category || undefined,
             imageUrl: updatedData.imageUrl || undefined,
          }
       });
    }
  };

  const handleDeleteClick = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <EditProductDialog 
         open={isEditOpen} 
         onOpenChange={setIsEditOpen} 
         product={editingProduct} 
         onSave={handleSaveEdit}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
           <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-white dark:bg-zinc-900"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
           </div>
           <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead className="w-[300px]">
                 <Button variant="ghost" onClick={() => handleSort("name")} className="font-bold uppercase tracking-wider text-xs p-0 hover:bg-transparent">
                    Product Name <ArrowUpDown className="ml-2 h-3 w-3" />
                 </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => handleSort("price")} className="font-bold uppercase tracking-wider text-xs p-0 hover:bg-transparent">
                    Price <ArrowUpDown className="ml-2 h-3 w-3" />
                 </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => handleSort("stock")} className="font-bold uppercase tracking-wider text-xs p-0 hover:bg-transparent">
                    Stock <ArrowUpDown className="ml-2 h-3 w-3" />
                 </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                     <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                     <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                     <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                     <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                     <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
               ))
            ) : (
               filteredProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                       <div className="relative h-10 w-10 overflow-hidden rounded-md bg-zinc-100">
                          {product.imageUrl && (
                             <Image 
                               src={product.imageUrl} 
                               alt={product.name} 
                               fill 
                               className="object-cover"
                             />
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="font-medium">
                       {product.name}
                       <div className="text-xs text-muted-foreground uppercase tracking-wider">SKU: {product.id.toString().padStart(6, '0')}</div>
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          {product.stock === 0 ? (
                             <Badge variant="destructive" className="uppercase text-[10px]">Out of Stock</Badge>
                          ) : product.stock < 5 ? (
                             <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 uppercase text-[10px]">Low: {product.stock}</Badge>
                          ) : (
                             <span className="font-mono">{product.stock}</span>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id.toString())}>
                            Copy Product ID
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(product)}>
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(product.id)} className="text-red-600">
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
               ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
