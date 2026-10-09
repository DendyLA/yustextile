"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <div className="confirm-dialog-content">
        <div
          className={`confirm-dialog-icon ${destructive ? "danger" : ""}`}
          aria-hidden="true"
        >
          {destructive ? "!" : "↪"}
        </div>
        <p className="confirm-dialog-eyebrow">Подтверждение действия</p>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p
          id="confirm-dialog-description"
          className="confirm-dialog-description"
        >
          {description}
        </p>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn ghost"
            autoFocus
            disabled={busy}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className={`btn ${destructive ? "danger" : "primary"}`}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Подождите…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
