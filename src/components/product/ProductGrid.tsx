import { PRODUCTS } from '../../data/products';
import ProductCard from './ProductCard';

export default function ProductGrid({ cart }: { cart: any }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {PRODUCTS.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          cartItem={cart.getCartItem(product.id)}
          onAdd={() => cart.addToCart(product)}
          onIncrease={() => cart.increaseQty(product.id)}
          onDecrease={() => cart.decreaseQty(product.id)}
          onRemove={() => cart.removeItem(product.id)}
        />
      ))}
    </div>
  );
}