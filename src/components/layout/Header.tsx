import { Menu, ShoppingBag } from 'lucide-react';
import { categories } from '../../data/products';

export default function Header({ cartCount }: { cartCount: number }) {
  return (
    <header className="sticky top-0 z-20 bg-[#f6f7fb]/95 pb-3 backdrop-blur">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:gap-4 lg:px-6">
          <div className="flex items-center justify-between gap-3 lg:min-w-[180px]">
            <div className="text-3xl font-black tracking-tight text-slate-800">
              CS_Drone<span className="text-blue-600">.</span>
            </div>

            <button className="rounded-xl border border-slate-200 p-2 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden lg:ml-auto lg:flex lg:items-center lg:gap-6">
            <div className="text-sm">
              <div className="text-slate-400">Country/Region</div>
              <div className="font-semibold text-slate-800">
                Cambodia USD $
              </div>
            </div>

            <div className="text-sm">
              <div className="text-slate-400">Welcome</div>
              <div className="font-semibold text-slate-800">
                Sign in / Register
              </div>
            </div>

            <button className="relative flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShoppingBag className="h-5 w-5" />
              Cart

              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                  {String(cartCount).padStart(2, '0')}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-4 py-3 lg:px-6">
            <div className="flex min-w-max items-center gap-5 text-sm text-slate-700">
              {categories.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className="flex items-center gap-2 whitespace-nowrap font-medium hover:text-blue-600"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}