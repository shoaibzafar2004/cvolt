"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedImg, type PixelCrop } from "@/lib/cropImage";
import { ZoomIn, ZoomOut } from "lucide-react";

interface PhotoCropModalProps {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (croppedBase64: string) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export default function PhotoCropModal({
  imageSrc,
  open,
  onClose,
  onConfirm,
}: PhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: unknown, pixels: PixelCrop) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels, 400);
      onConfirm(cropped);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pt-5 pb-4">
          <DialogTitle>Crop your photo</DialogTitle>
        </DialogHeader>

        {/* Crop area — full bleed */}
        <div className="relative w-full bg-black" style={{ height: 440 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={1}
            cropShape="round"
            showGrid={false}
            zoomSpeed={0.3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-3 px-6 pt-4 pb-1">
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.1).toFixed(2)))
            }
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-primary"
          />
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.1).toFixed(2)))
            }
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <p className="pb-4 text-center text-xs text-muted-foreground">
          Drag to reposition · Scroll or use slider to zoom
        </p>

        {/* Footer — override negative margins since content uses p-0 */}
        <DialogFooter className="mx-0 mb-0 rounded-b-xl px-6 py-4">
          <DialogClose render={<Button variant="outline" disabled={loading} />}>
            Cancel
          </DialogClose>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Applying…" : "Use this crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
