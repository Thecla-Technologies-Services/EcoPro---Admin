"use client";

import { useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((f) => URL.createObjectURL(f));
    onChange([...images, ...urls]);
    setCurrent(images.length);
  };

  const removeImage = () => {
    const next = images.filter((_, i) => i !== current);
    onChange(next);
    setCurrent(Math.max(0, current - 1));
  };

  if (images.length === 0) {
    return (
      <div
        onClick={() => fileRef.current?.click()}
        className="w-full h-44 rounded-xl bg-background border border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/70 transition-colors"
      >
        <div className="size-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
          <Camera className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Upload Product Images</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden">
      <Image
        src={images[current]}
        alt="product"
        width={400}
        height={176}
        className="w-full h-full object-cover"
      />
      {/* Remove */}
      <button
        type="button"
        onClick={removeImage}
        className="absolute top-2 right-2 size-6 rounded-full bg-white flex items-center justify-center shadow"
      >
        <X className="size-3 text-foreground" />
      </button>
      {/* Nav */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-white/80 flex items-center justify-center"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrent((c) => Math.min(images.length - 1, c + 1))
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-white/80 flex items-center justify-center"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
