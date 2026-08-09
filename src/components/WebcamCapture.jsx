import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

// Live webcam capture only — deliberately no file-picker fallback. A candidate uploading
// a stock/reused photo from their gallery is exactly the duplicate-registration vector
// this replaces; requiring a live camera frame means the photo has to be taken right now.
export function WebcamCaptureButton({ label, onCapture, facingMode = "user" }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (!open) return;
    setError("");
    setReady(false);
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      })
      .catch(() => setError("Couldn't access the camera. Check your browser's camera permission and try again."));
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, facingMode]);

  const close = () => {
    stopStream();
    setOpen(false);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // Mirror the saved frame to match the mirrored on-screen preview for the front
    // camera, so the photo isn't reversed from what the person just saw of themselves.
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
        close();
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <Camera className="h-4 w-4" />
        {label}
      </button>

      <Modal open={open} onClose={close} title="Take photo">
        <div className="space-y-3">
          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn("h-full w-full object-cover", facingMode === "user" && "[transform:scaleX(-1)]")}
              />
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">Starting camera…</div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="button" onClick={capture} disabled={!ready || !!error}>
              <Camera className="h-4 w-4" /> Capture
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
