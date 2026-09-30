import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import productService from '@/api/product.service';
import ProductGrid from '@/components/ecommerce/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import PageHeader from '@/components/common/PageHeader';
import { CONTAINER } from '@/components/home/ui/styles';
import { pageTransition } from '@/animations/variants';

const MotionDiv = motion.div;

export default function BrandPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    document.title = `${decodeURIComponent(slug)} — 1SkyStore`;
    loadProducts();
  }, [slug, page]);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await productService.getProducts({ brand: slug, page, pageSize: 20 });
      const data = res.data?.data || res.data;
      setProducts(data?.products || data?.rows || data || []);
      setTotalPages(res.data?.pagination?.totalPages || data?.totalPages || data?.total_pages || Math.ceil((data?.count || 0) / 20) || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(newPage) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  }

  return (
    <MotionDiv {...pageTransition}>
      <PageHeader
        eyebrow="Brand"
        title={decodeURIComponent(slug).replace(/-/g, ' ')}
        className="[&_h1]:capitalize [&_h1]:[overflow-wrap:anywhere]"
      />
      <div className={`${CONTAINER} pb-24 sm:pb-32`}>
        <div className="border-t border-line pt-10 sm:pt-12">
          <ProductGrid products={products} loading={loading} />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </MotionDiv>
  );
}
