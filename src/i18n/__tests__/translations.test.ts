import { describe, it, expect } from 'vitest';
import { translations, t, Language } from '../translations';

describe('Localization & Translation System', () => {
  it('should have non-empty english and arabic text for every defined key', () => {
    const keys = Object.keys(translations);
    expect(keys.length).toBeGreaterThan(30);

    for (const key of keys) {
      const item = translations[key];
      expect(item.en, `Key "${key}" should have non-empty English text`).toBeTruthy();
      expect(item.ar, `Key "${key}" should have non-empty Arabic text`).toBeTruthy();
      expect(typeof item.en).toBe('string');
      expect(typeof item.ar).toBe('string');
    }
  });

  it('should return correct localized text via t()', () => {
    expect(t('nav.today', 'en')).toBe('Today');
    expect(t('nav.today', 'ar')).toBe('اليوم');
    expect(t('nav.guest', 'en')).toBe('Guest Mode');
    expect(t('nav.guest', 'ar')).toBe('وضع الضيف');
  });

  it('should return the key itself if an undefined key is requested', () => {
    expect(t('nonexistent.key.xyz', 'en')).toBe('nonexistent.key.xyz');
    expect(t('nonexistent.key.xyz', 'ar')).toBe('nonexistent.key.xyz');
  });

  it('should handle fallback if a language variant is missing in an item', () => {
    // Add temporary item to test fallback branch
    (translations as Record<string, { en: string; ar: string }>)['test.fallback'] = {
      en: 'English Only Fallback',
      ar: '',
    };
    expect(t('test.fallback', 'ar')).toBe('English Only Fallback');
    delete (translations as Record<string, { en: string; ar: string }>)['test.fallback'];
  });

  it('should include the mandatory unreviewed translation notice in Arabic', () => {
    const notice = t('nav.unreviewed_banner', 'ar');
    expect(notice).toContain('تنبيه: الترجمة العربية غير مدققة');
    expect(notice).toContain('بانتظار مراجعة متحدث أصلي للغة العربية');
  });

  it('should support switching languages cleanly across all primary keys', () => {
    const languages: Language[] = ['en', 'ar'];
    for (const lang of languages) {
      expect(t('ladder.minimum', lang)).toBeTruthy();
      expect(t('ladder.target', lang)).toBeTruthy();
      expect(t('ladder.stretch', lang)).toBeTruthy();
      expect(t('status.on_track', lang)).toBeTruthy();
      expect(t('status.lapsed', lang)).toBeTruthy();
      expect(t('status.recovering', lang)).toBeTruthy();
    }
  });
});
