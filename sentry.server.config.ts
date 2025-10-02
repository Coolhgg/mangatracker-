import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out expected errors
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Ignore authentication errors (expected)
    if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
      return null;
    }
    
    // Ignore rate limit errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      return null;
    }

    return event;
  },

  environment: process.env.NODE_ENV,
});