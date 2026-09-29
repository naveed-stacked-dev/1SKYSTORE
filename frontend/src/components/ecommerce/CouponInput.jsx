import { useState, useEffect } from 'react';
import { Tag, Loader2, Check, ChevronDown, X, Percent, DollarSign } from 'lucide-react';
import couponService from '@/api/coupon.service';
import toast from 'react-hot-toast';

export default function CouponInput({ onApply, onRemove }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [appliedData, setAppliedData] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Fetch available coupons on mount
  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  async function fetchActiveCoupons() {
    try {
      setLoadingCoupons(true);
      const res = await couponService.getActiveCoupons();
      const data = res.data?.data || res.data || [];
      setAvailableCoupons(Array.isArray(data) ? data : []);
    } catch {
      // Silent fail — manual input still works
    } finally {
      setLoadingCoupons(false);
    }
  }

  const handleApply = async (couponCode) => {
    const codeToApply = couponCode || code.trim();
    if (!codeToApply) return;

    try {
      setLoading(true);
      const res = await couponService.applyCoupon(codeToApply);
      const data = res.data?.data || res.data;
      setCode(codeToApply.toUpperCase());
      setApplied(true);
      setAppliedData(data);
      setShowDropdown(false);
      toast.success('Coupon applied!');
      onApply?.(data);
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code');
      setApplied(false);
      setAppliedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCode('');
    setApplied(false);
    setAppliedData(null);
    onRemove?.();
  };

  const handleSelectCoupon = (coupon) => {
    setCode(coupon.code);
    handleApply(coupon.code);
  };

  const formatDiscount = (coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    }
    return `$${coupon.discount_value} OFF`;
  };

  return (
    <div className="space-y-2">
      {/* Applied coupon display */}
      {applied && appliedData && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50 dark:bg-primary-900/15 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{code}</span>
            <span className="text-xs text-primary-500">-${appliedData.discount}</span>
          </div>
          <button onClick={handleRemoveCoupon} className="p-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
            <X className="w-3.5 h-3.5 text-primary-500" />
          </button>
        </div>
      )}

      {/* Input + Apply */}
      {!applied && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); }}
                placeholder="Coupon code"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium tracking-wider dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => handleApply()}
              disabled={loading || !code.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Apply
            </button>
          </div>

          {/* Available Coupons Dropdown */}
          {availableCoupons.length > 0 && (
            <div>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
              >
                <Tag className="w-3 h-3" />
                View available coupons
                <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="mt-2 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden max-h-52 overflow-y-auto">
                  {availableCoupons.map((coupon) => (
                    <button
                      key={coupon.code}
                      onClick={() => handleSelectCoupon(coupon)}
                      disabled={loading}
                      className="w-full flex items-start gap-3 p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent className="w-3.5 h-3.5 text-primary-500" />
                        ) : (
                          <DollarSign className="w-3.5 h-3.5 text-primary-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100 tracking-wider">{coupon.code}</span>
                          <span className="text-[10px] font-semibold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded">
                            {formatDiscount(coupon)}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{coupon.description}</p>
                        )}
                        {coupon.brand && (
                          <p className="text-[10px] text-neutral-400 mt-0.5">Only for: {coupon.brand}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {loadingCoupons && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading coupons...
            </div>
          )}
        </>
      )}
    </div>
  );
}
