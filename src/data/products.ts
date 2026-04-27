import {
  Drone,
  Camera,
  Gamepad2,
  Package,
} from 'lucide-react';

import type { Product } from '../lib/types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'DJI Air 3',
    price: 0.01,
    image:
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80',
    badge: 'NEW',
  },
  {
    id: '2',
    name: 'FPV Racing Drone',
    price: 28,
    image:
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    badge: 'HOT',
  },
  {
    id: '3',
    name: 'Drone Camera Kit',
    price: 42,
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    badge: 'SALE',
  },
  {
    id: '4',
    name: 'Battery Pack',
    price: 27,
    originalPrice: 30,
    image:
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=80',
    badge: '3D',
  },
];

export const categories = [
  { label: 'Drone', icon: Drone },
  { label: 'Camera', icon: Camera },
  { label: 'Virtual Reality', icon: Gamepad2 },
  { label: 'Accessories', icon: Package },
];