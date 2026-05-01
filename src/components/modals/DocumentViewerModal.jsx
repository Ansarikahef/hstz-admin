import HzModal from "./HzModal";
import { Download, FileText, ExternalLink } from "lucide-react";

export default function DocumentViewerModal({ doc, onClose, travellerName }) {
  if (!doc) return null;
  const url = doc.url || doc.dataUrl || "";
  const isPdf =
    url.startsWith("data:application/pdf") || url.toLowerCase().endsWith(".pdf");
  const isImage =
    !!url &&
    (url.startsWith("data:image/") ||
      /\.(jpe?g|png|webp|gif|svg)$/i.test(url) ||
      url.includes("unsplash.com") ||
      url.includes("pexels.com") ||
      url.includes("dicebear.com"));

  const download = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name || "document";
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  };

  return (
    <HzModal
      open={!!doc}
      onClose={onClose}
      title={doc.name}
      description={`${(doc.type || "document").toUpperCase()}${travellerName ? " · " + travellerName : ""}`}
      size="lg"
      testid="doc-viewer-modal"
      footer={
        <>
          <button className="hz-btn-ghost" onClick={onClose} data-testid="doc-viewer-close">
            Close
          </button>
          {url && (
            <>
              <a
                className="hz-btn-ghost"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="doc-viewer-open-tab"
              >
                <ExternalLink className="size-4" /> Open in new tab
              </a>
              <button className="hz-btn-primary" onClick={download} data-testid="doc-viewer-download">
                <Download className="size-4" /> Download
              </button>
            </>
          )}
        </>
      }
    >
      {url ? (
        isImage ? (
          <div className="flex items-center justify-center bg-[var(--hz-hover)] rounded-xl p-3 min-h-[40vh]">
            <img
              src={url}
              alt={doc.name}
              className="max-w-full max-h-[65vh] rounded-lg object-contain shadow-sm"
              data-testid="doc-viewer-image"
            />
          </div>
        ) : isPdf ? (
          <iframe
            src={url}
            title={doc.name}
            className="w-full min-h-[65vh] rounded-xl border border-[var(--hz-border)]"
            data-testid="doc-viewer-pdf"
          />
        ) : (
          <div className="text-center py-12">
            <FileText className="size-12 text-[var(--hz-text-2)] mx-auto" strokeWidth={1.25} />
            <div className="mt-3 hz-heading">Preview unavailable</div>
            <div className="text-sm text-[var(--hz-text-2)] mt-1">Download or open in a new tab to view this file.</div>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <FileText className="size-12 text-[var(--hz-text-2)] mx-auto" strokeWidth={1.25} />
          <div className="mt-3 hz-heading">No file attached</div>
          <div className="text-sm text-[var(--hz-text-2)] mt-1">This document record was created without a file upload.</div>
        </div>
      )}
    </HzModal>
  );
}
