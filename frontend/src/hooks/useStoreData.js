import productService from '@/api/product.service';
import brandService from '@/api/brand.service';
import blogService from '@/api/blog.service';
import bannerService from '@/api/banner.service';
import { useApi } from '@/hooks/useApi';
import { listFromResponse } from '@/utils/product';

// Storefront data hooks. Keys are shared through fetchWithCache, so the navbar,
// footer and homepage sections can each ask for what they need without
// duplicating requests. 'categories' and 'symptoms' match the keys Shop and
// SymptomSection already use.

const unwrap = (res) => res?.data?.data ?? res?.data;

export const useFeaturedProducts = () =>
  useApi('store:featured', () => productService.getProducts({ pageSize: 8, is_featured: true }), listFromResponse);

export const useTrendingProducts = () =>
  useApi('store:trending', () => productService.getProducts({ pageSize: 8, is_trending: true }), listFromResponse);

export const useBestsellers = () =>
  useApi('store:best', () => productService.getBestProducts({ limit: 5 }), listFromResponse);

/** Total active products, from the listing's pagination */
export const useCatalogSize = () =>
  useApi(
    'store:catalog-size',
    () => productService.getProducts({ pageSize: 1 }),
    (res) => res?.data?.pagination?.totalItems ?? null
  );

/** [{ name, products }] ordered by how many products each category holds */
export const useCategoryShowcase = () =>
  useApi(
    'store:by-category',
    () => productService.getProductsByCategory({ categoryLimit: 12, productLimit: 3 }),
    (res) => {
      const data = unwrap(res) || {};
      return Object.entries(data).map(([name, products]) => ({
        name,
        products: Array.isArray(products) ? products : [],
      }));
    }
  );

export const useCategories = () =>
  useApi('categories', () => productService.getCategories(), (res) => {
    const data = unwrap(res);
    return Array.isArray(data) ? data.filter(Boolean) : [];
  });

/** [{ name, image_url? }] */
export const useBrands = () =>
  useApi('store:brands', () => brandService.getBrands(), (res) => {
    const data = unwrap(res);
    if (!Array.isArray(data)) return [];
    return data
      .map((brand) => (typeof brand === 'string' ? { name: brand } : brand))
      .filter((brand) => brand?.name);
  });

export const useSymptoms = () =>
  useApi('symptoms', () => productService.getSymptoms(), (res) => {
    const data = unwrap(res);
    const list = Array.isArray(data) ? data : data?.symptoms || [];
    return list
      .map((s) => (typeof s === 'string' ? s : s?.name))
      .filter((s) => typeof s === 'string' && s.trim() !== '');
  });

export const useBlogs = () =>
  useApi('store:blogs', () => blogService.getBlogs({ limit: 4, pageSize: 4 }), listFromResponse);

export const useBanners = () =>
  useApi('store:banners', () => bannerService.getBanners(), (res) => {
    const data = res?.data?.data || {};
    return {
      heroDesktop: data.heroDesktop || data.hero || [],
      heroMobile: data.heroMobile || data.hero || [],
      infoDesktop: data.infoDesktop || data.info || null,
      infoMobile: data.infoMobile || data.info || null,
    };
  });
