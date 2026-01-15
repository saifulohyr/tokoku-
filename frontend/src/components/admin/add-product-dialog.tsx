"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProduct } from "@/hooks/use-products";
import { Plus, Loader2 } from "lucide-react";
import type { CreateProductInput } from "@/lib/schemas/product";

const initialFormData: CreateProductInput = {
  name: "",
  description: "",
  category: "",
  price: 0,
  stock: 0,
  imageUrl: "",
};

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProductInput>(initialFormData);
  const createProduct = useCreateProduct();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || formData.price <= 0) {
      return;
    }

    createProduct.mutate(formData, {
      onSuccess: () => {
        setFormData(initialFormData);
        setOpen(false);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setFormData(initialFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-xs">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight">New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-bold text-xs uppercase">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="PULLEX Velocity Pro"
                required
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right font-bold text-xs uppercase">
                Category
              </Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="col-span-3"
                placeholder="shoes, men, women, kids"
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right font-bold text-xs uppercase">
                Price *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="col-span-3"
                placeholder="1500000"
                min={1}
                required
              />
            </div>

            {/* Stock */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right font-bold text-xs uppercase">
                Stock *
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="col-span-3"
                placeholder="50"
                min={0}
                required
              />
            </div>

            {/* Image URL */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right font-bold text-xs uppercase">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="col-span-3"
                placeholder="/products/my-product.png"
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right font-bold text-xs uppercase pt-3">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Product description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={createProduct.isPending}
              className="bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest"
            >
              {createProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
