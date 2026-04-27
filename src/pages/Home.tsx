import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProductGrid from '../components/product/ProductGrid';
import CartBar from '../components/cart/CartBar';
import CheckoutModal from '../components/cart/CheckoutModal';
import PaymentModal from '../components/payment/PaymentModal';
import PaymentSuccessModal from '../components/payment/PaymentSuccessModal';
import MapPickerModal from '../components/map/MapPickerModal';

import { useCart } from '../hooks/useCart';
import { useCheckout } from '../hooks/useCheckout';

export default function Home() {
  const cart = useCart();
  const checkout = useCheckout({
    cartItems: cart.cartItems,
    grandTotal: cart.grandTotal,
    clearCart: cart.clearCart,
  });

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="mx-auto w-full max-w-screen-2xl px-3 pb-2 pt-3 sm:px-4 md:px-6 lg:px-8">
        <Header cartCount={cart.cartCount} />

        <section className="mx-auto mb-6 max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 shadow-sm">
          <div className="grid min-h-[420px] items-center gap-8 px-5 py-10 md:px-8 lg:grid-cols-2 lg:px-10 lg:py-14">
            <div>
              <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                Drone Collection
              </div>

              <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-800 sm:text-6xl lg:text-7xl">
                Zypher X1
              </h1>

              <p className="mt-4 max-w-xl text-xl leading-relaxed text-slate-600 sm:text-2xl">
                Leading the way in aerial photography and performance.
              </p>

              <div className="mt-7 flex flex-wrap gap-5 text-sm font-medium text-slate-600 sm:text-base">
                <div>✦ 4K UHD Camera</div>
                <div>✦ Extended Flight Time</div>
                <div>✦ Advanced Navigation</div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute bottom-6 h-12 w-3/4 rounded-full bg-slate-400/20 blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80"
                alt="Drone hero"
                className="relative z-10 w-full max-w-xl rounded-[28px] object-cover shadow-[0_30px_60px_rgba(15,23,42,0.16)]"
              />
            </div>
          </div>
        </section>

        <main className="mx-auto w-full max-w-7xl">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-slate-800">
              Featured Products
            </h2>
            <p className="text-sm text-slate-500">
              Top drone gear for creators and pilots
            </p>
          </div>

          <ProductGrid cart={cart} />
        </main>

        <Footer />

        <CartBar
          cartCount={cart.cartCount}
          grandTotal={cart.grandTotal}
          onCheckout={() => checkout.setIsCheckoutFormOpen(true)}
        />

        <CheckoutModal cart={cart} checkout={checkout} />

        <MapPickerModal checkout={checkout} />

        <PaymentModal
          cart={cart}
          checkout={checkout}
        />

        <PaymentSuccessModal checkout={checkout} cart={cart} />
      </div>
    </div>
  );
}