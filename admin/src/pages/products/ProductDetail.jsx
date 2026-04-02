import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, Edit2, Check, Box, ChevronLeft, ChevronRight } from 'lucide-react';
import productService from '@/api/product.service';
import { formatINR, formatUSD } from '@/utils/formatters';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      const data = res.data?.data || res.data;
      setProduct(data);
      document.title = `${data?.name || 'Product Details'} — Admin`;
    } catch (err) {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400 text-lg">Product not found</p>
        <Link to="/admin/products" className="text-primary-500 hover:underline text-sm mt-2 inline-block">
          Return to products list
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images.map(img => typeof img === 'string' ? img : img.image_url)
    : [product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'];

  return (
    <motion.div {...pageTransition}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50 mb-1 leading-none">
              {product.name}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              SKU: {product.sku}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowEdit(true)} className="gap-2">
          <Edit2 className="w-4 h-4" /> Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/50 text-neutral-800 dark:text-neutral-200 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/50 text-neutral-800 dark:text-neutral-200 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === i
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Status</p>
              <Badge variant={product.is_active ? 'success' : 'error'}>
                {product.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Stock</p>
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-neutral-400" />
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.stock || 0}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Price (INR)</p>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">{formatINR(product.price_inr)}</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">Price (USD)</p>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">{formatUSD(product.price_usd)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Product Attributes</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">Category</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{product.category || '—'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">Brand</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{product.brand || '—'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">HSN Code</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{product.hsn_code || '—'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">GST Percentage</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{product.gst_percentage ? `${product.gst_percentage}%` : '—'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">Weight</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{product.weight ? `${product.weight}g` : '—'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 mb-1">Best Seller</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{product.is_best ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
             <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Description</h3>
            </div>
            <div className="p-6 prose prose-sm dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400"
              dangerouslySetInnerHTML={{ __html: product.description || '<p>No description provided.</p>' }}
            />
          </div>
        </div>
      </div>

      {showEdit && (
        <ProductForm
          product={product}
          onClose={(refresh) => {
            setShowEdit(false);
            if (refresh) fetchProduct();
          }}
        />
      )}
    </motion.div>
  );
}
