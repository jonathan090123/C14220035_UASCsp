'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

type Product = {
  id: string;
  nama_produk: string;
  harga_satuan: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export default function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
  const [nama_produk, setNamaProduk] = useState('');
  const [harga_satuan, setHargaSatuan] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (product) {
      setNamaProduk(product.nama_produk);
      setHargaSatuan(product.harga_satuan.toString());
      setQuantity(product.quantity.toString());
    } else {
      setNamaProduk('');
      setHargaSatuan('');
      setQuantity('');
    }
    setErrors({});
  }, [product, open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!nama_produk.trim()) {
      newErrors.nama_produk = 'Product name is required';
    }

    if (!harga_satuan.trim()) {
      newErrors.harga_satuan = 'Unit price is required';
    } else if (isNaN(Number(harga_satuan)) || Number(harga_satuan) < 0) {
      newErrors.harga_satuan = 'Unit price must be a valid positive number';
    }

    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(quantity)) || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'Quantity must be a valid positive integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await onSave({
        nama_produk: nama_produk.trim(),
        harga_satuan: Number(harga_satuan),
        quantity: Number(quantity),
      });
    } catch (error) {
      console.error('Error saving product:', error);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {product 
              ? 'Update the product information below.' 
              : 'Fill in the details to add a new product to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama_produk" className="text-sm font-medium">
              Product Name
            </Label>
            <Input
              id="nama_produk"
              placeholder="Enter product name"
              value={nama_produk}
              onChange={(e) => setNamaProduk(e.target.value)}
              className={errors.nama_produk ? 'border-red-300 focus:border-red-500' : ''}
              disabled={loading}
            />
            {errors.nama_produk && (
              <p className="text-sm text-red-600">{errors.nama_produk}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga_satuan" className="text-sm font-medium">
              Unit Price (IDR)
            </Label>
            <Input
              id="harga_satuan"
              type="number"
              placeholder="Enter unit price"
              value={harga_satuan}
              onChange={(e) => setHargaSatuan(e.target.value)}
              className={errors.harga_satuan ? 'border-red-300 focus:border-red-500' : ''}
              disabled={loading}
            />
            {errors.harga_satuan && (
              <p className="text-sm text-red-600">{errors.harga_satuan}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={errors.quantity ? 'border-red-300 focus:border-red-500' : ''}
              disabled={loading}
            />
            {errors.quantity && (
              <p className="text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

          <DialogFooter className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                product ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}