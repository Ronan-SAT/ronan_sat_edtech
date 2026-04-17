import type { DragEvent, RefObject } from "react";
import { LibraryBig, MoreHorizontal } from "lucide-react";

import { DEFAULT_VOCAB_COLUMN_COLOR_KEYS } from "@/lib/vocabBoard";
import {
  VOCAB_COLUMN_COLOR_KEYS,
  type VocabCard,
  type VocabColumn,
  type VocabColumnColorKey,
} from "@/components/vocab/VocabBoardProvider";
import { AddCardComposer } from "@/components/vocab/AddCardComposer";
import { EditableVocabCard } from "@/components/vocab/EditableVocabCard";
import {
  BoardColumnShell,
  BoardEmptyState,
  ColumnDropIndicator,
  ColumnHeader,
  ColumnStack,
} from "@/components/vocab/VocabBoardPrimitives";
import { COLUMN_THEME } from "@/components/vocab/vocabPageTheme";

type VocabColumnProps = {
  column: VocabColumn;
  columnIndex: number;
  cards: VocabCard[];
  showBefore: boolean;
  showAfter: boolean;
  isDragging: boolean;
  isComposerOpen: boolean;
  draftValue: string;
  editingCardId: string | null;
  editingColumnId: string | null;
  editingColumnTitle: string;
  openMenuColumnId: string | null;
  dictionaryLookupByCardId: Record<string, { status: "idle" | "loading" | "success" | "error"; message?: string }>;
  menuRef: RefObject<HTMLDivElement | null>;
  onDraftChange: (value: string) => void;
  onOpenComposer: () => void;
  onCloseComposer: () => void;
  onAddCard: () => void;
  onEditCard: (card: VocabCard) => void;
  onFetchDefinition: (card: VocabCard) => void;
  onRemoveCard: (cardId: string) => void;
  onCardDragStart: (cardId: string) => void;
  onPractice: () => void;
  onColumnTitleChange: (value: string) => void;
  onSaveColumnEdit: () => void;
  onCancelColumnEdit: () => void;
  onStartColumnEdit: () => void;
  onToggleMenu: (columnId: string) => void;
  onUpdateColumnColor: (columnId: string, colorKey: VocabColumnColorKey) => void;
  onRemoveColumn: (columnId: string) => void;
  onDropCard: () => void;
  onHeaderDragStart: (event: DragEvent, columnId: string) => void;
  onHeaderDragEnd: () => void;
  onHeaderDragOver: (event: DragEvent, columnId: string) => void;
  onHeaderDrop: (event: DragEvent, columnId: string) => void;
};

