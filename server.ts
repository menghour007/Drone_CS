import multer from 'multer';
import session from 'express-session';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import { KHQR, CURRENCY, COUNTRY, TAG } from 'ts-khqr';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'transactions.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const PRODUCT_UPLOAD_DIR = path.join(UPLOAD_DIR, 'products');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PRODUCT_UPLOAD_DIR)) fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PRODUCT_UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }

    cb(null, true);
  },
});

const BAKONG_BASE_URL = (process.env.BAKONG_BASE_URL || 'https://api-bakong.nbc.gov.kh').trim();
const BAKONG_TOKEN = (process.env.BAKONG_TOKEN || '').trim();
const BAKONG_MERCHANT_ID = (process.env.BAKONG_MERCHANT_ID || 'lim_menghour@bkrt').trim();
const BAKONG_MERCHANT_NAME = (process.env.BAKONG_MERCHANT_NAME || 'MENGHOUR LIM').replace(/^"|"$/g, '').trim();
const BAKONG_MERCHANT_CITY = (process.env.BAKONG_MERCHANT_CITY || 'PHNOM PENH').replace(/^"|"$/g, '').trim();
const BAKONG_ACCOUNT_ID = (process.env.BAKONG_ACCOUNT_ID || BAKONG_MERCHANT_ID).trim();
const PAYMENT_TIMEOUT_SECONDS = Number(process.env.PAYMENT_TIMEOUT_SECONDS || 80);

const APP_ICON_URL = (process.env.APP_ICON_URL || 'https://bakong.nbc.gov.kh/images/logo.svg').trim();
const APP_NAME = (process.env.APP_NAME || 'CS Drone Store').trim();
const APP_DEEPLINK_CALLBACK = (process.env.APP_DEEPLINK_CALLBACK || 'https://bakong.nbc.gov.kh/').trim();

const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '').trim();

type TransactionStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED';

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description?: string;
  badge?: string;
  category?: string;
  stock?: number;
  active?: boolean;
};

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Transaction = {
  id: string;
  status: TransactionStatus;
  amount: string;
  currency: 'USD' | 'KHR';
  description: string;
  createdAt: string;
  md5: string;
  qrString: string;
  deepLink?: string;
  items: OrderItem[];
};

type CustomerPayload = {
  name?: string;
  phone?: string;
  province?: string;
  district?: string;
  addressNote?: string;
  telegramEnabled?: boolean;
  paymentMethod?: string;
  lat?: number | null;
  lng?: number | null;
};

const db = {
  read(): Transaction[] {
    if (!fs.existsSync(DB_FILE)) return [];

    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  write(data: Transaction[]) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  },
};

const productDb = {
  read(): Product[] {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      const seedProducts: Product[] = [
        {
          id: crypto.randomUUID(),
          name: 'DJI Air 3',
          price: 0.01,
          image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80'],
          badge: 'NEW',
          category: 'Drone',
          stock: 10,
          active: true,
        },
        {
          id: crypto.randomUUID(),
          name: 'FPV Racing Drone',
          price: 28,
          image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80'],
          badge: 'HOT',
          category: 'Drone',
          stock: 8,
          active: true,
        },
      ];

      this.write(seedProducts);
      return seedProducts;
    }

    try {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  write(data: Product[]) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  },
};

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function normalizeItems(items: any): OrderItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      name: typeof item?.name === 'string' ? item.name.trim() : '',
      price: Number(item?.price),
      quantity: Number(item?.quantity),
    }))
    .filter(
      (item) =>
        item.name &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );
}

