import { BookOpenCheck, LoaderCircle, Volume2, X } from "lucide-react";

import type { VocabCard } from "@/components/vocab/VocabBoardProvider";
import { playVocabPronunciation } from "@/components/vocab/pronunciation";

type VocabCardEditorDialogProps = {
  card: VocabCard | null;
  editingDefinition: string;
  dictionaryStatus?: {
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  };
  onEditingDefinitionChange: (value: string) => void;
  onFetchDefinition: () => void;
  onSave: () => void;
  onClose: () => void;
};

export function VocabCardEditorDialog({
  card,
  editingDefinition,
  dictionaryStatus,
  onEditingDefinitionChange,
  onFetchDefinition,
  onSave,
  onClose,
}: VocabCardEditorDialogProps) {
  if (!card) {
    return null;
  }

  const helperToneClass =
    dictionaryStatus?.status === "error"
      ? "text-accent-3"
      : dictionaryStatus?.status === "success"
        ? "text-accent-2"
        : "text-ink-fg/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-fg/20 px-4 py-6" onClick={onClose}>
        <div
          className="w-full max-w-2xl rounded-[2rem] border-4 border-ink-fg bg-surface-white p-5 brutal-shadow-lg sm:p-6"
          onClick={(event) => event.stopPropagation()}
        >
        <div className="flex items-start justify-between gap-4 pb-1">
          <div>
            <div className="workbook-sticker bg-accent-1 text-ink-fg">Edit Card</div>
            <div className="mt-3 flex items-center gap-2">
              <div className="text-[22px] font-black tracking-[-0.03em] text-ink-fg">{card.term}</div>
              {card.audioUrl ? (
                <button
                  type="button"
                  onClick={() => playVocabPronunciation(card.term, card.audioUrl)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-fg bg-paper-bg text-ink-fg transition workbook-press"
                  title={`Play ${card.term}`}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink-fg bg-paper-bg text-ink-fg transition workbook-press"
            aria-label="Close vocab editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-[12px] font-bold uppercase tracking-[0.16em] text-ink-fg/70">Definition</label>
              <button
                type="button"
                onClick={onFetchDefinition}
                disabled={dictionaryStatus?.status === "loading"}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-fg bg-accent-1 px-3 py-1.5 text-[12px] font-bold text-ink-fg transition workbook-press disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dictionaryStatus?.status === "loading" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <BookOpenCheck className="h-3.5 w-3.5" />}
                Fetch definition
              </button>
            </div>
            <textarea
              value={editingDefinition}
              onChange={(event) => onEditingDefinitionChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onClose();
                }

                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  onSave();
                }
              }}
              className="min-h-[180px] w-full resize-y rounded-[16px] border-2 border-ink-fg bg-paper-bg px-4 py-3 text-[15px] leading-6 text-ink-fg outline-none"
              placeholder="Definition, nuance, or example"
            />
            {dictionaryStatus?.message ? <div className={`mt-2 text-[12px] font-medium ${helperToneClass}`}>{dictionaryStatus.message}</div> : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t-4 border-ink-fg pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-ink-fg bg-surface-white px-4 py-2 text-[13px] font-bold text-ink-fg transition workbook-press"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full border-2 border-ink-fg bg-primary px-4 py-2 text-[13px] font-bold text-ink-fg transition workbook-press"
          >
            Save card
          </button>
        </div>
      </div>
    </div>
  );
}
