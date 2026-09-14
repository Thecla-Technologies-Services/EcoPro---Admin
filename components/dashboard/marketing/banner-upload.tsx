"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface BannerUploadProps<T extends FieldValues> {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  register: UseFormRegister<T>;
  name: Path<T>;
  error?: string;
}

export function BannerUpload<T extends FieldValues>({
  previewUrl,
  onFileSelect,
  register,
  name,
  error,
}: BannerUploadProps<T>) {
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }

  return (
    // The same grey panel the form's other sections use, but a tighter 8px
    // inset: the dashed box is the white field inside it, and nearly fills it.
    // The 16px gap to the card below is owned here rather than by the dashed
    // box, so a validation message appearing underneath does not change it.
    <div className="mb-4 rounded-lg bg-background p-2">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative border-2 border-dashed rounded-xl px-4 py-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white ${
          error
            ? "border-red-400"
            : "border-gray-300 hover:border-[#2D7A4F]/50"
        }`}
        onClick={() => document.getElementById("banner-file-input")?.click()}
      >
        <input
          id="banner-file-input"
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleBrowse}
        />
        <input
          type="hidden"
          {...register(name, {
            validate: (v) => !!v || "Please upload a banner image",
          })}
        />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Uploaded banner"
            className="w-full h-28.5 object-cover rounded-lg"
          />
        ) : (
          <>
            {/* 24px under the icon, 8px between the two lines — the gap either
                side of the heading is not the same, so the stack sets each
                rather than sharing one `gap`. */}
            <Upload className="size-8.5 text-gray-400" strokeWidth={1.75} />
            <p className="mt-6 text-base font-semibold text-foreground text-center">
              Drop your image here or click to browse
            </p>
            <p className="mt-2 text-sm text-gray-400 text-center">
              Recommended size: 1200×400px (JPG, PNG). Max 2MB.
            </p>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 px-1">{error}</p>}
    </div>
  );
}