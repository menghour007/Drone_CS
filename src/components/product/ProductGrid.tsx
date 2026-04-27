import { useState } from 'react';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import type { Product } from '../../lib/types';

type Props = {
  cart: any;
  products: Product[];
  loading?: boolean;
  error?: string;
  onCheckout: () => void;
};

export default function ProductGrid({
  cart,
  products,
  loading,
  error,
  onCheckout,
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 text-slate-500">
        Loading products...
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl bg-red-50 p-6 text-red-600">{error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 text-slate-500">
        No products found.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cartItem={cart.getCartItem(product.id)}
            onOpen={() => setSelectedProduct(product)}
            onAdd={() => cart.addToCart(product)}
            onIncrease={() => cart.increaseQty(product.id)}
            onDecrease={() => cart.decreaseQty(product.id)}
            onRemove={() => cart.removeItem(product.id)}
          />
        ))}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        cartItem={selectedProduct ? cart.getCartItem(selectedProduct.id) : undefined}
        onClose={() => setSelectedProduct(null)}
        onAdd={() => selectedProduct && cart.addToCart(selectedProduct)}
        onIncrease={() => selectedProduct && cart.increaseQty(selectedProduct.id)}
        onDecrease={() => selectedProduct && cart.decreaseQty(selectedProduct.id)}
        onCheckout={onCheckout}
      />
    </>
  );
}