import { BINGO_WORDS, GRID_COLUMNS, GRID_ROWS } from '../data/words'

export function mulberry32(seed) {
  let value = seed >>> 0

  return function random() {
    value += 0x6d2b79f5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffleWords(words, random = Math.random) {
  const next = [...words]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

export function buildCard(words = BINGO_WORDS, random = Math.random) {
  const expectedSize = GRID_COLUMNS * GRID_ROWS

  if (words.length < expectedSize) {
    throw new Error(`Expected at least ${expectedSize} words, received ${words.length}.`)
  }

  return shuffleWords(words, random).slice(0, expectedSize)
}

export function buildUniqueCards(count, words = BINGO_WORDS, seed = Date.now()) {
  if (count < 1) {
    throw new Error('Card count must be at least 1.')
  }

  const seen = new Set()
  const cards = []
  let attempts = 0
  const maxAttempts = count * 50

  while (cards.length < count) {
    if (attempts >= maxAttempts) {
      throw new Error('Unable to build enough unique cards.')
    }

    const random = mulberry32(seed + attempts)
    const card = buildCard(words, random)
    const signature = card.join('|')

    if (!seen.has(signature)) {
      seen.add(signature)
      cards.push(card)
    }

    attempts += 1
  }

  return cards
}

export function toGrid(card) {
  return Array.from({ length: GRID_ROWS }, (_, rowIndex) => {
    const start = rowIndex * GRID_COLUMNS
    return card.slice(start, start + GRID_COLUMNS)
  })
}
