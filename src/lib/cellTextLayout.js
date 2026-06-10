const CELL_PADDING_PX = 10
const DEFAULT_BASE_FONT_SIZE_PX = 18
const DEFAULT_MIN_FONT_SIZE_PX = 8
const LINE_HEIGHT_RATIO = 1.1
const AVERAGE_CHAR_WIDTH_RATIO = 0.52
const SPACE_WIDTH_RATIO = 0.28

export function measureTextWidth(text, fontSizePx) {
  return [...text].reduce((total, character) => {
    if (character === ' ') {
      return total + fontSizePx * SPACE_WIDTH_RATIO
    }

    return total + fontSizePx * AVERAGE_CHAR_WIDTH_RATIO
  }, 0)
}

export function wrapWordLines(word, maxWidthPx, fontSizePx) {
  const parts = word.split(' ')
  const lines = []
  let currentLine = ''

  parts.forEach((part) => {
    const candidate = currentLine ? `${currentLine} ${part}` : part

    if (measureTextWidth(candidate, fontSizePx) <= maxWidthPx) {
      currentLine = candidate
      return
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    currentLine = part
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length > 0 ? lines : [word]
}

function fitsInCell(lines, fontSizePx, innerWidthPx, innerHeightPx) {
  const lineHeight = fontSizePx * LINE_HEIGHT_RATIO
  const blockHeight = lines.length * lineHeight

  if (blockHeight > innerHeightPx) {
    return false
  }

  return lines.every(
    (line) => measureTextWidth(line, fontSizePx) <= innerWidthPx
  )
}

export function fitWordInCell(word, cellWidthPx, cellHeightPx, options = {}) {
  const baseFontSizePx = options.baseFontSizePx ?? DEFAULT_BASE_FONT_SIZE_PX
  const minFontSizePx = options.minFontSizePx ?? DEFAULT_MIN_FONT_SIZE_PX
  const innerWidthPx = cellWidthPx - CELL_PADDING_PX
  const innerHeightPx = cellHeightPx - CELL_PADDING_PX

  for (
    let fontSizePx = baseFontSizePx;
    fontSizePx >= minFontSizePx;
    fontSizePx -= 0.5
  ) {
    const lines = wrapWordLines(word, innerWidthPx, fontSizePx)

    if (fitsInCell(lines, fontSizePx, innerWidthPx, innerHeightPx)) {
      return { fontSizePx, lines }
    }
  }

  const fallbackFontSizePx = minFontSizePx
  const fallbackLines = wrapWordLines(word, innerWidthPx, fallbackFontSizePx)

  return {
    fontSizePx: fallbackFontSizePx,
    lines: fallbackLines
  }
}
