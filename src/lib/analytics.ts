declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_ID as string | undefined;

function isTrackingAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') return false;
  if ((navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl) return false;
  return true;
}

function loadScript(id: string): void {
  const existing = document.querySelector(`script[src*="${id}"]`);
  if (existing) return;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.async = true;
  document.head.appendChild(script);
}

function initGtag(id: string): void {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: true });
}

export function initAnalytics(): void {
  if (!MEASUREMENT_ID) return;
  if (!isTrackingAllowed()) return;
  loadScript(MEASUREMENT_ID);
  initGtag(MEASUREMENT_ID);
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (!MEASUREMENT_ID) return;
  if (!isTrackingAllowed()) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
