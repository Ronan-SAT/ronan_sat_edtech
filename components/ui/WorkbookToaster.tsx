"use client";

import { Toaster } from "react-hot-toast";

export function WorkbookToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 2600,
        style: {
          border: "2px solid var(--color-ink-fg)",
          borderRadius: "20px",
          background: "var(--color-surface-white)",
          color: "var(--color-ink-fg)",
          boxShadow: "6px 6px 0 0 var(--color-ink-fg)",
          padding: "12px 14px",
          fontSize: "14px",
          fontWeight: "700",
        },
        success: {
          iconTheme: {
            primary: "var(--color-primary)",
            secondary: "var(--color-ink-fg)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-accent-3)",
            secondary: "#ffffff",
          },
          style: {
            border: "2px solid var(--color-ink-fg)",
            borderRadius: "20px",
            background: "var(--color-accent-3)",
            color: "#ffffff",
            boxShadow: "6px 6px 0 0 var(--color-ink-fg)",
            padding: "12px 14px",
            fontSize: "14px",
            fontWeight: "700",
          },
        },
      }}
    />
  );
}
