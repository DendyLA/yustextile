"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { api, setToken } from "@/lib/api";
import { errorMessage } from "@/lib/format";
import { ErrorBox } from "@/components/ui/feedback";

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await api.login(email, password);
      setToken(result.accessToken);
      onSuccess();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <Image
          src="/logo.png"
          alt="YUS Textile Turkmenistan"
          width={1536}
          height={1024}
          priority
          unoptimized
        />
        <span className="login-art-text">Удобное управление вашим сайтом</span>
      </div>

      <div className="login-side">
        <form className="login-box" onSubmit={submit}>
          <div className="brand-mark">Y</div>
          <p className="eyebrow">Панель управления</p>
          <h1>С возвращением!</h1>
          <p>
            Войдите, чтобы управлять товарами, контентом сайта и заявками
            клиентов.
          </p>

          <div className="field">
            <label htmlFor="email">Электронная почта</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Введите пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <ErrorBox message={error} />}
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? "Входим…" : "Войти в админку →"}
          </button>
          <div className="login-foot">YUS Textile · Защищённый доступ</div>
        </form>
      </div>
    </div>
  );
}
