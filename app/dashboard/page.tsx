'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, LogOut, User, Shield, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ProductTable from '@/components/ProductTable';
import ProductDialog from '@/components/ProductDialog';

type Product = {
  id: string;
  nama_produk: string;
  harga_satuan: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch products');
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Signed out successfully');
    router.push('/signin');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', error);
      } else {
        toast.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (err) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          toast.error('Failed to update product');
          console.error('Error updating product:', error);
        } else {
          toast.success('Product updated successfully');
          fetchProducts();
          setDialogOpen(false);
          setEditingProduct(null);
        }
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          toast.error('Failed to create product');
          console.error('Error creating product:', error);
        } else {
          toast.success('Product created successfully');
          fetchProducts();
          setDialogOpen(false);
        }
      }
    } catch (err) {
      toast.error('Failed to save product');
      console.error('Error saving product:', err);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.role === 'admin' ? (
                  <Shield className="h-4 w-4 text-purple-600" />
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 backdrop-blur-sm bg-white/70 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome, {user.username}! 👋
            </CardTitle>
            <CardDescription>
              {user.role === 'admin' 
                ? 'You have full access to manage products and users.' 
                : 'You can view product information and availability.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Stock</p>
                    <p className="text-2xl font-bold">
                      {products.reduce((sum, product) => sum + product.quantity, 0)}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Your Role</p>
                    <p className="text-2xl font-bold capitalize">{user.role}</p>
                  </div>
                  {user.role === 'admin' ? (
                    <Shield className="h-8 w-8 text-purple-200" />
                  ) : (
                    <User className="h-8 w-8 text-purple-200" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card className="backdrop-blur-sm bg-white/70 shadow-lg border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Product Management</CardTitle>
                <CardDescription>
                  {user.role === 'admin' 
                    ? 'Manage your product inventory with full CRUD operations.'
                    : 'View available products and their stock levels.'}
                </CardDescription>
              </div>
              {user.role === 'admin' && (
                <Button 
                  onClick={handleAddProduct}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ProductTable
              products={products}
              isAdmin={user.role === 'admin'}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </main>

      {/* Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}