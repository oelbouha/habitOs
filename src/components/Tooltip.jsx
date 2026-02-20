import { Info } from 'lucide-react';
import { useState } from 'react';

export function Tooltip({ text }) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onFocus={() => setShow(true)}
                onBlur={() => setShow(false)}
                className="text-text-muted hover:text-text-secondary transition-colors"
                aria-label="More info"
            >
                <Info size={14} />
            </button>
            {show && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white border border-border rounded-lg text-xs text-text-secondary whitespace-nowrap card-shadow animate-in">
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white border-b border-r border-border rotate-45" />
                </div>
            )}
        </div>
    );
}
