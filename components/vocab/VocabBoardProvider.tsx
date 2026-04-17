"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { setClientCache } from "@/lib/clientCache";
import {
  fetchVocabBoardFromServer,
  getVocabBoardServerCacheKey,
  getVocabBoardStorageKey,
  persistVocabBoardToServer,
  readVocabBoardFromLocalStorage,
  VOCAB_BOARD_CACHE_TTL_MS,
} from "@/lib/services/vocabBoardClientService";
import { parseDraftToCardFields } from "@/components/vocab/flashCardUtils";
import {
  addVocabCardToBoard,
  emptyVocabBoard,
  isVocabBoardEmpty,
  normalizeVocabBoard,
  moveVocabCardBetweenBuckets,
  normalizeVocabText,
  DEFAULT_VOCAB_COLUMN_COLOR_KEYS,
  VOCAB_COLUMN_COLOR_KEYS,
  MAX_VOCAB_DEFINITION_LENGTH,
  type VocabBoardState,
  type VocabColumnColorKey,
} from "@/lib/vocabBoard";

export {
  VOCAB_COLUMN_COLOR_KEYS,
  type VocabBoardState,
  type VocabCard,
  type VocabColumn,
  type VocabColumnColorKey,
} from "@/lib/vocabBoard";

type VocabBoardContextValue = {
  board: VocabBoardState;
  hydrated: boolean;
  addVocabCard: (text: string, sourceQuestionId?: string, destination?: string) => string | null;
  createColumn: (title: string) => string | null;
  moveCard: (cardId: string, destination: string) => void;
  updateCard: (cardId: string, nextCard: { term: string; definition: string; audioUrl?: string }) => void;
  removeCard: (cardId: string) => void;
  updateColumnTitle: (columnId: string, title: string) => void;
  updateColumnColor: (columnId: string, colorKey: VocabColumnColorKey) => void;
  removeColumn: (columnId: string) => void;
  reorderColumns: (draggedColumnId: string, targetColumnId: string, position: "before" | "after") => void;
};

const VocabBoardContext = createContext<VocabBoardContextValue | null>(null);

