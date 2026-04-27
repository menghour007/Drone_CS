import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Boxes,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  PackagePlus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { Product } from '../lib/types';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  badge: '',
  category: '',
  stock: '',
};

export default function Dashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setAuthorized(true))
      .catch(() => {
        window.location.href = '/login';
      })
      .finally(() => setChecking(false));
  }, []);

  async function loadProducts() {
    try {
      setLoadingProducts(true);

      const res = await fetch('/api/products?all=true', {
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load products');
      }

      setProducts(data);
    } catch (error: any) {
      alert(error?.message || 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return products;

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.badge?.toLowerCase().includes(q)
      );
    });
  }, [products, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active !== false).length;
    const hidden = total - active;
    const stock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);

    return { total, active, hidden, stock };
  }, [products]);

  function updateForm(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImages(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files);

    if (selected.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    const invalid = selected.find((file) => !file.type.startsWith('image/'));

    if (invalid) {
      alert('Only image files are allowed');
      return;
    }

    setImageFiles(selected);
    setImagePreviews(selected.map((file) => URL.createObjectURL(file)));
  }

  function resetForm() {
    setForm(emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
    setMessage('');
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setMessage('');
    setImageFiles([]);

    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      badge: product.badge || '',
      category: product.category || '',
      stock: product.stock ? String(product.stock) : '',
    });

    setImagePreviews(product.images?.length ? product.images : [product.image]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) return alert('Product name required');
    if (!form.price || Number(form.price) <= 0) return alert('Price required');

    if (!editingId && imageFiles.length === 0) {
      return alert('Please upload at least 1 image');
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('price', String(Number(form.price)));

      if (form.originalPrice) {
        formData.append('originalPrice', String(Number(form.originalPrice)));
      }

      formData.append('badge', form.badge.trim());
      formData.append('category', form.category.trim());
      formData.append('stock', String(Number(form.stock || 0)));
      formData.append('active', 'true');

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await fetch(
        editingId ? `/api/products/${editingId}` : '/api/products',
        {
          method: editingId ? 'PUT' : 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Save failed');
      }

      setMessage(editingId ? 'Product updated successfully.' : 'Product created successfully.');
      resetForm();
      await loadProducts();
    } catch (err: any) {
      alert(err?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Delete failed');
      }

      await loadProducts();
    } catch (error: any) {
      alert(error?.message || 'Delete failed');
    }
  }

  async function toggleActive(product: Product) {
    try {
      const formData = new FormData();

      formData.append('name', product.name);
      formData.append('description', product.description || '');
      formData.append('price', String(product.price));

      if (product.originalPrice) {
        formData.append('originalPrice', String(product.originalPrice));
      }

      formData.append('badge', product.badge || '');
      formData.append('category', product.category || '');
      formData.append('stock', String(product.stock || 0));
      formData.append('active', product.active === false ? 'true' : 'false');

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Update failed');
      }

      await loadProducts();
    } catch (error: any) {
      alert(error?.message || 'Update failed');
    }
  }

  async function logout() {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    window.location.href = '/login';
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="rounded-3xl bg-white px-6 py-5 font-bold text-slate-700 shadow-sm">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] bg-slate-950 px-5 py-5 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
              <Boxes className="h-4 w-4" />
              Admin Control Panel
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              Product Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Manage products, stock, descriptions, visibility, and images.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Store
            </a>

            <button
              onClick={logout}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-sm font-bold text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Products" value={stats.total} />
          <StatCard label="Active Products" value={stats.active} />
          <StatCard label="Hidden Products" value={stats.hidden} />
          <StatCard label="Total Stock" value={stats.stock} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="h-fit rounded-[28px] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">
                  {editingId ? 'Edit Product' : 'Add Product'}
                </h2>
                <p className="text-sm text-slate-500">
                  Upload 1-10 images directly from your device.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <PackagePlus className="h-6 w-6 text-slate-700" />
              </div>
            </div>

            {message && (
              <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {message}
              </div>
            )}

            <form onSubmit={saveProduct} className="space-y-3">
              <Field label="Product Name">
                <input
                  placeholder="DJI Air 3"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Description">
                <textarea
                  placeholder="Write product details, features, battery life, warranty..."
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="min-h-[110px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Price">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => updateForm('price', e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Original Price">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={form.originalPrice}
                    onChange={(e) => updateForm('originalPrice', e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Category">
                  <input
                    placeholder="Drone"
                    value={form.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Badge">
                  <input
                    placeholder="NEW / HOT / SALE"
                    value={form.badge}
                    onChange={(e) => updateForm('badge', e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Stock">
                <input
                  type="number"
                  placeholder="10"
                  value={form.stock}
                  onChange={(e) => updateForm('stock', e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Product Images">
                <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-slate-900">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImages(e.target.files)}
                    className="hidden"
                  />

                  <div className="text-sm font-black text-slate-700">
                    Click to upload images
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Maximum 10 images, 5MB each
                  </div>
                </label>
              </Field>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />

                      {index === 0 && (
                        <div className="absolute left-1 top-1 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-black text-white">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  disabled={loading}
                  className="h-12 flex-1 rounded-2xl bg-slate-950 font-black text-white disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 font-black text-slate-700"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">Products</h2>
                <p className="text-sm text-slate-500">
                  {filteredProducts.length} product(s) found.
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {loadingProducts ? (
              <div className="rounded-3xl bg-slate-50 p-8 text-center font-bold text-slate-500">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-8 text-center font-bold text-slate-500">
                No products found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm md:grid-cols-[88px_1fr_auto]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-full rounded-2xl object-cover md:h-22 md:w-22"
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-black text-slate-900">
                          {product.name}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ${
                            product.active === false
                              ? 'bg-red-50 text-red-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {product.active === false ? 'Hidden' : 'Active'}
                        </span>

                        {product.badge && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-2 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
                        <div>
                          <span className="font-bold text-slate-700">Price:</span>{' '}
                          ${product.price.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Category:</span>{' '}
                          {product.category || '-'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Stock:</span>{' '}
                          {product.stock ?? 0}
                        </div>
                      </div>

                      {product.images && product.images.length > 1 && (
                        <div className="mt-2 text-xs font-bold text-slate-400">
                          {product.images.length} images
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <button
                        onClick={() => editProduct(product)}
                        className="inline-flex h-10 items-center gap-2 rounded-2xl bg-blue-50 px-4 text-sm font-black text-blue-700"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => toggleActive(product)}
                        className="inline-flex h-10 items-center gap-2 rounded-2xl bg-amber-50 px-4 text-sm font-black text-amber-700"
                      >
                        {product.active === false ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        {product.active === false ? 'Show' : 'Hide'}
                      </button>

                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="inline-flex h-10 items-center gap-2 rounded-2xl bg-red-50 px-4 text-sm font-black text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm">
      <div className="text-sm font-bold text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-950">{value}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-black text-slate-700">{label}</div>
      {children}
    </label>
  );
}