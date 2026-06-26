"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

const VAST_TAG_URL = "https://youradexchange.com/video/select.php?r=11510974";

export function VideoAd() {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let adsManager: any = null;
    let adsLoader: any = null;
    let mounted = true;

    /** Load Google IMA SDK if not already present */
    const loadIMA = (): Promise<void> =>
      new Promise((resolve) => {
        if ((window as any).google?.ima) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => resolve(); // silent fail — ad simply won't show
        document.head.appendChild(s);
      });

    const init = async () => {
      await loadIMA();
      if (!mounted) return;

      const gIma = (window as any).google?.ima;
      if (!gIma || !adContainerRef.current || !videoRef.current) {
        setStatus("error");
        return;
      }

      const container = adContainerRef.current;
      const video = videoRef.current;

      try {
        /* ── 1. Create Ad Display Container ── */
        const adDisplayContainer = new gIma.AdDisplayContainer(container, video);
        adDisplayContainer.initialize();

        /* ── 2. Create Ads Loader ── */
        adsLoader = new gIma.AdsLoader(adDisplayContainer);

        /* ── 3. Listen for ads loaded ── */
        adsLoader.addEventListener(
          gIma.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          (evt: any) => {
            if (!mounted) return;

            adsManager = evt.getAdsManager(video);

            // Track ad start
            adsManager.addEventListener(gIma.AdEvent.Type.STARTED, () => {
              startedRef.current = true;
              if (mounted) setStatus("playing");
            });

            // Handle ad errors
            adsManager.addEventListener(gIma.AdErrorEvent.Type.AD_ERROR, () => {
              if (mounted) setStatus("error");
            });

            // Hide container 3s after all ads complete
            adsManager.addEventListener(gIma.AdEvent.Type.ALL_ADS_COMPLETED, () => {
              if (mounted) {
                setTimeout(() => setStatus("error"), 3000);
              }
            });

            /* ── 4. Initialize & start ads ── */
            try {
              adsManager.init(
                container.clientWidth || 640,
                container.clientHeight || 360,
                gIma.ViewMode.NORMAL
              );
              adsManager.start();
            } catch {
              if (mounted) setStatus("error");
            }
          }
        );

        // Loader-level error
        adsLoader.addEventListener(gIma.AdErrorEvent.Type.AD_ERROR, () => {
          if (mounted) setStatus("error");
        });

        /* ── 5. Build & send ad request ── */
        const adsRequest = new gIma.AdsRequest();
        adsRequest.adTagUrl = VAST_TAG_URL;
        adsRequest.linearAdSlotWidth = container.clientWidth || 640;
        adsRequest.linearAdSlotHeight = container.clientHeight || 360;
        adsRequest.nonLinearAdSlotWidth = container.clientWidth || 640;
        adsRequest.nonLinearAdSlotHeight = container.clientHeight || 360;
        adsLoader.requestAds(adsRequest);

        // Safety timeout: if no ad starts within 12 s, hide
        setTimeout(() => {
          if (mounted && !startedRef.current) setStatus("error");
        }, 12000);
      } catch {
        if (mounted) setStatus("error");
      }
    };

    init();

    return () => {
      mounted = false;
      try { adsManager?.destroy(); } catch { /* noop */ }
      try { adsLoader?.destroy(); } catch { /* noop */ }
    };
  }, []);

  // Don't render anything if dismissed or errored
  if (dismissed || status === "error") return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Label + Close */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
          Advertisement
        </p>
        {status === "playing" && (
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
            aria-label="Tutup iklan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Video Ad Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200/60 shadow-sm bg-slate-900">
        {/* Loading spinner */}
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/80">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          </div>
        )}

        {/* Hidden video element (required by IMA SDK) */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          playsInline
          muted
        />

        {/* IMA ad overlay container */}
        <div ref={adContainerRef} className="absolute inset-0 cursor-pointer" />
      </div>
    </div>
  );
}