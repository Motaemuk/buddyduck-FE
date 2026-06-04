export type KakaoMapState = "idle" | "loading" | "ready" | "fallback";

declare global {
  interface Window {
    kakao?: unknown;
  }
}

export function getKakaoMapKey() {
  return process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
}

export function loadKakaoMap(): Promise<KakaoMapState> {
  if (typeof window === "undefined") return Promise.resolve("fallback");
  const key = getKakaoMapKey();
  if (!key) return Promise.resolve("fallback");
  if (window.kakao) return Promise.resolve("ready");

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.async = true;
    script.onload = () => resolve(window.kakao ? "ready" : "fallback");
    script.onerror = () => resolve("fallback");
    document.head.appendChild(script);
  });
}
