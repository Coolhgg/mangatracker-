import RegisterForm from "@/components/auth/register-form";

export const metadata = {
  title: "Register — Kenmei",
  description: "Create your Kenmei account to track, discover, and sync your reading across 20+ sites.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: { canonical: "/register" },
  openGraph: {
    type: "website",
    siteName: "Kenmei",
    url: "/register",
    title: "Register — Kenmei",
    description: "Create your Kenmei account to track, discover, and sync your reading across 20+ sites.",
    images: [
      {
        url:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?",
        width: 1200,
        height: 630,
        alt: "Kenmei registration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register — Kenmei",
    description: "Create your Kenmei account to track, discover, and sync your reading across 20+ sites.",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?",
    ],
  },
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}