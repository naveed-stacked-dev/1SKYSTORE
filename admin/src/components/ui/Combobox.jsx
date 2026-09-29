import { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown, Check } from 'lucide-react';

const Combobox = forwardRef(({
  className,
  label,
  error,
  options = [],
  placeholder = 'Select...',
  emptyText = 'No options found',
  value,
  onChange,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef(null);

  // Sync external value changes (e.g., initial load or reset)
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    const optLabel = (opt.label || opt).toString().toLowerCase();
    return optLabel.includes(inputValue.toLowerCase());
  });

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    // Directly update form state so user can type freely
    onChange(val);
  };

  const handleOptionClick = (opt) => {
    const val = opt.value || opt;
    setInputValue(opt.label || opt);
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-800 transition-all duration-200',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500',
            error
              ? 'border-error-500 focus:ring-error-500/30 focus:border-error-500'
              : 'border-neutral-200 dark:border-neutral-700',
            className
          )}
          {...props}
        />
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3.5 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
              {emptyText}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3.5 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
              No matching {label ? label.toLowerCase() : 'options'} found
            </div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((opt, i) => {
                const optValue = opt.value || opt;
                const optLabel = opt.label || opt;
                const isSelected = value === optValue;
                
                return (
                  <li
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className={cn(
                      "px-3.5 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                      isSelected ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-700 dark:text-neutral-300"
                    )}
                  >
                    {optLabel}
                    {isSelected && <Check className="w-4 h-4" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
      
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
});

Combobox.displayName = 'Combobox';
export default Combobox;
