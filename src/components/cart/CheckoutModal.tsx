import { useEffect, useState } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';

const CAMBODIA_PROVINCES = [
  'Banteay Meanchey',
  'Battambang',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Kratie',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Phnom Penh',
  'Preah Sihanouk',
  'Preah Vihear',
  'Prey Veng',
  'Pursat',
  'Ratanakiri',
  'Siem Reap',
  'Stung Treng',
  'Svay Rieng',
  'Takeo',
  'Tboung Khmum',
];

export default function CheckoutModal({ checkout }: any) {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  async function getCurrentLocation() {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Location is not supported on this browser.');
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        checkout.setSelectedLat(lat);
        checkout.setSelectedLng(lng);

        await checkout.reverseGeocode(lat, lng);

        setGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Cannot get location. Please allow location or pick on map.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  useEffect(() => {
    if (!checkout.isCheckoutFormOpen) return;
    if (checkout.addressText) return;

    getCurrentLocation();
  }, [checkout.isCheckoutFormOpen]);

  if (!checkout.isCheckoutFormOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Checkout</h2>
            <p className="text-sm text-slate-500">បំពេញព័ត៌មានដឹកជញ្ជូន</p>
          </div>

          <button
            type="button"
            onClick={checkout.closeCheckoutForm}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              placeholder="Customer name"
              value={checkout.customerName}
              onChange={(e) => checkout.setCustomerName(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Phone
            </label>
            <input
              placeholder="012345678"
              value={checkout.customerPhone}
              onChange={(e) => checkout.setCustomerPhone(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Province
            </label>

            <select
              value={checkout.district}
              onChange={(e) => checkout.setDistrict(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="">Select province</option>

              {CAMBODIA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Address
            </label>
            <textarea
              placeholder="Delivery address"
              value={
                gettingLocation && !checkout.addressText
                  ? 'Getting your current location...'
                  : checkout.addressText
              }
              onChange={(e) => checkout.setAddressText(e.target.value)}
              className="min-h-[95px] w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {locationError && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {locationError}
            </div>
          )}

          {checkout.selectedLat !== null && checkout.selectedLng !== null && (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>
                Lat: {checkout.selectedLat.toFixed(6)}, Lng:{' '}
                {checkout.selectedLng.toFixed(6)}
              </span>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-green-50 text-sm font-bold text-green-700 disabled:opacity-60"
            >
              <Navigation className="h-4 w-4" />
              {gettingLocation ? 'Tracking...' : 'Use Location'}
            </button>

            <button
              type="button"
              onClick={() => checkout.setIsMapOpen(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-50 text-sm font-bold text-blue-700"
            >
              <MapPin className="h-4 w-4" />
              Pick on Map
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Note / Landmark
            </label>
            <input
              placeholder="Near market, house color, floor..."
              value={checkout.addressNote}
              onChange={(e) => checkout.setAddressNote(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Payment Method
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => checkout.setPaymentMethod('ABA_KHQR')}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${checkout.paymentMethod === 'ABA_KHQR'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                  }`}
              >
                ABA KHQR
              </button>

              <button
                type="button"
                onClick={() => checkout.setPaymentMethod('BAKONG_KHQR')}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${checkout.paymentMethod === 'BAKONG_KHQR'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                  }`}
              >
                Bakong KHQR
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={checkout.telegramEnabled}
              onChange={(e) => checkout.setTelegramEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            Send order notification to Telegram
          </label>

          {checkout.checkoutError && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {checkout.checkoutError}
            </div>
          )}

          <button
            onClick={checkout.submitCheckoutForm}
            disabled={checkout.loadingCheckout}
            className="h-12 w-full rounded-2xl bg-slate-900 font-bold text-white disabled:opacity-50"
          >
            {checkout.loadingCheckout ? 'Generating KHQR...' : 'Pay Now'}
          </button>

          <button
            type="button"
            onClick={checkout.closeCheckoutForm}
            className="h-12 w-full rounded-2xl bg-slate-100 font-bold text-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}