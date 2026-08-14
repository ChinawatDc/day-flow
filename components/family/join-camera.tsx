"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

function codeFromText(text: string) {
  try {
    const u = new URL(text);
    const c = u.searchParams.get("code");
    if (c) return c;
  } catch {
    /* not a url */
  }
  const m = text.toUpperCase().match(/PAN-?[A-Z0-9]{4}/);
  return m ? m[0] : "";
}

export function JoinCamera({ onCode }: { onCode: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!on) return;
    let stream: MediaStream | undefined;
    let raf = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let stop = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const { default: jsQR } = await import("jsqr");
        const tick = () => {
          if (stop || !video || !ctx) return;
          if (video.readyState >= 2) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const found = jsQR(img.data, img.width, img.height);
            if (found?.data) {
              const code = codeFromText(found.data);
              if (code) {
                onCode(code);
                setOn(false);
                return;
              }
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setErr("เปิดกล้องไม่ได้ — กรอกโค้ดแทน (ต้อง HTTPS)");
        setOn(false);
      }
    }
    void start();
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [on, onCode]);

  return (
    <div className="grid gap-2">
      {on ? <video ref={videoRef} className="w-full rounded-xl bg-ink" muted playsInline /> : null}
      {err ? <p className="text-caption text-orange">{err}</p> : null}
      <Button type="button" variant="outline" onClick={() => setOn((v) => !v)}>
        {on ? "ปิดกล้อง" : "เปิดกล้องสแกน QR"}
      </Button>
    </div>
  );
}
