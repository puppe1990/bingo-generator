import { describe, expect, it } from 'vitest'
import { BINGO_WORDS, GRID_COLUMNS, GRID_ROWS } from '../data/words'
import {
  buildCard,
  buildUniqueCards,
  mulberry32,
  shuffleWords,
  toGrid
} from './bingo'

describe('bingo helpers', () => {
  it('keeps all words and changes order deterministically with a seeded rng', () => {
    const words = ['A', 'B', 'C', 'D']
    const random = mulberry32(123)

    const shuffled = shuffleWords(words, random)

    expect(shuffled).toHaveLength(words.length)
    expect([...shuffled].sort()).toEqual(words)
    expect(shuffled).toEqual(['B', 'C', 'A', 'D'])
  })

  it('builds a 4x4 card without repeated words', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(42))

    expect(card).toHaveLength(GRID_COLUMNS * GRID_ROWS)
    expect(new Set(card).size).toBe(card.length)
    expect(card.every((word) => BINGO_WORDS.includes(word))).toBe(true)
  })

  it('builds multiple unique cards', () => {
    const cards = buildUniqueCards(5, BINGO_WORDS, 100)

    expect(cards).toHaveLength(5)
    expect(new Set(cards.map((card) => card.join('|'))).size).toBe(5)
    expect(cards.every((card) => new Set(card).size === card.length)).toBe(true)
  })

  it('converts a card to a 4x4 grid', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(7))
    const grid = toGrid(card)

    expect(grid).toHaveLength(GRID_ROWS)
    expect(grid.every((row) => Array.isArray(row))).toBe(true)
    expect(grid.every((row) => row.length === GRID_COLUMNS)).toBe(true)
    expect(grid.flat()).toEqual(card)
  })
})