export function VocabBoardProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const idRef = useRef(0);
  const lastPersistedRef = useRef("");
  const [board, setBoard] = useState<VocabBoardState>(emptyVocabBoard);
  const [hydrated, setHydrated] = useState(false);

  const storageKey = useMemo(() => {
    return getVocabBoardStorageKey({
      userEmail: session?.user?.email,
      userId: session?.user?.id,
    });
  }, [session?.user?.email, session?.user?.id]);
  const serverCacheKey = useMemo(
    () =>
      getVocabBoardServerCacheKey({
        userEmail: session?.user?.email,
        userId: session?.user?.id,
      }),
    [session?.user?.email, session?.user?.id],
  );

  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (status === "loading" || typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    const loadBoard = async () => {
      setHydrated(false);

      if (!isAuthenticated) {
        const localBoard = readVocabBoardFromLocalStorage(storageKey);
        if (!cancelled) {
          setBoard(localBoard);
          lastPersistedRef.current = JSON.stringify(localBoard);
          setHydrated(true);
        }
        return;
      }

      try {
        const serverBoard = await fetchVocabBoardFromServer(serverCacheKey);
        const localBoard = readVocabBoardFromLocalStorage(storageKey);
        const nextBoard = isVocabBoardEmpty(serverBoard) && !isVocabBoardEmpty(localBoard) ? localBoard : serverBoard;

        if (!cancelled) {
          setBoard(nextBoard);
          lastPersistedRef.current = JSON.stringify(nextBoard);
          setHydrated(true);
        }

        if (nextBoard === localBoard) {
          await persistVocabBoardToServer(nextBoard);
          setClientCache(serverCacheKey, nextBoard, VOCAB_BOARD_CACHE_TTL_MS);
          window.localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.error("Failed to hydrate vocab board from server:", error);
        const localBoard = readVocabBoardFromLocalStorage(storageKey);
        if (!cancelled) {
          setBoard(localBoard);
          lastPersistedRef.current = JSON.stringify(localBoard);
          setHydrated(true);
        }
      }
    };

    void loadBoard();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, serverCacheKey, status, storageKey]);

  useEffect(() => {
    if (!hydrated || status === "loading" || typeof window === "undefined") {
      return;
    }

    const serializedBoard = JSON.stringify(board);
    if (serializedBoard === lastPersistedRef.current) {
      return;
    }

    if (!isAuthenticated) {
      window.localStorage.setItem(storageKey, serializedBoard);
      lastPersistedRef.current = serializedBoard;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void persistVocabBoardToServer(board)
        .then(() => {
          lastPersistedRef.current = serializedBoard;
          setClientCache(serverCacheKey, board, VOCAB_BOARD_CACHE_TTL_MS);
        })
        .catch((error) => {
          console.error("Failed to persist vocab board:", error);
        });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [board, hydrated, isAuthenticated, serverCacheKey, status, storageKey]);

  const value = useMemo<VocabBoardContextValue>(
    () => ({
      board,
      hydrated,
      addVocabCard: (text, sourceQuestionId, destination = "inbox") => {
        const parsedDraft = parseDraftToCardFields(text);
        const normalizedTerm = normalizeText(parsedDraft.term);
        const normalizedDefinition = normalizeDefinition(parsedDraft.definition);
        if (!normalizedTerm) {
          return null;
        }

        let addedCardId: string | null = null;

        setBoard((previous) => {
          const duplicateId = findDuplicateCardId(previous, normalizedTerm);
          if (duplicateId) {
            addedCardId = duplicateId;
            const duplicateCard = previous.cards[duplicateId];
            const nextBoard =
              duplicateCard && !duplicateCard.definition && normalizedDefinition
                ? {
                    ...previous,
                    cards: {
                      ...previous.cards,
                      [duplicateId]: {
                        ...duplicateCard,
                        definition: normalizedDefinition,
                        audioUrl: duplicateCard.audioUrl,
                      },
                    },
                  }
                : previous;

            return moveCardBetweenBuckets(nextBoard, duplicateId, destination);
          }

          const id = createUniqueId("vocab", idRef);
          addedCardId = id;
          const nextBoard: VocabBoardState = {
            ...previous,
            cards: {
              ...previous.cards,
                [id]: {
                  id,
                  term: normalizedTerm,
                  definition: normalizedDefinition,
                  audioUrl: undefined,
                  createdAt: new Date().toISOString(),
                  sourceQuestionId,
                },
            },
            inboxIds: previous.inboxIds,
            columns: previous.columns,
          };

          return moveCardBetweenBuckets(
            {
              ...nextBoard,
              inboxIds: [...previous.inboxIds, id],
            },
            id,
            destination,
          );
        });

        return addedCardId;
      },
      createColumn: (title) => {
        const normalizedTitle = title.trim();
        if (!normalizedTitle) {
          return null;
        }

        const columnId = createUniqueId("column", idRef);
        setBoard((previous) => ({
          ...previous,
          columns: [
            ...previous.columns,
            {
              id: columnId,
              title: normalizedTitle,
              cardIds: [],
              colorKey: DEFAULT_VOCAB_COLUMN_COLOR_KEYS[previous.columns.length % DEFAULT_VOCAB_COLUMN_COLOR_KEYS.length],
            },
          ],
        }));
        return columnId;
      },
      moveCard: (cardId, destination) => {
        setBoard((previous) => moveVocabCardBetweenBuckets(previous, cardId, destination));
      },
      updateCard: (cardId, nextCard) => {
        const normalizedTerm = normalizeText(nextCard.term);
        const normalizedDefinition = normalizeDefinition(nextCard.definition);
        const normalizedAudioUrl = nextCard.audioUrl?.trim() || undefined;
        if (!normalizedTerm) {
          return;
        }

        setBoard((previous) => {
          const card = previous.cards[cardId];
          if (!card) {
            return previous;
          }

          return {
            ...previous,
            cards: {
              ...previous.cards,
                [cardId]: {
                  ...card,
                  term: normalizedTerm,
                  definition: normalizedDefinition,
                  audioUrl: normalizedAudioUrl ?? card.audioUrl,
                },
              },
            };
        });
      },
      removeCard: (cardId) => {
        setBoard((previous) => {
          if (!previous.cards[cardId]) {
            return previous;
          }

          const nextCards = { ...previous.cards };
          delete nextCards[cardId];

          return {
            ...previous,
            cards: nextCards,
            inboxIds: previous.inboxIds.filter((id) => id !== cardId),
            columns: previous.columns.map((column) => ({
              ...column,
              cardIds: column.cardIds.filter((id) => id !== cardId),
            })),
          };
        });
      },
      updateColumnTitle: (columnId, title) => {
        const normalizedTitle = title.trim();
        if (!normalizedTitle) {
          return;
        }

        setBoard((previous) => ({
          ...previous,
          columns: previous.columns.map((column) =>
            column.id === columnId ? { ...column, title: normalizedTitle } : column,
          ),
        }));
      },
      updateColumnColor: (columnId, colorKey) => {
        setBoard((previous) => ({
          ...previous,
          columns: previous.columns.map((column) =>
            column.id === columnId ? { ...column, colorKey } : column,
          ),
        }));
      },
      removeColumn: (columnId) => {
        setBoard((previous) => {
          const targetColumn = previous.columns.find((column) => column.id === columnId);
          if (!targetColumn) {
            return previous;
          }

          const movedInboxIds = [...previous.inboxIds, ...targetColumn.cardIds.filter((id) => !previous.inboxIds.includes(id))];

          return {
            ...previous,
            inboxIds: movedInboxIds,
            columns: previous.columns.filter((column) => column.id !== columnId),
          };
        });
      },
      reorderColumns: (draggedColumnId, targetColumnId, position) => {
        if (draggedColumnId === targetColumnId) {
          return;
        }

        setBoard((previous) => {
          const draggedIndex = previous.columns.findIndex((column) => column.id === draggedColumnId);
          const targetIndex = previous.columns.findIndex((column) => column.id === targetColumnId);

          if (draggedIndex === -1 || targetIndex === -1) {
            return previous;
          }

          const nextColumns = [...previous.columns];
          const [draggedColumn] = nextColumns.splice(draggedIndex, 1);
          const adjustedTargetIndex = nextColumns.findIndex((column) => column.id === targetColumnId);
          const insertionIndex = position === "before" ? adjustedTargetIndex : adjustedTargetIndex + 1;
          nextColumns.splice(insertionIndex, 0, draggedColumn);

          return {
            ...previous,
            columns: nextColumns,
          };
        });
      },
    }),
    [board, hydrated],
  );

  return <VocabBoardContext.Provider value={value}>{children}</VocabBoardContext.Provider>;
}

export function useVocabBoard() {
  const context = useContext(VocabBoardContext);
  if (!context) {
    throw new Error("useVocabBoard must be used within VocabBoardProvider");
  }

  return context;
}

function moveCardBetweenBuckets(board: VocabBoardState, cardId: string, destination: string) {
  if (!board.cards[cardId]) {
    return board;
  }

  const nextBoard: VocabBoardState = {
    ...board,
    inboxIds: board.inboxIds.filter((id) => id !== cardId),
    columns: board.columns.map((column) => ({
      ...column,
      cardIds: column.cardIds.filter((id) => id !== cardId),
    })),
  };

  if (destination === "inbox") {
    return {
      ...nextBoard,
      inboxIds: [...nextBoard.inboxIds, cardId],
    };
  }

  return {
    ...nextBoard,
    columns: nextBoard.columns.map((column) =>
      column.id === destination ? { ...column, cardIds: [...column.cardIds, cardId] } : column,
    ),
  };
}

function findDuplicateCardId(board: VocabBoardState, normalizedText: string) {
  return Object.values(board.cards).find((card) => normalizeText(card.term).toLowerCase() === normalizedText.toLowerCase())?.id;
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function useOptionalVocabBoard() {
  return useContext(VocabBoardContext);
}

function normalizeDefinition(text: string) {
  return normalizeText(text).slice(0, MAX_VOCAB_DEFINITION_LENGTH);
}

function createUniqueId(prefix: string, idRef: React.MutableRefObject<number>) {
  idRef.current += 1;
  return `${prefix}-${Date.now()}-${idRef.current}`;
}
