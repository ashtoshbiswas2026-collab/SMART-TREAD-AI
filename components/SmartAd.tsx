import React, { useState, useEffect } from 'react';
import GoogleAd from './GoogleAd';
import AdBanner from './AdBanner';

interface SmartAdProps {
  adSenseSlot: string;
  adMobUnitId: string;
  className?: string;
}

const SmartAd: React.FC<SmartAdProps> = ({ adSenseSlot, adMobUnitId, className }) => {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    // Detect if running in a WebView (Android/iOS)
    const userAgent = window.navigator.userAgent.toLowerCase();
    // 'wv' indicates WebView on Android
    const isWebView = userAgent.includes('wv') || 
                      // Check for common native bridges
                      (window as any).Android || 
                      (window as any).webkit?.messageHandlers;
    
    setIsApp(!!isWebView);
  }, []);

  if (isApp) {
    // Show AdMob Banner (Native App View)
    return <AdBanner adUnitId={adMobUnitId} className={className} />;
  }

  // Show AdSense (Web View)
  return (
    <GoogleAd 
      client="ca-pub-6195759507222480" 
      slot={adSenseSlot} 
      className={className} 
    />
  );
};

export default SmartAd;
