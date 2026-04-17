import type { VocabCard } from "@/components/vocab/VocabBoardProvider";

export function parseFlashCard(card: VocabCard) {
  return {
    vocabulary: card.term,
    meaning: card.definition,
    audioUrl: card.audioUrl,
  };
}

export function parseDraftToCardFields(text: string) {
  const normalized = text.trim();
  const separatorMatch = normalized.match(/\s*[:\uFF1A]\s*/);

  if (!separatorMatch || separatorMatch.index === undefined) {
    return {
      term: normalized,
      definition: "",
    };
  }

  const separatorStart = separatorMatch.index;
  const separatorEnd = separatorStart + separatorMatch[0].length;

  return {
    term: normalized.slice(0, separatorStart).trim() || normalized,
    definition: normalized.slice(separatorEnd).trim(),
  };
}

export function formatCardDraft(term: string, definition: string) {
  const normalizedTerm = term.trim();
  const normalizedDefinition = definition.trim();

  if (!normalizedDefinition) {
    return normalizedTerm;
  }

  return `${normalizedTerm}: ${normalizedDefinition}`;
}
