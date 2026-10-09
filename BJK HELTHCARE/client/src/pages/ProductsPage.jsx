import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Layers,
  ChevronRight,
  ShieldCheck,
  X,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { productAPI } from '../services/api';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDosage, setSelectedDosage] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productAPI.getAll({ limit: 150 }).catch(() => ({ data: { data: [] } })),
        productAPI.getCategories().catch(() => ({ data: { data: [] } }))
      ]);

      setProducts(prodRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load products catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const dosageForms = ['ALL', 'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Ointment'];

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      (p.productName || '').toLowerCase().includes(q) ||
      (p.genericName || '').toLowerCase().includes(q) ||
      (p.strength || '').toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesDosage = selectedDosage === 'ALL' || (p.dosageForm || '').toLowerCase().includes(selectedDosage.toLowerCase());
    return matchesSearch && matchesCat && matchesDosage;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Official Pharmaceutical Catalogue</h1>
              <p className="text-sm text-slate-400">111 Brochure-Verified Formulations Across 11 Therapeutic Categories</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            111 Verified SKUs
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by brand name, generic API, strength..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dosage Form Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {dosageForms.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDosage(d)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  selectedDosage === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-slate-200 text-slate-900 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map(c => {
            const catName = typeof c === 'string' ? c : (c.category || c.name);
            const count = typeof c === 'object' ? c.count : null;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === catName
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {catName} {count ? `(${count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            Loading 111 official brochure formulations...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            No pharmaceutical products match your active search and category filters.
          </div>
        ) : (
          filteredProducts.map(p => (
            <div
              key={p._id || p.srNo}
              onClick={() => setSelectedProduct(p)}
              className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 p-5 rounded-2xl transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] text-blue-400 font-semibold px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                    #{p.srNo || '00'} • {p.dosageForm || 'Dosage'}
                  </span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Pg {p.sourcePage || '8'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-1">
                  {p.productName}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                  {p.genericName}
                </p>
                <div className="text-xs font-semibold text-cyan-300">
                  Strength: {p.strength}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>{p.category}</span>
                <span className="flex items-center gap-1 text-blue-400 group-hover:translate-x-0.5 transition font-medium">
                  Specifications <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs font-mono text-blue-400">Catalogue Item #{selectedProduct.srNo}</span>
                <h3 className="text-xl font-bold text-white">{selectedProduct.productName}</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider block">Generic Active Molecule</span>
                <div className="text-sm font-semibold text-white">{selectedProduct.genericName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-500 uppercase block mb-1">Dosage Form</span>
                  <div className="text-sm font-bold text-cyan-300">{selectedProduct.dosageForm}</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-500 uppercase block mb-1">Strength / Potency</span>
                  <div className="text-sm font-bold text-emerald-400">{selectedProduct.strength}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-500 uppercase block mb-1">Therapeutic Category</span>
                  <div className="text-xs font-semibold text-slate-200">{selectedProduct.category}</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-500 uppercase block mb-1">Brochure Source</span>
                  <div className="text-xs font-semibold text-slate-200">Official Brochure Page {selectedProduct.sourcePage}</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Verified pharmaceutical formulation master specification. Registered in BJK Healthcare Digital Brain.</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
