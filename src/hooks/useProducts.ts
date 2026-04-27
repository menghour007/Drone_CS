import { useEffect, useState } from 'react';
import type { Product } from '../lib/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');

  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      setProductError('');

      const res = await fetch('/api/products');
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to load products');

      setProducts(data);
    } catch (error: any) {
      setProductError(error?.message || 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loadingProducts,
    productError,
    fetchProducts,
  };
}