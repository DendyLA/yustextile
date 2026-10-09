"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clearToken, getToken } from "@/lib/api";
import { navigation, resources, siteSections } from "@/lib/resources";
import type { Language } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoginScreen } from "./login-screen";

type Notify = (message: string, isError?: boolean) => void;
const ToastContext = createContext<Notify>(() => undefined);
const PreviewLanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({ language: "ru", setLanguage: () => undefined });

export function useToast() {
  return useContext(ToastContext);
}

export function usePreviewLanguage() {
  return useContext(PreviewLanguageContext);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<Language>("ru");
  const [toast, setToast] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const notify = useCallback<Notify>((message, isError = false) => {
    setToast({ message, isError });
  }, []);

  useEffect(() => {
    setAuthenticated(Boolean(getToken()));
    const savedLanguage = window.localStorage.getItem("yus-preview-language");
    if (
      savedLanguage === "ru" ||
      savedLanguage === "tk" ||
      savedLanguage === "en"
    ) {
      setPreviewLanguage(savedLanguage);
    }
    const expire = () => setAuthenticated(false);
    window.addEventListener("admin-session-expired", expire);
    return () => window.removeEventListener("admin-session-expired", expire);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (authenticated === null)
    return <div className="loading">Загружаем админку…</div>;
  if (!authenticated) {
    return <LoginScreen onSuccess={() => setAuthenticated(true)} />;
  }

  const section = pathname.split("/")[1] || "dashboard";
  const currentTitle =
    resources[section]?.title ||
    siteSections[section as keyof typeof siteSections]?.title ||
    { dashboard: "Главная", orders: "Заявки", newsletter: "Подписчики" }[
      section as "dashboard" | "orders" | "newsletter"
    ] ||
    "Главная";

  function logout() {
    clearToken();
    setAuthenticated(false);
    router.push("/");
  }

  function changePreviewLanguage(language: Language) {
    setPreviewLanguage(language);
    window.localStorage.setItem("yus-preview-language", language);
  }

  return (
    <PreviewLanguageContext.Provider
      value={{ language: previewLanguage, setLanguage: changePreviewLanguage }}
    >
      <ToastContext.Provider value={notify}>
        <div className="app">
          <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
            <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
              <div className="brand-mark">Y</div>
              <div>
                <div className="brand-title">YUS Textile</div>
                <div className="brand-sub">ADMIN PANEL</div>
              </div>
            </Link>

            <nav aria-label="Разделы админки">
              {navigation.map((group) => (
                <div key={group.title}>
                  <div className="nav-title">{group.title}</div>
                  {group.entries.map(([href, label, icon]) => (
                    <Link
                      key={href}
                      href={href}
                      className={`nav-item ${pathname === href ? "active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="nav-icon">{icon}</span>
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </nav>

            <div className="sidebar-bottom">
              <small>Управление сайтом YUS Textile</small>
              <button className="logout" onClick={() => setConfirmLogout(true)}>
                ↪ &nbsp; Выйти из аккаунта
              </button>
            </div>
          </aside>

          <div className="main">
            <header className="topbar">
              <div className="topbar-title">
                <button
                  className="mobile-menu"
                  aria-label="Открыть меню"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  ☰
                </button>
                <div className="breadcrumb">
                  Панель управления &nbsp;/&nbsp;{" "}
                  <strong>{currentTitle}</strong>
                </div>
              </div>
              <div className="top-actions">
                <span className="api-pill">● &nbsp;Панель администратора</span>
                <span className="avatar">Y</span>
              </div>
            </header>
            <main className="content">{children}</main>
          </div>
        </div>

        {toast && (
          <div
            className={`toast show ${toast.isError ? "error" : ""}`}
            role="status"
          >
            {toast.message}
          </div>
        )}
        {confirmLogout && (
          <ConfirmDialog
            title="Выйти из аккаунта?"
            description="Сеанс в этой вкладке завершится. Вы сможете войти снова в любое время."
            confirmLabel="Да, выйти"
            onCancel={() => setConfirmLogout(false)}
            onConfirm={() => {
              setConfirmLogout(false);
              logout();
            }}
          />
        )}
      </ToastContext.Provider>
    </PreviewLanguageContext.Provider>
  );
}
