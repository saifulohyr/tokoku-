"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

declare global {
  interface Window {
    snap: {
      pay: (token: string, callbacks?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
      embed: (token: string, options: { embedId: string }) => void;
    };
  }
}

export const useSnap = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSnap = async () => {
      if (window.snap) {
        setIsLoaded(true);
        return;
      }

      try {
        // Fetch config from backend
        // Note: The endpoint is public
        const response = await api.get<any>("/payment/config");
        console.log("[Snap Debug] Config Response:", response);
        
        // Handle potentially wrapped response
        const clientKey = response.data?.clientKey || response.data?.data?.clientKey;
        console.log("[Snap Debug] Client Key:", clientKey);
        
        if (!clientKey) {
          console.error("Failed to load Midtrans Client Key. Response data:", response.data);
          return;
        }

        const scriptId = "midtrans-snap";
        if (document.getElementById(scriptId)) return;

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", clientKey);
        script.onload = () => setIsLoaded(true);
        
        document.body.appendChild(script);
      } catch (error) {
        console.error("Error loading Snap config:", error);
      }
    };

    loadSnap();
  }, []);

  return { isLoaded, snap: typeof window !== "undefined" ? window.snap : undefined };
};
