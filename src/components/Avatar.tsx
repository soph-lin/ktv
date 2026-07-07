interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export default function Avatar({ src, name, className = "w-8 h-8" }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full bg-current/10 flex items-center justify-center text-xs font-semibold shrink-0`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}
