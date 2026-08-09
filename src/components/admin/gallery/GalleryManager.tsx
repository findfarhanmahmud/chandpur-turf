"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminGalleryImage } from "@/types/admin";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Label,
  Select,
  Spinner,
  Textarea,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const CATEGORIES = ["match", "turf", "night", "lights", "celebration", "training", "goal", "action"];

interface UploadState {
  title: string;
  caption: string;
  category: string;
  file: File | null;
  url: string;
}

const EMPTY_UPLOAD: UploadState = { title: "", caption: "", category: "match", file: null, url: "" };

export default function GalleryManager() {
  const [images, setImages] = useState<AdminGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upload, setUpload] = useState<UploadState>(EMPTY_UPLOAD);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ title: "", caption: "", category: "" });
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gallery", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setError(null);
      setImages(data.images);
    } catch {
      setError("Could not load gallery images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setNotice(null);
    try {
      let imageUrl = upload.url.trim();
      let storagePath: string | null = null;

      if (upload.file) {
        const form = new FormData();
        form.append("file", upload.file);
        const upRes = await fetch("/api/admin/gallery/upload", {
          method: "POST",
          body: form,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData?.message ?? "Upload failed");
        imageUrl = upData.imageUrl;
        storagePath = upData.storagePath;
      }

      if (!imageUrl) {
        setNotice({ type: "err", text: "Choose an image or paste a URL." });
        setUploading(false);
        return;
      }

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: upload.title,
          caption: upload.caption,
          category: upload.category,
          imageUrl,
          storagePath,
          sortOrder: images.length + 1,
          isVisible: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Could not add image");
      setUpload(EMPTY_UPLOAD);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotice({ type: "ok", text: "Image added to the gallery." });
      await load();
    } catch (err) {
      setNotice({ type: "err", text: err instanceof Error ? err.message : "Could not add image." });
    } finally {
      setUploading(false);
    }
  }

  async function toggleVisibility(img: AdminGalleryImage) {
    const res = await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !img.isVisible }),
    });
    if (res.ok) {
      setImages((prev) =>
        prev.map((x) => (x.id === img.id ? { ...x, isVisible: !x.isVisible } : x)),
      );
    }
  }

  async function saveEdit(img: AdminGalleryImage) {
    const res = await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: edit.title,
        caption: edit.caption,
        category: edit.category,
      }),
    });
    if (res.ok) {
      setImages((prev) =>
        prev.map((x) =>
          x.id === img.id ? { ...x, title: edit.title, caption: edit.caption, category: edit.category } : x,
        ),
      );
      setEditingId(null);
      setNotice({ type: "ok", text: "Image updated." });
    }
  }

  async function remove(img: AdminGalleryImage) {
    if (!confirm(`Delete "${img.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/gallery/${img.id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((x) => x.id !== img.id));
      setNotice({ type: "ok", text: "Image deleted." });
    } else {
      setNotice({ type: "err", text: "Could not delete the image." });
    }
  }

  async function move(img: AdminGalleryImage, dir: -1 | 1) {
    const idx = images.findIndex((x) => x.id === img.id);
    const other = images[idx + dir];
    if (!other) return;
    const res = await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder: other.sortOrder }),
    });
    const res2 = await fetch(`/api/admin/gallery/${other.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder: img.sortOrder }),
    });
    if (res.ok && res2.ok) {
      setImages((prev) => {
        const next = [...prev];
        next[idx] = other;
        next[idx + dir] = img;
        return next;
      });
    }
  }

  return (
    <div className="space-y-4">
      {notice && (
        <p
          className={`rounded-lg border px-3 py-2 text-[12px] ${
            notice.type === "ok"
              ? "border-[#c3f400]/40 bg-[#c3f400]/10 text-[#c3f400]"
              : "border-[#93000a]/50 bg-[#93000a]/20 text-[#ffb4ab]"
          }`}
        >
          {notice.text}
        </p>
      )}

      <Card>
        <CardHeader title="Add Image" subtitle="Upload to Supabase Storage or paste an image URL" />
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <Label htmlFor="gallery-file">Image file</Label>
              <input
                id="gallery-file"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setUpload((p) => ({ ...p, file: e.target.files?.[0] ?? null }))}
                className="w-full cursor-pointer rounded-lg border border-[#444933] bg-[#0c0f0f] px-3 py-2.5 text-sm text-[#c4c9ac] file:mr-3 file:rounded file:border-0 file:bg-[#c3f400]/15 file:px-3 file:py-1 file:text-[#c3f400]"
              />
            </div>
            <div>
              <Label htmlFor="gallery-url">…or image URL</Label>
              <Input
                id="gallery-url"
                placeholder="https://…"
                value={upload.url}
                onChange={(e) => setUpload((p) => ({ ...p, url: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gallery-cat">Category</Label>
                <Select
                  id="gallery-cat"
                  value={upload.category}
                  onChange={(e) => setUpload((p) => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="gallery-title">Title</Label>
              <Input
                id="gallery-title"
                required
                value={upload.title}
                onChange={(e) => setUpload((p) => ({ ...p, title: e.target.value }))}
                placeholder="Match night under the lights"
              />
            </div>
            <div>
              <Label htmlFor="gallery-caption">Caption</Label>
              <Textarea
                id="gallery-caption"
                rows={3}
                value={upload.caption}
                onChange={(e) => setUpload((p) => ({ ...p, caption: e.target.value }))}
                placeholder="Short description"
              />
            </div>
            <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
              {uploading ? "Uploading..." : "Add to Gallery"}
              {!uploading && (
                <span className="material-symbols-outlined text-base">add_photo_alternate</span>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <Spinner label="Loading gallery" />
      ) : error ? (
        <EmptyState message={error} />
      ) : images.length === 0 ? (
        <EmptyState message="No gallery images yet. Add your first one above." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img, idx) => (
            <Card key={img.id} className="flex flex-col overflow-hidden p-0">
              <div className="relative aspect-video w-full overflow-hidden bg-[#0c0f0f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className={cn(
                    "h-full w-full object-cover",
                    !img.isVisible && "opacity-40 grayscale",
                  )}
                />
                <span className="absolute left-2 top-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                      img.isVisible
                        ? "bg-[#c3f400] text-[#283500]"
                        : "bg-[#93000a]/80 text-[#ffb4ab]",
                    )}
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {img.isVisible ? "Visible" : "Hidden"}
                  </span>
                </span>
                <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#c4c9ac]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {img.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                {editingId === img.id ? (
                  <div className="space-y-2">
                    <Input
                      value={edit.title}
                      onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Title"
                    />
                    <Textarea
                      rows={2}
                      value={edit.caption}
                      onChange={(e) => setEdit((p) => ({ ...p, caption: e.target.value }))}
                      placeholder="Caption"
                    />
                    <Select
                      value={edit.category}
                      onChange={(e) => setEdit((p) => ({ ...p, category: e.target.value }))}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(img)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-white">{img.title}</p>
                    {img.caption && (
                      <p className="mt-1 flex-1 text-[12px] text-[#c4c9ac]">{img.caption}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingId(img.id);
                          setEdit({ title: img.title, caption: img.caption ?? "", category: img.category });
                        }}
                        className="rounded border border-[#444933] p-1.5 text-[#c4c9ac] hover:border-[#c3f400] hover:text-[#c3f400]"
                        aria-label="Edit image"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => toggleVisibility(img)}
                        className="rounded border border-[#444933] p-1.5 text-[#c4c9ac] hover:border-[#c3f400] hover:text-[#c3f400]"
                        aria-label="Toggle visibility"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {img.isVisible ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                      <button
                        disabled={idx === 0}
                        onClick={() => move(img, -1)}
                        className="rounded border border-[#444933] p-1.5 text-[#c4c9ac] hover:border-[#c3f400] hover:text-[#c3f400] disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      </button>
                      <button
                        disabled={idx === images.length - 1}
                        onClick={() => move(img, 1)}
                        className="rounded border border-[#444933] p-1.5 text-[#c4c9ac] hover:border-[#c3f400] hover:text-[#c3f400] disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      </button>
                      <button
                        onClick={() => remove(img)}
                        className="ml-auto rounded border border-[#93000a]/50 p-1.5 text-[#ffb4ab] hover:bg-[#93000a]/20"
                        aria-label="Delete image"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
