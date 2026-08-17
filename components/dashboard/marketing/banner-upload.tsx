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
    <>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative border-2 border-dashed rounded-xl p-2 mb-1 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white ${
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
            <Upload className="w-7 h-7 text-gray-400" />
            <p className="text-sm text-gray-600 font-medium text-center">
              Drop your image here or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Recommended size: 1200×400px (JPG, PNG). Max 2MB.
            </p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mb-3 px-1">{error}</p>}
    </>
  );
}