export interface AvatarProps {
  src?: string | null;
  alt?: string;
  nameFallback?: string;
  size?: number;
}

export const Avatar = ({ src, alt = "Avatar", nameFallback = "?", size = 36 }: AvatarProps) => {
  const style = { width: size, height: size } as React.CSSProperties;
  return (
    <div className="inline-flex items-center justify-center overflow-hidden rounded-full border bg-card" style={style}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs text-muted-foreground">{nameFallback.slice(0,2).toUpperCase()}</span>
      )}
    </div>
  );
};