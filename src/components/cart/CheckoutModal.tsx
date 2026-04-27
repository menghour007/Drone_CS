import { useEffect, useState } from 'react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-6 max-w-xl rounded-xl bg-white p-4">
        <h2 className="mb-4 text-xl font-bold">Checkout</h2>

        <input
          placeholder="Name"
          value={checkout.customerName}
          onChange={(e) => checkout.setCustomerName(e.target.value)}
          className="mb-2 w-full rounded border p-2"
        />

        <input
          placeholder="Phone"
          value={checkout.customerPhone}
          onChange={(e) => checkout.setCustomerPhone(e.target.value)}
          className="mb-2 w-full rounded border p-2"
        />

        <textarea
          placeholder="Address"
          value={
            gettingLocation && !checkout.addressText
              ? 'Getting your current location...'
              : checkout.addressText
          }
          onChange={(e) => checkout.setAddressText(e.target.value)}
          className="mb-2 min-h-[90px] w-full rounded border p-2"
        />

        {locationError && (
          <div className="mb-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {locationError}
          </div>
        )}

        {checkout.selectedLat !== null && checkout.selectedLng !== null && (
          <div className="mb-3 rounded bg-slate-100 px-3 py-2 text-xs text-slate-600">
            Lat: {checkout.selectedLat.toFixed(6)}, Lng:{' '}
            {checkout.selectedLng.toFixed(6)}
          </div>
        )}

        <button
          type="button"
          onClick={getCurrentLocation}
          className="mb-2 w-full rounded bg-green-50 py-2 font-semibold text-green-600"
        >
          {gettingLocation ? 'Tracking location...' : 'Use Current Location'}
        </button>

        <button
          type="button"
          onClick={() => checkout.setIsMapOpen(true)}
          className="mb-3 w-full rounded bg-blue-50 py-2 font-semibold text-blue-600"
        >
          Change / Pick on Map
        </button>

        <button
          onClick={checkout.submitCheckoutForm}
          disabled={checkout.loadingCheckout}
          className="w-full rounded bg-black py-3 font-semibold text-white disabled:opacity-50"
        >
          {checkout.loadingCheckout ? 'Generating KHQR...' : 'Pay'}
        </button>
      </div>
    </div>
  );
}