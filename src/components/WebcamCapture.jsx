import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Modal } from "@/components/ui";
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
            <>
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

                {/* Oval face guide: dims everything outside the oval so the candidate can
                    line their face up inside it before capturing. */}
                {ready && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-white/80"
                    style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }}
                    aria-hidden
                  />
                )}

                {/* Capture/Cancel on the side of the frame, not below it — reachable with
                    one thumb while holding the phone up to frame a selfie. */}
                <div className="absolute inset-y-0 right-2 flex flex-col items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={capture}
                    disabled={!ready}
                    aria-label="Capture photo"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-white/80 transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Cancel"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-center text-[11px] text-muted-foreground">Position your face inside the oval, then capture.</p>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
