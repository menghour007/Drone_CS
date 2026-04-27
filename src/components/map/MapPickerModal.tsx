import { useEffect } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { X } from 'lucide-react';

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}

function AutoLocateUser({ checkout }: any) {
  const map = useMap();

  useEffect(() => {
    if (checkout.selectedLat !== null && checkout.selectedLng !== null) return;

    if (!navigator.geolocation) {
      console.log('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        checkout.setSelectedLat(lat);
        checkout.setSelectedLng(lng);
        checkout.reverseGeocode(lat, lng);

        map.setView([lat, lng], 16);
      },
      (error) => {
        console.log('Location permission denied or failed:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [checkout, map]);

  return null;
}

function LocationPicker({ checkout }: any) {
  useMapEvents({
    click(e) {
      checkout.setSelectedLat(e.latlng.lat);
      checkout.setSelectedLng(e.latlng.lng);
      checkout.reverseGeocode(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function MapPickerModal({ checkout }: any) {
  if (!checkout.isMapOpen) return null;

  const hasLocation =
    checkout.selectedLat !== null && checkout.selectedLng !== null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 p-4 backdrop-blur-sm">
      <div className="mx-auto flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-bold text-slate-900">
            ជ្រើសទីតាំងលើផែនទី
          </h3>

          <button
            type="button"
            onClick={() => checkout.setIsMapOpen(false)}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <MapContainer
            center={[11.5564, 104.9282]}
            zoom={13}
            className="h-full w-full"
          >
            <ResizeMap />
            <AutoLocateUser checkout={checkout} />

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationPicker checkout={checkout} />

            {hasLocation && (
              <Marker position={[checkout.selectedLat, checkout.selectedLng]} />
            )}
          </MapContainer>
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={() => checkout.setIsMapOpen(false)}
            className="h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white"
          >
            រក្សាទុកទីតាំង
          </button>
        </div>
      </div>
    </div>
  );
}