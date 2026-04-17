import { LibraryBig, Star } from "lucide-react";

import { type VocabCard } from "@/components/vocab/VocabBoardProvider";
import { AddCardComposer } from "@/components/vocab/AddCardComposer";
import { EditableVocabCard } from "@/components/vocab/EditableVocabCard";
import { BoardColumnShell, BoardEmptyState, ColumnHeader } from "@/components/vocab/VocabBoardPrimitives";

type VocabInboxColumnProps = {
  hydrated: boolean;
  cards: VocabCard[];
  isComposerOpen: boolean;
  draftValue: string;
  editingCardId: string | null;
  dictionaryLookupByCardId: Record<string, { status: "idle" | "loading" | "success" | "error"; message?: string }>;
  onDraftChange: (value: string) => void;
  onOpenComposer: () => void;
  onCloseComposer: () => void;
  onAddCard: () => void;
  onEditCard: (card: VocabCard) => void;
  onFetchDefinition: (card: VocabCard) => void;
  onRemoveCard: (cardId: string) => void;
  onCardDragStart: (cardId: string) => void;
  onDropCard: () => void;
  onPractice: () => void;
};

export function VocabInboxColumn({
  hydrated,
  cards,
  isComposerOpen,
  draftValue,
  editingCardId,
  dictionaryLookupByCardId,
  onDraftChange,
  onOpenComposer,
  onCloseComposer,
  onAddCard,
  onEditCard,
  onFetchDefinition,
  onRemoveCard,
  onCardDragStart,
  onDropCard,
  onPractice,
}: VocabInboxColumnProps) {
  return (
    <BoardColumnShell
      accentClass="bg-paper-bg text-ink-fg"
      shellClass="border-ink-fg bg-surface-white"
      eyebrow={null}
      title={
        <ColumnHeader
          icon={<Star className="h-4 w-4" />}
          title="New Word"
          subtitle={`${cards.length} cards`}
          className="bg-paper-bg text-ink-fg"
          hideDefaultMenu={cards.length === 0}
          menuButton={cards.length > 0 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPractice();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-fg bg-paper-bg text-ink-fg transition workbook-press"
              title="Practice New Word"
            >
              <LibraryBig className="h-4 w-4" />
            </button>
          ) : null}
        />
      }
      onDrop={onDropCard}
    >
      {!hydrated ? (
        <BoardEmptyState text="Loading..." />
      ) : cards.length === 0 ? (
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
          <BoardEmptyState text="No words saved yet." onClick={onOpenComposer} />
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
      {cards.length > 0 || !isComposerOpen ? (
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
  );
}
