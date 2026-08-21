import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdProps {
  client: string;
  slot: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
  className?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  client, 
  slot, 
  format = 'auto', 
  responsive = 'true', 
  style = { display: 'block' },
  className = ''
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Ensure the element has width before triggering
          const rect = entries[0].boundingClientRect;
          if (rect.width > 0 && rect.height > 0) {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible || pushedRef.current) return;

    const adElement = adRef.current;
    if (!adElement) return;

    // Check if already populated by AdSense to prevent "All 'ins' elements..." error
    if (adElement.getAttribute('data-ad-status')) {
        pushedRef.current = true;
        return;
    }

    // Check if innerHTML is not empty (another sign of population)
    if (adElement.innerHTML.trim().length > 0) {
        pushedRef.current = true;
        return;
    }

    try {
      // Check if window.adsbygoogle exists and push
      const ads = (window.adsbygoogle = window.adsbygoogle || []);
      ads.push({});
      pushedRef.current = true;
    } catch (e: any) {
      // Ignore specific AdSense errors that are just warnings or common issues
      if (e.message && (
          e.message.includes("All 'ins' elements") || 
          e.message.includes("No slot size")
      )) {
          return;
      }
      console.log('AdSense push error:', e);
    }
  }, [isVisible]);

  return (
    <div className={`overflow-hidden min-h-[50px] ${className}`}>
        <ins className="adsbygoogle"
             ref={adRef}
             style={style}
             data-ad-client={client}
             data-ad-slot={slot}
             data-ad-format={format}
             data-full-width-responsive={responsive}></ins>
    </div>
  );
};

export default GoogleAd;
