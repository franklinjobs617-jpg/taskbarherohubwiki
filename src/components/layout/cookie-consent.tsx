"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tbh-cookie-consent";

type ConsentState = "pending" | "accepted" | "declined";

function getStoredConsent(): ConsentState {
  if (typeof window === "undefined") return "pending";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "accepted" || stored === "declined") return stored;
  return "pending";
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>("pending");

  useEffect(() => {
    setConsent(getStoredConsent());
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setConsent("declined");
  };

  return { consent, accept, decline };
}

const T = {
  en: {
    message: "This site uses cookies and analytics to improve your experience. By continuing, you agree to our use of cookies in accordance with our Privacy Policy.",
    accept: "Accept",
    decline: "Decline",
    privacy: "Privacy Policy",
  },
  zh: {
    message: "本站使用 Cookie 和分析工具来改善体验。继续浏览表示你同意我们根据隐私政策使用 Cookie。",
    accept: "接受",
    decline: "拒绝",
    privacy: "隐私政策",
  },
  ja: {
    message: "このサイトではCookieと分析ツールを使用しています。続行すると、プライバシーポリシーに従ったCookieの使用に同意したことになります。",
    accept: "同意する",
    decline: "拒否する",
    privacy: "プライバシーポリシー",
  },
  ko: {
    message: "이 사이트는 쿠키와 분석 도구를 사용합니다. 계속하면 개인정보처리방침에 따른 쿠키 사용에 동의하는 것입니다.",
    accept: "수락",
    decline: "거부",
    privacy: "개인정보처리방침",
  },
} as const;

type SupportedLocale = keyof typeof T;

function detectLocale(): SupportedLocale {
  if (typeof window === "undefined") return "en";
  const path = window.location.pathname;
  const seg = path.split("/")[1];
  if (seg === "zh" || seg === "ja" || seg === "ko") return seg;
  return "en";
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState<SupportedLocale>("en");

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored === "pending") {
      setVisible(true);
      setLocale(detectLocale());
    }
  }, []);

  if (!visible) return null;

  const t = T[locale] ?? T.en;

  const privacyPath = locale === "en" ? "/privacy" : `/${locale}/privacy`;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    // Reload to activate analytics/ads scripts if needed
    if (typeof window !== "undefined" && window.location) {
      window.location.reload();
    }
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border-default bg-bg-panel px-4 py-4 shadow-lg">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-text-secondary max-w-3xl">
          {t.message}{" "}
          <a href={privacyPath} className="text-accent hover:underline whitespace-nowrap">
            {t.privacy} →
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={decline}
            className="border border-border-default px-4 py-2 text-sm font-medium text-text-muted hover:text-white transition-colors"
          >
            {t.decline}
          </button>
          <button
            onClick={accept}
            className="bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-bright transition-colors"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
