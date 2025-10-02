import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: host,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing()
          }
        },
        capture_pageview: false, // We'll manually capture pageviews
        capture_pageleave: true,
        autocapture: {
          dom_event_allowlist: ['click', 'submit'], // Only capture clicks and form submits
          css_selector_allowlist: ['[data-ph-capture]'], // Only elements with this attribute
        },
      })
    }
  }
}

export { posthog }