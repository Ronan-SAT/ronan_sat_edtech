import { NextResponse } from "next/server";

type DictionaryEntry = {
  phonetics?: Array<{
    audio?: string;
  }>;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{
      definition?: string;
      example?: string;
    }>;
  }>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term")?.trim() ?? "";

  if (!term) {
    return NextResponse.json({ error: "Missing term" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Definition not found" }, { status: 404 });
    }

    const payload = (await response.json()) as DictionaryEntry[];
    const definition = extractDefinition(payload);
    const audioUrl = extractAudioUrl(payload);

    if (!definition) {
      return NextResponse.json({ error: "Definition not found" }, { status: 404 });
    }

    return NextResponse.json({ definition, audioUrl }, { status: 200 });
  } catch (error) {
    console.error("GET /api/vocab/dictionary error:", error);
    return NextResponse.json({ error: "Failed to fetch definition" }, { status: 500 });
  }
}

function extractDefinition(entries: DictionaryEntry[]) {
  for (const entry of entries) {
    for (const meaning of entry.meanings ?? []) {
      for (const definition of meaning.definitions ?? []) {
        const definitionText = definition.definition?.trim();
        if (!definitionText) {
          continue;
        }

        const partOfSpeech = meaning.partOfSpeech?.trim();
        const example = definition.example?.trim();
        const formattedParts = [partOfSpeech ? `${partOfSpeech}. ${definitionText}` : definitionText];

        if (example) {
          formattedParts.push(`Example: ${example}`);
        }

        return formattedParts.join("\n");
      }
    }
  }

  return "";
}

function extractAudioUrl(entries: DictionaryEntry[]) {
  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      const candidate = phonetic.audio?.trim();
      if (candidate) {
        return candidate;
      }
    }
  }

  return undefined;
}
