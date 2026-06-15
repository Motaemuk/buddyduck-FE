export type KakaoMapState = "idle" | "loading" | "ready" | "fallback";

export type KakaoLatLng = object;
export type KakaoMapInstance = {
  setBounds: (bounds: KakaoLatLngBounds) => void;
  panTo: (latlng: KakaoLatLng) => void;
  relayout: () => void;
};
export type KakaoLatLngBounds = {
  extend: (latlng: KakaoLatLng) => void;
};
export type KakaoOverlay = {
  setMap: (map: KakaoMapInstance | null) => void;
};
export type KakaoMapsApi = {
  maps: {
    load: (callback: () => void) => void;
    Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    LatLngBounds: new () => KakaoLatLngBounds;
    CustomOverlay: new (options: {
      position: KakaoLatLng;
      content: HTMLElement | string;
      xAnchor?: number;
      yAnchor?: number;
      clickable?: boolean;
    }) => KakaoOverlay;
    Polyline: new (options: {
      map: KakaoMapInstance;
      path: KakaoLatLng[];
      strokeWeight: number;
      strokeColor: string;
      strokeOpacity: number;
      strokeStyle: string;
    }) => KakaoOverlay;
    event: {
      preventMap: () => void;
    };
  };
};

declare global {
  interface Window {
    kakao?: KakaoMapsApi;
  }
}

let kakaoLoaderPromise: Promise<KakaoMapsApi | null> | null = null;

export function getKakaoMapKey() {
  return process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
}

export function loadKakaoMaps(): Promise<KakaoMapsApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const key = getKakaoMapKey();
  if (!key) return Promise.resolve(null);
  if (window.kakao?.maps?.load) {
    return new Promise((resolve) => {
      window.kakao?.maps.load(() => resolve(window.kakao ?? null));
    });
  }
  if (kakaoLoaderPromise) return kakaoLoaderPromise;

  kakaoLoaderPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps?.load) {
        resolve(null);
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao ?? null));
    };
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });

  return kakaoLoaderPromise;
}

export async function loadKakaoMap(): Promise<KakaoMapState> {
  const kakao = await loadKakaoMaps();
  return kakao ? "ready" : "fallback";
}