export function VocabColumn({
  column,
  columnIndex,
  cards,
  showBefore,
  showAfter,
  isDragging,
  isComposerOpen,
  draftValue,
  editingCardId,
  editingColumnId,
  editingColumnTitle,
  openMenuColumnId,
  dictionaryLookupByCardId,
  menuRef,
  onDraftChange,
  onOpenComposer,
  onCloseComposer,
  onAddCard,
  onEditCard,
  onFetchDefinition,
  onRemoveCard,
  onCardDragStart,
  onPractice,
  onColumnTitleChange,
  onSaveColumnEdit,
  onCancelColumnEdit,
  onStartColumnEdit,
  onToggleMenu,
  onUpdateColumnColor,
  onRemoveColumn,
  onDropCard,
  onHeaderDragStart,
  onHeaderDragEnd,
  onHeaderDragOver,
  onHeaderDrop,
}: VocabColumnProps) {
  const resolvedColorKey =
    column.colorKey === "sand"
      ? DEFAULT_VOCAB_COLUMN_COLOR_KEYS[columnIndex % DEFAULT_VOCAB_COLUMN_COLOR_KEYS.length]
      : column.colorKey;
  const theme = COLUMN_THEME[resolvedColorKey];
  const isEditingColumn = editingColumnId === column.id;
  const isMenuOpen = openMenuColumnId === column.id;

  return (
    <ColumnStack>
      {showBefore ? <ColumnDropIndicator /> : null}
      <BoardColumnShell
        accentClass={theme.accent}
        shellClass={theme.shell}
        isDragging={isDragging}
        eyebrow={null}
        title={
          isEditingColumn ? (
            <div className="rounded-[14px] border-2 border-ink-fg bg-surface-white p-2 brutal-shadow-sm">
              <input
                autoFocus
                value={editingColumnTitle}
                onChange={(event) => onColumnTitleChange(event.target.value)}
                onBlur={onSaveColumnEdit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSaveColumnEdit();
                  }

                  if (event.key === "Escape") {
                    onCancelColumnEdit();
                  }
                }}
                className="w-full bg-transparent text-[13px] font-semibold uppercase tracking-[0.04em] text-inherit outline-none"
              />
            </div>
          ) : (
            <ColumnHeader
              title={column.title}
              subtitle={`${cards.length} cards`}
              className={theme.header}
              menuButton={
                <div className="flex items-center gap-1.5">
                  {cards.length > 0 ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPractice();
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-fg bg-paper-bg text-ink-fg transition workbook-press"
                      title={`Practice ${column.title}`}
                    >
                      <LibraryBig className="h-4 w-4" />
                    </button>
                  ) : null}

                  <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleMenu(column.id);
                      }}
                      className="rounded-full border-2 border-ink-fg bg-surface-white p-1 text-ink-fg transition workbook-press"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {isMenuOpen ? (
                      <div className="absolute right-0 top-10 z-20 w-44 rounded-[16px] border-2 border-ink-fg bg-surface-white p-2 brutal-shadow">
                        <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-fg/70">
                          Column Color
                        </div>
                        <div className="flex flex-wrap gap-2 px-2 pb-2">
                          {VOCAB_COLUMN_COLOR_KEYS.map((colorKey) => (
                            <button
                              key={colorKey}
                              type="button"
                              onClick={() => onUpdateColumnColor(column.id, colorKey)}
                              className={`h-7 w-7 rounded-full border-2 border-ink-fg ${COLUMN_THEME[colorKey].accent} ${
                                colorKey === column.colorKey ? "ring-2 ring-ink-fg/35" : ""
                              }`}
                              title={`Change color ${colorKey}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveColumn(column.id)}
                          className="flex w-full items-center rounded-[12px] border-2 border-transparent px-3 py-2 text-left text-[13px] font-medium text-accent-3 transition hover:border-ink-fg hover:bg-paper-bg"
                        >
                          Delete Column
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              }
            />
          )
        }
        onDrop={onDropCard}
        headerDraggable
        onHeaderClick={onStartColumnEdit}
        onHeaderDragStart={(event) => onHeaderDragStart(event, column.id)}
        onHeaderDragEnd={onHeaderDragEnd}
        onHeaderDragOver={(event) => onHeaderDragOver(event, column.id)}
        onHeaderDrop={(event) => onHeaderDrop(event, column.id)}
      >
        {column.cardIds.length === 0 ? (
          isComposerOpen ? (
            <AddCardComposer
              isOpen
              value={draftValue}
              placeholder="Add the first card"
              variant="empty"
              onOpen={() => undefined}
              onClose={onCloseComposer}
              onChange={onDraftChange}
              onAdd={onAddCard}
            />
          ) : (
            <BoardEmptyState text="No cards yet." onClick={onOpenComposer} />
          )
        ) : (
          cards.map((card) => (
            <EditableVocabCard
              key={card.id}
              card={card}
              isEditing={editingCardId === card.id}
              dictionaryStatus={dictionaryLookupByCardId[card.id]}
              onEdit={() => onEditCard(card)}
              onFetchDefinition={() => onFetchDefinition(card)}
              onRemove={() => onRemoveCard(card.id)}
              onDragStart={onCardDragStart}
            />
          ))
        )}
        {column.cardIds.length > 0 || !isComposerOpen ? (
          <AddCardComposer
            isOpen={isComposerOpen}
            value={draftValue}
            onOpen={onOpenComposer}
            onClose={onCloseComposer}
            onChange={onDraftChange}
            onAdd={onAddCard}
          />
        ) : null}
      </BoardColumnShell>
      {showAfter ? <ColumnDropIndicator /> : null}
    </ColumnStack>
  );
}
