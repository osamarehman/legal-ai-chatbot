import Image from "next/image";
import { useState } from "react";
import type { Attachment } from "@/lib/types";
import { Loader } from "./elements/loader";
import { CrossSmallIcon } from "./icons";
import { Button } from "./ui/button";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
}) => {
  const { name, url, contentType } = attachment;
  const [imageError, setImageError] = useState(false);

  const isImage = contentType?.startsWith("image");
  const isPDF = contentType === "application/pdf";
  const isDoc = contentType?.includes("word") || contentType?.includes("document");

  const getFileIcon = () => {
    if (isPDF) {
      return (
        <div className="flex size-full flex-col items-center justify-center gap-1 bg-red-50 dark:bg-red-950">
          <svg
            className="size-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-[8px] text-red-600 dark:text-red-400">PDF</span>
        </div>
      );
    }
    if (isDoc) {
      return (
        <div className="flex size-full flex-col items-center justify-center gap-1 bg-blue-50 dark:bg-blue-950">
          <svg
            className="size-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-[8px] text-blue-600 dark:text-blue-400">DOC</span>
        </div>
      );
    }
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
        File
      </div>
    );
  };

  return (
    <div
      className="group relative size-16 flex-shrink-0 overflow-hidden rounded-lg border bg-muted"
      data-testid="input-attachment-preview"
    >
      {isImage && !imageError && url ? (
        <Image
          alt={name ?? "An image attachment"}
          className="size-full object-cover"
          height={64}
          onError={() => setImageError(true)}
          src={url}
          width={64}
        />
      ) : (
        getFileIcon()
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader size={16} />
        </div>
      )}

      {onRemove && !isUploading && (
        <Button
          className="absolute top-0.5 right-0.5 size-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onRemove}
          size="sm"
          variant="destructive"
        >
          <CrossSmallIcon size={8} />
        </Button>
      )}

      <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5 text-[10px] text-white leading-tight">
        {name}
      </div>
    </div>
  );
};
