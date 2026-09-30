import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Truck, ShieldCheck, BadgeCheck, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import productService from '@/api/product.service';
import { useCart } from '@/context/CartContext';
import ProductGrid from '@/components/ecommerce/ProductGrid';
import RatingStars from '@/components/ecommerce/RatingStars';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Eyebrow from '@/components/home/ui/Eyebrow';
import Accent from '@/components/home/ui/Accent';
import StatusMessage from '@/components/home/ui/StatusMessage';
import { CONTAINER } from '@/components/home/ui/styles';
import { pageTransition, revealUp, IN_VIEW, EASE_OUT } from '@/animations/variants';
import { formatPrice } from '@/utils/formatPrice';
import { productPricing } from '@/utils/product';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const MotionDiv = motion.div;
const MotionImg = motion.img;

// Page grid: gallery + long-form content on the left, sticky buy box on the right
const LAYOUT_GRID = 'grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-16 xl:gap-x-20';

// The description is CMS HTML and there is no typography plugin, so style its
// elements directly. Inline colours from pasted content are neutralised so the
// text stays legible in dark mode.
const DESCRIPTION_PROSE = cn(
  'text-[15px] leading-relaxed text-ink-soft sm:text-base [overflow-wrap:anywhere]',
  '[&_[style]]:bg-transparent! [&_[style]]:text-inherit!',
  '[&_p]:mb-4 [&_p:last-child]:mb-0',
  '[&_h1]:mb-3 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-medium [&_h1]:text-ink',
  '[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-ink',
  '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-ink',
  '[&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-base [&_h4]:font-medium [&_h4]:text-ink',
  '[&>:first-child]:mt-0',
  '[&_strong]:font-semibold [&_strong]:text-ink [&_b]:font-semibold [&_b]:text-ink',
  '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4',
  '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:mb-1.5 [&_li]:pl-1 [&_li::marker]:text-ink-faint',
  '[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-5 [&_blockquote]:italic',
  '[&_hr]:my-8 [&_hr]:border-line',
  '[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl',
  '[&_table]:mb-4 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-sm',
  '[&_td]:border-b [&_td]:border-line [&_td]:py-2 [&_td]:pr-4 [&_th]:border-b [&_th]:border-line [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink'
);

