import { useState } from 'react';
import { Tag, Loader2, Check } from 'lucide-react';
import couponService from '@/api/coupon.service';
import toast from 'react-hot-toast';

export default function CouponInput({ onApply }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      const res = await couponService.applyCoupon(code.trim());
      const data = res.data?.data || res.data;
      setApplied(true);
      toast.success('Coupon applied!');
      onApply?.(data);
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code');
      setApplied(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setApplied(false); }}
          placeholder="Coupon code"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium tracking-wider dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          disabled={applied}
        />
      </div>
      <button
        onClick={handleApply}
        disabled={loading || applied || !code.trim()}
        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : applied ? <Check className="w-4 h-4" /> : null}
        {applied ? 'Applied' : 'Apply'}
      </button>
    </div>
  );
}
