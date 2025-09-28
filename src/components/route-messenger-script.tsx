"use client";

import Script from "next/script";

export const RouteMessengerScript = () => {
  const isInIframe = typeof window !== "undefined" && window.parent !== window;
  if (!isInIframe) return null;
  return (
    <Script
      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
      strategy="afterInteractive"
      data-target-origin="*"
      data-message-type="ROUTE_CHANGE"
      data-include-search-params="true"
      data-only-in-iframe="true"
      data-debug="true"
      data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
    />
  );
};

export default RouteMessengerScript;