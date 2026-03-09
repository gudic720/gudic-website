// components/FlagImage.tsx
import Image from "next/image";

type Props = {
  code: string; 
  size?: number; 
  className?: string;
};


export default function FlagImage({ code, size = 18, className = "" }: Props) {
  const c = (code || "").trim().toLowerCase();


  if (!/^[a-z]{2}$/.test(c)) return null;

 
  const src = `https://flagcdn.com/${c}.svg`;

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-sm ring-1 ring-black/10 bg-white ${className}`}
      style={{ width: size, height: size }}
      title={c.toUpperCase()}
    >
      <Image
        src={src}
        alt={c.toUpperCase()}
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