const TRUST_ITEMS = [
  { icon: BadgeCheck, label: 'Genuine products', desc: 'Premium quality & authenticity' },
  { icon: ShieldCheck, label: 'Secure checkout', desc: '100% encrypted payment' },
  { icon: Truck, label: 'Quick dispatch', desc: 'Within 3–5 working days' },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
        } catch { /* related products are optional */ }
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
      <div className={cn(CONTAINER, 'pb-24 pt-6 sm:pt-10')} aria-busy="true" aria-label="Loading product">
        <div className={LAYOUT_GRID}>
          <div className="lg:col-span-7">
            <div className="skeleton-shimmer aspect-square rounded-[2rem]" />
            <div className="mt-4 flex gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton-shimmer h-20 w-20 rounded-2xl sm:h-24 sm:w-24" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="skeleton-shimmer h-2.5 w-24 rounded-full" />
            <div className="skeleton-shimmer mt-6 h-9 w-11/12 rounded-full" />
            <div className="skeleton-shimmer mt-3 h-9 w-2/3 rounded-full" />
            <div className="skeleton-shimmer mt-8 h-8 w-32 rounded-full" />
            <div className="skeleton-shimmer mt-10 h-12 w-full rounded-full" />
            <div className="skeleton-shimmer mt-8 h-24 w-full rounded-[1.5rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={cn(CONTAINER, 'flex min-h-[60vh] items-center py-16')}>
        <StatusMessage
          className="w-full"
          title="Product not found"
          text="It may have been moved or is no longer available."
          action={{ to: '/shop', label: 'Browse all remedies' }}
        />
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images.map(img => typeof img === 'string' ? img : img.image_url)
    : [product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'];

  // Display only: compare-at price and % off when the product has a real discount
  const { compare, discount } = productPricing(product);
  const hasDescriptionToggle = product.description?.length > 400;

  const tabs = [
    {
      id: 'description',
      label: 'Description',
      content: (
        <div>
          <div className="relative">
            <div
              className={cn(
                DESCRIPTION_PROSE,
                'overflow-hidden transition-[max-height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isExpanded ? 'max-h-[3000px]' : 'max-h-60'
              )}
              dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
            />
            {!isExpanded && hasDescriptionToggle && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-linear-to-t from-canvas to-transparent" />
            )}
          </div>
          {hasDescriptionToggle && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="group relative z-10 mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-ink ring-1 ring-inset ring-line transition-colors duration-300 hover:bg-ink hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {isExpanded ? 'Read less' : 'Read more'}
              <ChevronDown
                className={cn('h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]', isExpanded && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      ),
    },
    {
      id: 'details',
      label: 'Details',
      content: (
        <dl className="divide-y divide-line border-b border-line">
          {product.sku && <DetailRow label="SKU">{product.sku}</DetailRow>}
          {product.brand && <DetailRow label="Brand">{product.brand}</DetailRow>}
          {product.category && <DetailRow label="Category">{product.category}</DetailRow>}

          {product.symptom && product.symptom.length > 0 && (
            <DetailRow label="Symptoms">{(Array.isArray(product.symptom) ? product.symptom : [product.symptom]).join(', ')}</DetailRow>
          )}
          {product.weight && <DetailRow label="Weight">{product.weight}g</DetailRow>}
          {product.dimensions && (
            <DetailRow label="Dimensions">{product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm</DetailRow>
          )}

          {product.hsn_code && <DetailRow label="HSN Code">{product.hsn_code}</DetailRow>}
          {/* {product.gst_percentage && <DetailRow label="GST">{product.gst_percentage}%</DetailRow>} */}

          {product.tags && product.tags.length > 0 && (
            <DetailRow label="Tags">
              <span className="flex flex-wrap gap-1.5">
                {(Array.isArray(product.tags) ? product.tags : [product.tags]).map((tag, i) => (
                  <span key={i} className="rounded-full bg-mist px-3 py-1 text-[12px] text-ink-soft">
                    {tag}
                  </span>
                ))}
              </span>
            </DetailRow>
          )}
        </dl>
      ),
    },
  ];

  return (
    <MotionDiv {...pageTransition}>
      <div className={cn(CONTAINER, 'pb-24 pt-6 sm:pb-32 sm:pt-10')}>
        <div className={LAYOUT_GRID}>
          {/* Image Gallery */}
          <div className="min-w-0 lg:col-span-7 lg:row-start-1">
            <div className="group relative isolate aspect-square overflow-hidden rounded-[2rem] bg-plate">
              <AnimatePresence initial={false}>
                <MotionImg
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="absolute inset-0 h-full w-full object-contain p-[9%] mix-blend-multiply transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </AnimatePresence>


              {images.length > 1 && (
                <>
                  <span className="pointer-events-none absolute bottom-4 left-4 z-[2] rounded-full bg-surface/85 px-3 py-1.5 text-[12px] font-medium tabular-nums text-ink backdrop-blur sm:bottom-6 sm:left-6">
                    {selectedImage + 1} / {images.length}
                  </span>
                  <div className="absolute bottom-3 right-3 z-[2] flex gap-2 transition-opacity duration-300 sm:bottom-5 sm:right-5 lg:opacity-0 lg:focus-within:opacity-100 lg:group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className={GALLERY_BUTTON}
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className={GALLERY_BUTTON}
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto sm:mt-4 sm:gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1} of ${images.length}`}
                    aria-current={selectedImage === i ? 'true' : undefined}
                    className={cn(
                      'relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-plate transition-[opacity,box-shadow] duration-300 sm:h-24 sm:w-24',
                      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent',
                      selectedImage === i
                        ? 'ring-2 ring-inset ring-ink'
                        : 'opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain p-2.5 mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info — sticky buy box on desktop */}
          <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-28">
              {product.brand && <Eyebrow>{product.brand}</Eyebrow>}
              <h1
                className={cn(
                  'font-display text-[clamp(2rem,3.4vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.035em] text-ink [overflow-wrap:anywhere]',
                  product.brand && 'mt-4'
                )}
              >
                {product.name}
              </h1>

              {product.rating != null && (
                <div className="mt-4 flex items-center gap-2">
                  <RatingStars rating={product.rating} size="md" />
                  <span className="text-sm text-ink-faint">({product.review_count || 0} reviews)</span>
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="font-display text-[2rem] font-medium leading-none tracking-[-0.02em] tabular-nums text-ink sm:text-[2.25rem]">
                  {formatPrice(product.price_usd)}
                </span>
                {compare && (
                  <s className="text-lg tabular-nums text-ink-faint">
                    <span className="sr-only">Was </span>
                    {formatPrice(compare)}
                  </s>
                )}
                {discount > 0 && (
                  <span className="self-center rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-medium tabular-nums text-accent">
                    Save {discount}%
                  </span>
                )}
                <span className="text-xs text-ink-faint">incl. GST</span>
              </div>

              {/* Stock Status */}
              <div className="mt-5">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-2.5 text-sm font-medium text-success-700 dark:text-success-500">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="absolute inset-0 animate-breathe rounded-full bg-success-500" />
                      <span className="relative h-2 w-2 rounded-full bg-success-500" />
                    </span>
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2.5 text-sm font-medium text-error-600 dark:text-error-500">
                    <span className="h-2 w-2 rounded-full bg-error-500" aria-hidden="true" />
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="mt-8 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row">
                <div className="flex h-12 shrink-0 items-center justify-between rounded-full ring-1 ring-inset ring-line">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={STEPPER_BUTTON}
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-10 text-center text-[15px] font-medium tabular-nums text-ink" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className={STEPPER_BUTTON}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  loading={adding}
                  disabled={product.stock <= 0}
                >
                  {!adding && <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />} Add to Cart
                </Button>
              </div>

              {/* Trust mini-row */}
              <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[1.5rem] bg-line ring-1 ring-line sm:grid-cols-3">
                {TRUST_ITEMS.map((item) => (
                  <TrustItem key={item.label} {...item} />
                ))}
              </ul>
            </div>
          </div>

          {/* Description & details */}
          <div className="min-w-0 lg:col-span-7 lg:row-start-2">
            <Tabs tabs={tabs} defaultTab="description" />
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-24 border-t border-line pt-14 sm:mt-32 sm:pt-20">
            <MotionDiv variants={revealUp} initial="hidden" whileInView="show" viewport={IN_VIEW} className="mb-10 sm:mb-12">
              {product.category && <Eyebrow>More in {product.category}</Eyebrow>}
              <h2
                id="related-heading"
                className={cn(
                  'font-display text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.04em] text-ink',
                  product.category && 'mt-5'
                )}
              >
                Related <Accent>products</Accent>
              </h2>
            </MotionDiv>
            <ProductGrid products={related} columns={4} />
          </section>
        )}
      </div>
    </MotionDiv>
  );
}

const GALLERY_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-full bg-surface/85 text-ink ring-1 ring-inset ring-line backdrop-blur transition-colors duration-300 hover:bg-ink hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const STEPPER_BUTTON =
  'flex h-12 w-12 items-center justify-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-ink/6 hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 py-3.5 sm:grid-cols-[9rem_1fr]">
      <dt className="pt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">{label}</dt>
      <dd className="min-w-0 text-[15px] leading-relaxed text-ink [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function TrustItem({ icon, label, desc }) {
  const Icon = icon;
  return (
    <li className="flex items-center gap-3.5 bg-canvas p-4 sm:flex-col sm:items-start sm:gap-3 sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-accent">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-faint">{desc}</span>
      </span>
    </li>
  );
}
