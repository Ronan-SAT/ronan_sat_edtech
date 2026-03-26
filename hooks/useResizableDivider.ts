"use client";

import { useState, useRef } from "react";

export function useResizableDivider(defaultWidth: number = 50) {
    // ── THÊM MỚI: Resizable divider state ──────────────────────────────────
    const [leftWidth, setLeftWidth] = useState(defaultWidth);          // % chiều rộng left panel, mặc định 50/50
    const isDragging = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Bắt đầu kéo thanh divider
    const handleDividerMouseDown = (e: React.MouseEvent | MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
            // Giới hạn từ 20% đến 80% để 2 panel không bị thu quá nhỏ
            setLeftWidth(Math.min(60, Math.max(30, newLeftWidth)));
        };

        const onMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };
    // ────────────────────────────────────────────────────────────────────────

    return {
        leftWidth,
        isDragging,
        containerRef,
        handleDividerMouseDown
    };
}