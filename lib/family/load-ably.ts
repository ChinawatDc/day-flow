export type RealtimeClient = {
  channels: {
    get: (name: string) => {
      subscribe: (event: string, fn: (msg: { data: unknown }) => void) => void | Promise<void>;
      unsubscribe: (event?: string, fn?: (msg: { data: unknown }) => void) => void;
    };
  };
  close: () => void;
};

type AblyNs = {
  Realtime: new (opts: { authUrl: string }) => RealtimeClient;
};

declare global {
  interface Window {
    Ably?: AblyNs;
  }
}

export function loadAbly(): Promise<AblyNs> {
  if (window.Ably) return Promise.resolve(window.Ably);
  return new Promise((resolve, reject) => {
    const ready = () => {
      if (window.Ably) resolve(window.Ably);
      else reject(new Error("ably"));
    };
    const found = document.querySelector<HTMLScriptElement>("script[data-ably-cdn]");
    if (found) {
      found.addEventListener("load", ready);
      found.addEventListener("error", () => reject(new Error("ably")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.ably.com/lib/ably.min-1.js";
    s.async = true;
    s.dataset.ablyCdn = "1";
    s.onload = ready;
    s.onerror = () => reject(new Error("ably"));
    document.head.appendChild(s);
  });
}
