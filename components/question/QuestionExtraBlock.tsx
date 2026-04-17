import { getQuestionExtraSvgMarkup, parseQuestionExtraTable, type QuestionExtra } from "@/lib/questionExtra";

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

function clampColorChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHexColor(value: string): RgbColor | null {
  const hex = value.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) {
    return null;
  }

  const normalized = hex.length === 3 ? hex.split("").map((char) => `${char}${char}`).join("") : hex;
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function parseRgbColor(value: string): RgbColor | null {
  const match = value.trim().match(/^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);
  if (!match) {
    return null;
  }

  return {
    red: clampColorChannel(Number(match[1])),
    green: clampColorChannel(Number(match[2])),
    blue: clampColorChannel(Number(match[3])),
  };
}

function parseSvgColor(value: string): RgbColor | null {
  if (/^none$/i.test(value) || /^transparent$/i.test(value)) {
    return null;
  }

  if (/^white$/i.test(value)) {
    return { red: 255, green: 255, blue: 255 };
  }

  if (/^black$/i.test(value)) {
    return { red: 0, green: 0, blue: 0 };
  }

  return parseHexColor(value) ?? parseRgbColor(value);
}

function toHexColor({ red, green, blue }: RgbColor) {
  return `#${[red, green, blue].map((channel) => clampColorChannel(channel).toString(16).padStart(2, "0")).join("")}`;
}

function invertSvgColor(value: string, backgroundColor: string) {
  const parsed = parseSvgColor(value);
  if (!parsed) {
    return value;
  }

  const normalizedBackground = backgroundColor.trim().toLowerCase();
  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === normalizedBackground) {
    return value;
  }

  return toHexColor({
    red: 255 - parsed.red,
    green: 255 - parsed.green,
    blue: 255 - parsed.blue,
  });
}

function stripSvgCanvasBackground(svgMarkup: string, backgroundColor: string) {
  return svgMarkup
    .replace(/<svg\b([^>]*)style="([^"]*)background(?:-color)?:\s*[^;\"]+;?([^"]*)"([^>]*)>/i, "<svg$1style=\"$2$3\"$4>")
    .replace(/fill:\s*(?:#fff(?:fff)?|white|rgb\(255\s*,\s*255\s*,\s*255\))\s*;?/gi, `fill: ${backgroundColor};`)
    .replace(/stroke:\s*(?:#fff(?:fff)?|white|rgb\(255\s*,\s*255\s*,\s*255\))\s*;?/gi, `stroke: ${backgroundColor};`)
    .replace(/<rect\b([^>]*)\bfill="(?:#fff(?:fff)?|white|rgb\(255\s*,\s*255\s*,\s*255\))"([^>]*)\/>/i, `<rect$1fill="${backgroundColor}"$2/>`)
    .replace(/<rect\b([^>]*)\bfill="(?:#fff(?:fff)?|white|rgb\(255\s*,\s*255\s*,\s*255\))"([^>]*)><\/rect>/i, `<rect$1fill="${backgroundColor}"$2></rect>`)
    .replace(/fill="(?:#fff(?:fff)?|white|rgb\(255\s*,\s*255\s*,\s*255\))"/gi, `fill="${backgroundColor}"`)
    .replace(/stroke="(?:#fff(?:fff)?|white|rgb\(255\s*,\s*255\s*,\s*255\))"/gi, `stroke="${backgroundColor}"`);
}

function invertSvgForeground(svgMarkup: string, backgroundColor: string) {
  return svgMarkup
    .replace(/(fill|stroke)="([^"]+)"/gi, (match, property, colorValue) => {
      return `${property}="${invertSvgColor(colorValue, backgroundColor)}"`;
    })
    .replace(/(fill|stroke):\s*([^;"']+)/gi, (match, property, colorValue) => {
      return `${property}: ${invertSvgColor(colorValue.trim(), backgroundColor)}`;
    });
}

interface QuestionExtraBlockProps {
  extra?: QuestionExtra | null;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  figureBackgroundColor?: string;
  isDarkTheme?: boolean;
}

export default function QuestionExtraBlock({
  extra,
  className = "",
  titleClassName = "",
  contentClassName = "",
  figureBackgroundColor,
  isDarkTheme = false,
}: QuestionExtraBlockProps) {
  const table = parseQuestionExtraTable(extra);
  if (table) {
    return (
      <div className={className}>
        {table.title ? <div className={titleClassName}>{table.title}</div> : null}
        <div className="overflow-x-auto text-center">
          <table
            className={`inline-table w-auto min-w-0 max-w-full border-collapse text-left text-[13px] leading-[1.2] sm:text-[13px] ${contentClassName}`}
            style={{ backgroundColor: figureBackgroundColor }}
          >
            <thead>
              <tr>
                {table.headers.map((header, index) => (
                  <th
                    key={`${header}-${index}`}
                    className="px-2 py-1 text-[13px] font-semibold leading-[1.15] sm:px-2.5 sm:py-1.5 sm:text-[13px]"
                    style={{ border: "2px solid currentColor" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${rowIndex}-${cellIndex}`}
                      className="px-2 py-1 align-top text-[13px] font-normal leading-[1.15] sm:px-2.5 sm:py-1.5 sm:text-[13px]"
                      style={{ border: "2px solid currentColor" }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const svgMarkup = getQuestionExtraSvgMarkup(extra);
  if (!svgMarkup) {
    return null;
  }

  const normalizedBackgroundColor = figureBackgroundColor ?? "#ffffff";
  const backgroundAdjustedSvgMarkup = stripSvgCanvasBackground(
    svgMarkup,
    normalizedBackgroundColor,
  );
  const mergedSvgMarkup = isDarkTheme
    ? invertSvgForeground(backgroundAdjustedSvgMarkup, normalizedBackgroundColor)
    : backgroundAdjustedSvgMarkup;

  return (
    <div
      className={`${className} ${contentClassName} [&_svg]:h-auto [&_svg]:max-h-[360px] [&_svg]:w-full [&_svg]:max-w-full`}
      style={{ backgroundColor: figureBackgroundColor }}
      dangerouslySetInnerHTML={{ __html: mergedSvgMarkup }}
    />
  );
}
