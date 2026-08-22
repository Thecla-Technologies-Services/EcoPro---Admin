"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Download, Plus, Trash2, Upload, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeliveryPartnerDocument } from "@/types/user";

interface DocumentUploadProps {
  newFiles: File[];
  existingDocuments: DeliveryPartnerDocument[];
  onAddFiles: (files: File[]) => void;
  onRemoveNewFile: (index: number) => void;
  onRemoveExistingDocument: (id: string) => void;
  error?: string;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function DocumentUpload({
  newFiles,
  existingDocuments,
  onAddFiles,
  onRemoveNewFile,
  onRemoveExistingDocument,
  error,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const hasFiles = existingDocuments.length > 0 || newFiles.length > 0;

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const valid = Array.from(fileList).filter(
      (file) =>
        ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_SIZE_BYTES,
    );
    if (valid.length) onAddFiles(valid);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-neutral-700">
        Upload Verification Document
      </p>

      {/* The drop zone is a div carrying its own button rather than being one
          itself: the field takes more than one document, and the button is
          what says so — a whole-panel button cannot hold a nested one. */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-neutral-200",
          error && "border-red-300",
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
          <Upload className="h-4 w-4 text-neutral-500" />
        </span>
        <span className="text-sm font-semibold text-neutral-700">
          Upload CAC Certificate or Registration Proof
        </span>
        <span className="text-xs text-neutral-400">
          PDF, JPG or PNG — Max 5mb
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 rounded-full"
          onClick={() => inputRef.current?.click()}
        >
          <Plus className="size-4" />
          {hasFiles ? "Add Another Document" : "Choose Files"}
        </Button>
        <span className="text-xs text-neutral-400">
          You can upload more than one file
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          // Reset, or picking the same file again fires no change event.
          event.target.value = "";
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="rounded-lg flex items-start bg-[#FFF8E1] p-2 text-xs text-[#F57F17]">
        <Info className="size-4.5"/>
        <span>
          {" "}
          Your documents are securely stored and only used for verification
          purposes.
        </span>
      </div>

      {hasFiles && (
        <div className="flex flex-wrap gap-3">
          {existingDocuments.map((doc) => (
            <DocumentThumbnail
              key={doc.id}
              src={doc.url}
              onRemove={() => onRemoveExistingDocument(doc.id)}
              onDownload={() => window.open(doc.url, "_blank")}
            />
          ))}
          {newFiles.map((file, index) => (
            <DocumentThumbnail
              key={`${file.name}-${index}`}
              src={URL.createObjectURL(file)}
              onRemove={() => onRemoveNewFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentThumbnail({
  src,
  onRemove,
  onDownload,
}: {
  src: string;
  onRemove: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="group relative h-25 w-25 overflow-hidden rounded-lg border border-neutral-200">
      <Image
        src={src}
        alt="Uploaded document"
        fill
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 top-0 flex justify-between p-1 opacity-0 transition-opacity group-hover:opacity-100">
        {onDownload ? (
          <button
            type="button"
            onClick={onDownload}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm"
            aria-label="Download document"
          >
            <Download className="h-3 w-3" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm"
          aria-label="Remove document"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
