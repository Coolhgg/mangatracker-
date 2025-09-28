import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Log in — Kenmei",
  description: "Access your Kenmei account to track and sync your reading across sites.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: { canonical: "/login" },
  openGraph: {
    type: "website",
    siteName: "Kenmei",
    url: "/login",
    title: "Log in — Kenmei",
    description: "Access your Kenmei account to track and sync your reading across sites.",
    images: [
      {
        url:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?",
        width: 1200,
        height: 630,
        alt: "Kenmei login",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Log in — Kenmei",
    description: "Access your Kenmei account to track and sync your reading across sites.",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?",
    ],
  },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}