This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Health check

Run these from inside your Codespace terminal:

```bash
# Local (inside Codespace)
curl -I http://localhost:3000/api/health
curl -I http://localhost:3000/api/health/db
curl -I http://localhost:3000/api/search/health
```

If testing from outside the Codespace, use the forwarded/public URL. In the Ports tab, set port 3000 to Public and use this format:

```
https://3000-<your-codespace-name>-<random-id>.github.dev/api/health
https://3000-<your-codespace-name>-<random-id>.github.dev/api/health/db
https://3000-<your-codespace-name>-<random-id>.github.dev/api/search/health
```

Tip: You can also quickly verify in one line (inside Codespace):

```bash
for p in health health/db search/health; do echo "Checking /api/$p"; curl -I "http://localhost:3000/api/$p"; echo; done
```