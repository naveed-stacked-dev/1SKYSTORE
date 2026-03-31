import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import productService from '@/api/product.service';
import { useCart } from '@/context/CartContext';
import { useGeo } from '@/context/GeoContext';
import ProductGrid from '@/components/ecommerce/ProductGrid';
import RatingStars from '@/components/ecommerce/RatingStars';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { pageTransition } from '@/animations/variants';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { getPrice, currency } = useGeo();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  async function loadProduct() {
    try {
      setLoading(true);
      const res = await productService.getProductBySlug(slug);
      const data = res.data?.data || res.data;
      setProduct(data);
      document.title = `${data?.name || 'Product'} — 1SkyStore`;

      // Load related products
      if (data?.category) {
        try {
          const relRes = await productService.getProducts({ category: data.category, pageSize: 4 });
          const relData = relRes.data?.data || relRes.data;
          const relProducts = relData?.products || relData?.rows || relData || [];
          setRelated(relProducts.filter((p) => p.id !== data.id).slice(0, 4));
        } catch {}
      }
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAdding(true);
      await addToCart(product, quantity);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton variant="card" className="h-[500px]" />
          <div className="space-y-4">
            <Skeleton variant="line" className="w-1/3" />
            <Skeleton variant="title" className="h-8" />
            <Skeleton variant="text" className="w-1/4" />
            <Skeleton variant="text" className="w-full h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Product not found</p>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'];

  const tabs = [
    {
      id: 'description',
      label: 'Description',
      content: (
        <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
        />
      ),
    },
    {
      id: 'details',
      label: 'Details',
      content: (
        <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
          {product.sku && <p><span className="font-medium text-neutral-800 dark:text-neutral-200">SKU:</span> {product.sku}</p>}
          {product.brand && <p><span className="font-medium text-neutral-800 dark:text-neutral-200">Brand:</span> {product.brand}</p>}
          {product.category && <p><span className="font-medium text-neutral-800 dark:text-neutral-200">Category:</span> {product.category}</p>}
          {product.stock != null && <p><span className="font-medium text-neutral-800 dark:text-neutral-200">Stock:</span> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>}
        </div>
      ),
    },
  ];

  return (
    <motion.div {...pageTransition}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
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

          {/* Product Info */}
          <div>
            {product.brand && (
              <p className="text-xs font-medium text-primary-500 uppercase tracking-widest mb-2">{product.brand}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 dark:text-white">
              {product.name}
            </h1>

            {product.rating != null && (
              <div className="flex items-center gap-2 mt-3">
                <RatingStars rating={product.rating} size="md" />
                <span className="text-sm text-neutral-400">({product.review_count || 0} reviews)</span>
              </div>
            )}

            <div className="mt-6">
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                {getPrice(product.price_inr, product.price_usd)}
              </span>
              {currency === 'INR' && (
                <span className="ml-2 text-xs text-neutral-400">incl. GST</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mt-4">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-success-600">
                  <Check className="w-4 h-4" /> In Stock
                </span>
              ) : (
                <span className="text-sm text-error-500">Out of Stock</span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <Minus className="w-4 h-4 text-neutral-500" />
                </button>
                <span className="px-6 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 min-w-[4rem] text-center">
                  {quantity}
                </span>
                <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <Plus className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                loading={adding}
                disabled={product.stock <= 0}
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'On orders 499+' },
                { icon: Shield, label: 'Secure Payment', desc: '100% encrypted' },
                { icon: RotateCcw, label: 'Easy Returns', desc: '30-day policy' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
                  <p className="text-[10px] text-neutral-400">{desc}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-8">
              <Tabs tabs={tabs} defaultTab="description" />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-heading font-semibold text-neutral-900 dark:text-white mb-8">
              Related Products
            </h2>
            <ProductGrid products={related} columns={4} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