async function generateBakongDeepLink(qrString: string): Promise<string | undefined> {
  if (!BAKONG_TOKEN) return undefined;

  try {
    const response = await axios.post(
      `${BAKONG_BASE_URL}/v1/generate_deeplink_by_qr`,
      {
        qr: qrString,
        sourceInfo: {
          appIconUrl: APP_ICON_URL,
          appName: APP_NAME,
          appDeepLinkCallback: APP_DEEPLINK_CALLBACK,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${BAKONG_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data?.responseCode === 0 && response.data?.data?.shortLink) {
      return response.data.data.shortLink;
    }

    return undefined;
  } catch (error: any) {
    console.error('[Bakong Deeplink ERROR]:', error?.response?.data || error?.message || error);
    return undefined;
  }
}

async function sendTelegramMessage(payment: Transaction, customer?: CustomerPayload) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return;
  }

  const productList =
    payment.items.length > 0
      ? payment.items
          .map(
            (item, index) =>
              `${index + 1}. ${item.name}\n   Qty: ${item.quantity} x $${item.price.toFixed(2)}`
          )
          .join('\n\n')
      : 'No items';

  const mapLink =
    customer?.lat != null && customer?.lng != null
      ? `https://maps.google.com/?q=${customer.lat},${customer.lng}`
      : '';

  const customerInfo = customer
    ? [
        '',
        'Customer:',
        `Name: ${customer.name || '-'}`,
        `Phone: ${customer.phone || '-'}`,
        `Address: ${customer.province || '-'}`,
        `Province: ${customer.district || '-'}`,
        `Note: ${customer.addressNote || '-'}`,
        `Telegram: ${customer.telegramEnabled ? 'Yes' : 'No'}`,
        `Payment: ${customer.paymentMethod || '-'}`,
        mapLink ? `Google Map: ${mapLink}` : 'Google Map: -',
      ].join('\n')
    : '';

  const text = [
    'CS Drone Store - New Order',
    '',
    'Products:',
    productList,
    customerInfo,
    '',
    `Total: ${payment.amount} ${payment.currency}`,
    `Payment ID: ${payment.id}`,
    `Order Ref: ${payment.description}`,
    `Time: ${new Date().toLocaleString()}`,
    '',
    'Payment successful',
  ].join('\n');

  await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text,
  });
}

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use('/uploads', express.static(UPLOAD_DIR));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      },
    })
  );

  app.post('/api/login', (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '').trim();

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      (req.session as any).user = { username };
      return res.json({ success: true, user: { username } });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  });

  app.get('/api/me', (req, res) => {
    const user = (req.session as any).user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({ user });
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/products', (req, res) => {
    const all = req.query.all === 'true';
    const products = productDb.read();

    if (all) return res.json(products);

    return res.json(products.filter((product) => product.active !== false));
  });

  app.post('/api/products', requireAuth, upload.array('images', 10), (req, res) => {
    const name = String(req.body?.name || '').trim();
    const price = Number(req.body?.price);
    const files = (req.files as Express.Multer.File[]) || [];
    const images = files.map((file) => `/uploads/products/${file.filename}`);

    if (!name) return res.status(400).json({ error: 'Product name is required' });
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    if (images.length === 0) {
      return res.status(400).json({ error: 'Please upload at least 1 image' });
    }

    const products = productDb.read();

    const product: Product = {
      id: crypto.randomUUID(),
      name,
      price,
      description: req.body?.description || '',
      originalPrice: req.body?.originalPrice ? Number(req.body.originalPrice) : undefined,
      image: images[0],
      images,
      badge: req.body?.badge || undefined,
      category: req.body?.category || undefined,
      stock: Number(req.body?.stock || 0),
      active: req.body?.active !== 'false',
    };

    products.push(product);
    productDb.write(products);

    return res.status(201).json(product);
  });

  app.put('/api/products/:id', requireAuth, upload.array('images', 10), (req, res) => {
    const { id } = req.params;
    const products = productDb.read();
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const name = String(req.body?.name || '').trim();
    const price = Number(req.body?.price);

    if (!name) return res.status(400).json({ error: 'Product name is required' });
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const uploadedImages = files.map((file) => `/uploads/products/${file.filename}`);

    const oldImages =
      products[index].images && products[index].images.length > 0
        ? products[index].images
        : [products[index].image].filter(Boolean);

    const finalImages = uploadedImages.length > 0 ? uploadedImages : oldImages;

    products[index] = {
      ...products[index],
      name,
      price,
      originalPrice: req.body?.originalPrice ? Number(req.body.originalPrice) : undefined,
      image: finalImages[0],
      images: finalImages,
      badge: req.body?.badge || undefined,
      category: req.body?.category || undefined,
      stock: Number(req.body?.stock || 0),
      description: req.body?.description || undefined,
      active: req.body?.active !== 'false',
    };

    productDb.write(products);

    return res.json(products[index]);
  });

  app.delete('/api/products/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const products = productDb.read();
    const nextProducts = products.filter((product) => product.id !== id);

    if (nextProducts.length === products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    productDb.write(nextProducts);

    return res.json({ success: true });
  });

  app.get('/api/transactions', (_req, res) => {
    const transactions = db.read().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json(transactions);
  });

  app.get('/api/reverse-geocode', async (req, res) => {
    try {
      const lat = String(req.query.lat || '');
      const lng = String(req.query.lng || '');

      if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat/lng' });
      }

      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          format: 'jsonv2',
          lat,
          lon: lng,
        },
        headers: {
          'User-Agent': 'cs-drone-store/1.0',
        },
        timeout: 10000,
      });

      return res.json({
        address: response.data?.display_name || '',
        raw: response.data,
      });
    } catch (error: any) {
      console.error('[Reverse Geocode ERROR]:', error?.message || error);
      return res.status(500).json({ error: 'Failed to reverse geocode' });
    }
  });

  app.post('/api/generate-khqr', async (req, res) => {
    try {
      const rawAmount = Number(req.body?.amount);
      const currencyType: 'USD' | 'KHR' = req.body?.currency === 'KHR' ? 'KHR' : 'USD';

      const description =
        typeof req.body?.description === 'string' && req.body.description.trim()
          ? req.body.description.trim()
          : 'Payment';

      const items = normalizeItems(req.body?.items);

      if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const result = KHQR.generate({
        tag: TAG.INDIVIDUAL,
        accountID: BAKONG_ACCOUNT_ID,
        merchantName: BAKONG_MERCHANT_NAME,
        merchantCity: BAKONG_MERCHANT_CITY || 'PHNOM PENH',
        currency: currencyType === 'KHR' ? CURRENCY.KHR : CURRENCY.USD,
        amount: currencyType === 'USD' ? Number(rawAmount.toFixed(2)) : Math.round(rawAmount),
        countryCode: COUNTRY.KH,
        merchantCategoryCode: '5999',
        expirationTimestamp: Date.now() + PAYMENT_TIMEOUT_SECONDS * 1000,
        additionalData: {
          billNumber: description,
          purposeOfTransaction: 'Payment',
        },
      });

      if (!result?.data?.qr || !result?.data?.md5) {
        return res.status(500).json({ error: 'Failed to generate valid KHQR payload' });
      }

      const qrString = result.data.qr;
      const md5 = result.data.md5;
      const paymentId = crypto.randomUUID();
      const deepLink = await generateBakongDeepLink(qrString);

      const transactions = db.read();

      transactions.push({
        id: paymentId,
        status: 'PENDING',
        amount: currencyType === 'USD' ? rawAmount.toFixed(2) : Math.round(rawAmount).toString(),
        currency: currencyType,
        description,
        createdAt: new Date().toISOString(),
        md5,
        qrString,
        deepLink,
        items,
      });

      db.write(transactions);

      return res.json({ qrString, paymentId, deepLink });
    } catch (error) {
      console.error('[API] Error generating KHQR:', error);
      return res.status(500).json({ error: 'Failed to generate KHQR' });
    }
  });

  app.post('/api/notify-telegram', async (req, res) => {
    try {
      const { paymentId, customer } = req.body;
      const transactions = db.read();
      const payment = transactions.find((transaction) => transaction.id === paymentId);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      await sendTelegramMessage(payment, customer);

      return res.json({ success: true });
    } catch (error: any) {
      console.error('[Telegram] Error:', error?.response?.data || error?.message || error);
      return res.status(500).json({ error: 'Failed to send telegram' });
    }
  });

  app.get('/api/check-status/:paymentId', async (req, res) => {
    try {
      const { paymentId } = req.params;
      const transactions = db.read();
      const payment = transactions.find((transaction) => transaction.id === paymentId);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status === 'COMPLETED') {
        return res.json({ status: 'COMPLETED' });
      }

      const elapsedSeconds = (Date.now() - new Date(payment.createdAt).getTime()) / 1000;

      if (elapsedSeconds > PAYMENT_TIMEOUT_SECONDS && payment.status === 'PENDING') {
        payment.status = 'EXPIRED';
        db.write(transactions);
        return res.json({ status: 'EXPIRED' });
      }

      if (!BAKONG_TOKEN) {
        return res.json({ status: payment.status });
      }

      try {
        const response = await axios.post(
          `${BAKONG_BASE_URL}/v1/check_transaction_by_md5`,
          { md5: payment.md5 },
          {
            headers: {
              Authorization: `Bearer ${BAKONG_TOKEN}`,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        );

        const data = response.data;

        if (data?.responseCode === 0 && data?.data) {
          payment.status = 'COMPLETED';
          db.write(transactions);
          return res.json({ status: 'COMPLETED' });
        }
      } catch (error: any) {
        console.error('[Bakong API] Error:', error?.response?.data || error?.message || error);
      }

      return res.json({ status: payment.status });
    } catch (error) {
      console.error('[API] Error checking status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Bakong account: ${BAKONG_ACCOUNT_ID}`);
    console.log(`Timeout: ${PAYMENT_TIMEOUT_SECONDS}s`);
    console.log(
      TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID
        ? 'Telegram notifications: enabled'
        : 'Telegram notifications: disabled'
    );
    console.log(
      BAKONG_TOKEN
        ? 'Bakong status/deeplink: enabled'
        : 'Bakong status/deeplink: disabled (missing BAKONG_TOKEN)'
    );
  });
}

startServer();