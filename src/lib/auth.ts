import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { db } from "@/db";
import { schema } from "@/db/schema";
 
export const auth = betterAuth({
	// ... keep existing config keys above database
	database: drizzleAdapter(db, {
		provider: (process.env.USE_POSTGRES === 'true') ? "pg" : "sqlite",
		schema,
	}),
	emailAndPassword: {    
		enabled: true
	},
  // Enable Google OAuth for social sign-in
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // ensure account picker and refresh tokens when needed
      prompt: "select_account consent",
      accessType: "offline",
    },
  },
  // Session lifetime: 7d by default, 30d when "Remember me" is checked
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days default
    updateAge: 60 * 60 * 24, // refresh expiry at most once per day when used
    // extend server-side expiry for persistent sessions created with rememberMe=true
    rememberMe: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
    },
  },
  // --- Fix INVALID_ORIGIN by explicitly declaring server baseURL and trusted origins
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  basePath: "/api/auth",
  trustedOrigins: [
    // Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    // Environment-provided domains
    ...(process.env.NEXT_PUBLIC_AUTH_BASE_URL ? [process.env.NEXT_PUBLIC_AUTH_BASE_URL] : []),
    ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    // Preview deployments (wildcard)
    "https://*.vercel.app",
    // In development, allow any origin to prevent INVALID_ORIGIN from sandboxes/iframes
    ...(process.env.NODE_ENV !== "production" ? ["http://*", "https://*"] : []),
  ],
	plugins: [bearer()]
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user || null;
}