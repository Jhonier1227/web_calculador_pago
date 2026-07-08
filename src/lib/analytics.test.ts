import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    // Limpiar gtag/dataLayer entre tests
    delete (window as Record<string, unknown>).gtag;
    delete (window as Record<string, unknown>).dataLayer;
  });

  describe('isTrackingAllowed', () => {
    it('retorna false si doNotTrack es "1"', async () => {
      const originalDNT = navigator.doNotTrack;
      Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });

      const { initAnalytics } = await import('./analytics');
      initAnalytics();

      expect(window.dataLayer).toBeUndefined();

      Object.defineProperty(navigator, 'doNotTrack', { value: originalDNT, configurable: true });
    });

    it('retorna false si globalPrivacyControl es true', async () => {
      const originalGPC = (navigator as Record<string, unknown>).globalPrivacyControl;
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });

      const { initAnalytics } = await import('./analytics');
      initAnalytics();

      expect(window.dataLayer).toBeUndefined();

      Object.defineProperty(navigator, 'globalPrivacyControl', { value: originalGPC, configurable: true });
    });

    it('retorna true si no hay restricciones de privacidad', async () => {
      const originalDNT = navigator.doNotTrack;
      const originalGPC = (navigator as Record<string, unknown>).globalPrivacyControl;
      Object.defineProperty(navigator, 'doNotTrack', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });

      // Necesitamos VITE_GA_ID definido
      import.meta.env.VITE_GA_ID = 'G-TEST123';

      const { initAnalytics, trackEvent } = await import('./analytics');
      initAnalytics();

      expect(window.dataLayer).toBeDefined();
      expect(window.gtag).toBeDefined();

      trackEvent('test_event', { key: 'value' });
      expect(window.dataLayer!.length).toBeGreaterThan(0);

      delete import.meta.env.VITE_GA_ID;
      Object.defineProperty(navigator, 'doNotTrack', { value: originalDNT, configurable: true });
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: originalGPC, configurable: true });
    });
  });

  describe('trackEvent', () => {
    it('no hace nada si no hay VITE_GA_ID', async () => {
      delete import.meta.env.VITE_GA_ID;
      window.gtag = vi.fn();

      const { trackEvent } = await import('./analytics');
      trackEvent('test');

      expect(window.gtag).not.toHaveBeenCalled();
    });

    it('llama gtag con nombre y parámetros cuando está configurado', async () => {
      import.meta.env.VITE_GA_ID = 'G-TEST';
      const gtag = vi.fn();
      window.gtag = gtag;

      const { trackEvent } = await import('./analytics');
      trackEvent('calcular', { salario: 1000000 });

      expect(gtag).toHaveBeenCalledWith('event', 'calcular', { salario: 1000000 });
    });
  });
});
