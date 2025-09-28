"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export const RouteMessengerScript = () => {
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    try {
      setInIframe(window.self !== window.top);
    } catch {
      setInIframe(true);
    }
  }, []);

  if (!inIframe) return null;

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