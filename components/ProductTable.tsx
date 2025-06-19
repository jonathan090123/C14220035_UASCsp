'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package } from 'lucide-react';

type Product = {
  id: string;
  nama_produk: string;
  harga_satuan: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

interface ProductTableProps {
  products: Product[];
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({ products, isAdmin, onEdit, onDelete }: ProductTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (quantity < 10) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No products found</p>
        <p className="text-gray-400 text-sm">
          {isAdmin ? 'Add your first product to get started.' : 'Products will appear here once added.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="font-semibold">Product Name</TableHead>
            <TableHead className="font-semibold">Unit Price</TableHead>
            <TableHead className="font-semibold">Quantity</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            {isAdmin && <TableHead className="font-semibold">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id} 
              className="hover:bg-gray-50/50 transition-colors duration-150"
            >
              <TableCell className="font-medium">{product.nama_produk}</TableCell>
              <TableCell className="text-gray-700">{formatPrice(product.harga_satuan)}</TableCell>
              <TableCell className="text-gray-700">{product.quantity}</TableCell>
              <TableCell>{getStockBadge(product.quantity)}</TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-150"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors duration-150"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}