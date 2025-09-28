import ComponentsGalleryLoader from "@/components/demos/components-gallery-loader";

export const metadata = {
  title: "Components",
};

export default async function ComponentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight">Components Gallery</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Showcase of UI components with default, hover, and active states.
        </p>
      </div>
      {/* Client gallery now loads real data with loading/error/optimistic UI */}
      <ComponentsGalleryLoader />
    </div>
  );
}