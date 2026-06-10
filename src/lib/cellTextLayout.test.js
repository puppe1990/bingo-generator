import { describe, expect, it } from 'vitest'
import { TEMPLATE_CELL_HEIGHT, TEMPLATE_CELL_WIDTH } from '../data/template'
import { fitWordInCell, measureTextWidth } from './cellTextLayout'

describe('measureTextWidth', () => {
  it('estimates wider text for longer words', () => {
    const shortWidth = measureTextWidth('Body', 16)
    const longWidth = measureTextWidth('Protetor de Berço', 16)

    expect(longWidth).toBeGreaterThan(shortWidth)
  })
})

describe('fitWordInCell', () => {
  const cellWidth = TEMPLATE_CELL_WIDTH
  const cellHeight = TEMPLATE_CELL_HEIGHT

  it('keeps short words on one line at the base font size', () => {
    const layout = fitWordInCell('Body', cellWidth, cellHeight)

    expect(layout.lines).toEqual(['Body'])
    expect(layout.fontSizePx).toBe(18)
  })

  it('wraps long phrases to fit inside the cell width', () => {
    const layout = fitWordInCell('Protetor de Berço', cellWidth, cellHeight)
    const innerWidth = cellWidth - 10

    expect(layout.lines.length).toBeGreaterThan(1)
    layout.lines.forEach((line) => {
      expect(measureTextWidth(line, layout.fontSizePx)).toBeLessThanOrEqual(
        innerWidth + 1
      )
    })
  })

  it('wraps medium phrases onto multiple lines inside the cell height', () => {
    const layout = fitWordInCell('Lenço Umedecido', cellWidth, cellHeight)
    const innerHeight = cellHeight - 10
    const lineHeight = layout.fontSizePx * 1.1
    const blockHeight = layout.lines.length * lineHeight

    expect(layout.lines.length).toBeGreaterThan(1)
    expect(blockHeight).toBeLessThanOrEqual(innerHeight + 1)
  })

  it('reduces font size when wrapped text would overflow a shorter cell', () => {
    const layout = fitWordInCell('Protetor de Berço', cellWidth, 48)

    expect(layout.fontSizePx).toBeLessThan(18)
  })

  it('fits the longest bingo words inside the template cell', () => {
    const longWords = [
      'Protetor de Berço',
      'Lenço Umedecido',
      'Carrinho de Bebê',
      'Babá Eletrônica',
      'Pano de Boca'
    ]

    longWords.forEach((word) => {
      const layout = fitWordInCell(word, cellWidth, cellHeight)
      const innerWidth = cellWidth - 10
      const innerHeight = cellHeight - 10
      const lineHeight = layout.fontSizePx * 1.1

      layout.lines.forEach((line) => {
        expect(measureTextWidth(line, layout.fontSizePx)).toBeLessThanOrEqual(
          innerWidth + 1
        )
      })
      expect(layout.lines.length * lineHeight).toBeLessThanOrEqual(
        innerHeight + 1
      )
    })
  })
})
