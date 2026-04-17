export function playVocabPronunciation(term: string, audioUrl?: string) {
  if (audioUrl && typeof Audio !== "undefined") {
    const audio = new Audio(audioUrl);
    void audio.play().catch(() => {
      speakVocabulary(term);
    });
    return;
  }

  speakVocabulary(term);
}

function speakVocabulary(vocabulary: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !vocabulary.trim()) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(vocabulary);
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}
