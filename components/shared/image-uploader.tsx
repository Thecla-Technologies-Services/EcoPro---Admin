"use client";

import { useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** A picked file plus the object URL used to preview it. */
export interface PickedImage {
  file: File;
  previewUrl: string;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
}: {
  images: PickedImage[];
  onChange: (images: PickedImage[]) => void;
  /** Guards against a picker selection large enough to bog the dialog down. */
  maxImages?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(0);

  const atLimit = images.length >= maxImages;

  const openPicker = () => fileRef.current?.click();

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const room = maxImages - images.length;
    const added = files.slice(0, room).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (added.length) {
      onChange([...images, ...added]);
      // Land on the first of the new images rather than staying put.
      setCurrent(images.length);
    }

    // Without this, picking the same file twice in a row fires no change event.
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].previewUrl);
    onChange(images.filter((_, i) => i !== index));
    setCurrent((c) => Math.max(0, Math.min(c, images.length - 2)));
  };

  const picker = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={handleFiles}
    />
  );

  if (images.length === 0) {
    return (
      <div
        onClick={openPicker}
        className="flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background transition-colors hover:bg-muted/70"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-muted-foreground/20">
          <Camera className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Upload Product Images</p>
        <p className="text-xs text-muted-foreground">
          You can select more than one
        </p>
        {picker}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative h-44 w-full overflow-hidden rounded-xl">
        <Image
          src={images[current].previewUrl}
          alt={`Product image ${current + 1}`}
          fill
          unoptimized
          className="object-cover"
        />

        <button
          type="button"
          aria-label="Remove this image"
          onClick={() => removeImage(current)}
          className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white shadow"
        >
          <X className="size-3 text-foreground" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() =>
                setCurrent((c) => Math.min(images.length - 1, c + 1))
              }
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white tabular-nums">
          {current + 1}/{images.length}
        </span>
      </div>

      {/* The strip is what makes a second image reachable: the picker is hidden,
          so without a tile to open it again only the first selection counts. */}
      <div className="flex flex-wrap items-center gap-2">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.previewUrl}
            onClick={() => setCurrent(index)}
            aria-label={`Show image ${index + 1}`}
            aria-current={index === current}
            className={cn(
              "relative size-12 shrink-0 cursor-pointer overflow-hidden rounded-md border transition-colors",
              index === current
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-muted-foreground/40",
            )}
          >
            <Image
              src={image.previewUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </button>
        ))}

        {!atLimit && (
          <button
            type="button"
            onClick={openPicker}
            aria-label="Add more images"
            className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:bg-muted/70"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {images.length} of {maxImages} images
      </p>

      {picker}
    </div>
  );
}
