import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { CartItem, Product } from '../../lib/types';

type Props = {
  product: Product;
  cartItem?: CartItem;
  onOpen: () => void;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export default function ProductCard({
  product,
  cartItem,
  onOpen,
  onAdd,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const qty = cartItem?.quantity || 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-[1.05] w-full overflow-hidden bg-slate-100 text-left"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />

        {product.badge && (
          <div className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm">
            {product.badge}
          </div>
        )}
      </button>

      <div className="space-y-3 p-3 md:p-4">
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <div className="text-[16px] font-extrabold leading-none text-slate-800 sm:text-[18px]">
            ${product.price}

            {product.originalPrice && (
              <span className="ml-2 text-[12px] font-bold text-red-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="mt-2 line-clamp-2 text-[15px] font-bold leading-5 text-slate-600 sm:text-[16px]">
            {product.name}
          </div>

          {product.description && (
            <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
              {product.description}
            </div>
          )}
        </button>

        {qty > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onDecrease}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700">
                {qty}
              </div>

              <button
                onClick={onIncrease}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button onClick={onRemove} className="text-sm text-red-500">
              លុបចេញ
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ShoppingBag className="h-4 w-4" />
            បញ្ចូលកន្ត្រក
          </button>
        )}
      </div>
    </div>
  );
}