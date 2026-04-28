"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { TestTokenDialog } from "@/components/test-access/TestTokenDialog";
import { useTestAccess } from "@/components/test-access/useTestAccess";

type TestAccessButtonProps = {
  testId: string;
  testTitle: string;
  href: string;
  requiresToken?: boolean;
  lockedLabel?: string;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
};

export function TestAccessButton({
  testId,
  testTitle,
  href,
  requiresToken = false,
  lockedLabel = "Enter token to access this test",
  className,
  children,
  ariaLabel,
}: TestAccessButtonProps) {
  const access = useTestAccess({ testId, requiresToken });

  if (!requiresToken || access.isUnlocked) {
    return (
      <Link aria-label={ariaLabel} className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button aria-label={ariaLabel} className={className} onClick={access.openDialog} type="button">
        {lockedLabel}
      </button>
      <TestTokenDialog
        error={access.error}
        isSubmitting={access.isSubmitting}
        onClose={access.closeDialog}
        onSubmit={access.verifyToken}
        open={access.isDialogOpen}
        testTitle={testTitle}
      />
    </>
  );
}
