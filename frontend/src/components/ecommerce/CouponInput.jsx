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
    <div className="space-y-3">
      {/* Applied coupon display */}
      {applied && appliedData && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-accent-soft py-2 pl-4 pr-1.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-canvas" aria-hidden="true">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="truncate text-sm font-medium tracking-[0.08em] text-ink">{code}</span>
            <span className="shrink-0 text-sm tabular-nums text-accent">-${appliedData.discount}</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            aria-label="Remove coupon"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-ink/6 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Input + Apply */}
      {!applied && (
        <>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); }}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="min-h-12 w-full rounded-2xl border border-line bg-surface py-3 pl-11 pr-4 text-sm font-medium tracking-[0.08em] text-ink transition-[border-color,box-shadow] duration-200 placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={loading || !code.trim()}
              className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-medium text-ink ring-1 ring-inset ring-line transition-colors duration-300 hover:bg-ink hover:text-canvas disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Apply
            </button>
          </div>

          {/* Available Coupons Dropdown */}
          {availableCoupons.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-[13px] font-medium text-accent transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                View available coupons
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {showDropdown && (
                <div className="mt-1 max-h-60 divide-y divide-line overflow-y-auto rounded-2xl bg-surface ring-1 ring-inset ring-line">
                  {availableCoupons.map((coupon) => (
                    <button
                      type="button"
                      key={coupon.code}
                      onClick={() => handleSelectCoupon(coupon)}
                      disabled={loading}
                      className="flex w-full items-start gap-3 p-4 text-left transition-colors duration-300 hover:bg-mist disabled:opacity-60"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13px] font-semibold tracking-[0.1em] text-ink">{coupon.code}</span>
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                            {formatDiscount(coupon)}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-ink-soft">{coupon.description}</p>
                        )}
                        {coupon.brand && (
                          <p className="mt-0.5 text-[11px] text-ink-faint">Only for: {coupon.brand}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {loadingCoupons && (
            <div className="flex items-center gap-2 text-xs text-ink-faint">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Loading coupons...
            </div>
          )}
        </>
      )}
    </div>
  );
}
