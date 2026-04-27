import { useState } from 'react';
import { Minus, Plus, ShoppingBag, X, CreditCard } from 'lucide-react';
import type { CartItem, Product } from '../../lib/types';

type Props = {
  product: Product | null;
  cartItem?: CartItem;
  onClose: () => void;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onCheckout: () => void;
};

export default function ProductDetailModal({
  product,
  cartItem,
  onClose,
  onAdd,
  onIncrease,
  onDecrease,
  onCheckout,
}: Props) {
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return null;

  const images = product.images?.length ? product.images : [product.image];
  const qty = cartItem?.quantity || 0;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 p-3 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-6xl rounded-[30px] bg-white p-4 shadow-2xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Product Details</h2>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="grid gap-3 md:grid-cols-[110px_1fr]">
            <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 md:h-28 md:w-28 ${
                    activeImage === index
                      ? 'border-slate-900'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="order-1 overflow-hidden rounded-[26px] bg-slate-100 md:order-2">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="h-[360px] w-full object-cover sm:h-[520px]"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Details</h3>

              <h4 className="mt-5 text-lg font-bold leading-snug text-slate-900">
                {product.name}
              </h4>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-3xl font-black text-orange-500">
                  ${product.price.toFixed(2)}
                </span>

                {product.originalPrice && (
                  <span className="text-lg font-bold text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div>
                  <span className="font-black text-slate-900">Category : </span>
                  <span className="text-slate-600">
                    {product.category || '-'}
                  </span>
                </div>

                <div>
                  <span className="font-black text-slate-900">Stock : </span>
                  <span className="text-slate-600">{product.stock ?? 0}</span>
                </div>

                {product.badge && (
                  <div>
                    <span className="font-black text-slate-900">Badge : </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h4 className="text-xl font-black text-slate-900">
                  Description
                </h4>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {product.description || 'No description available.'}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-50 p-4">
              {qty > 0 ? (
                <div className="mb-3 flex items-center gap-2">
                  <button
                    onClick={onDecrease}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <div className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white font-black">
                    {qty}
                  </div>

                  <button
                    onClick={onIncrease}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAdd}
                  className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 font-black text-white"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Add to Cart
                </button>
              )}

              <button
                onClick={() => {
                  if (qty === 0) onAdd();
                  onCheckout();
                  onClose();
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 font-black text-white"
              >
                <CreditCard className="h-5 w-5" />
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}