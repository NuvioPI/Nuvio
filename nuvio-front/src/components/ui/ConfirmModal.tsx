"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Excluir",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--card) p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600"><AlertTriangle size={19} /></span>
          <div className="min-w-0 flex-1"><h2 id="confirm-modal-title" className="text-base font-semibold text-(--foreground)">{title}</h2><p className="mt-2 whitespace-pre-line text-sm leading-5 text-(--muted-foreground)">{message}</p></div>
          <button type="button" onClick={onCancel} disabled={loading} aria-label="Fechar" className="rounded-lg p-1 text-(--muted-foreground) hover:bg-(--muted) disabled:opacity-50"><X size={17} /></button>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-(--border) px-3 py-2 text-sm text-(--muted-foreground) hover:bg-(--muted)">Cancelar</button><button type="button" onClick={onConfirm} disabled={loading} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Excluindo..." : confirmLabel}</button></div>
      </div>
    </div>
  );
}
