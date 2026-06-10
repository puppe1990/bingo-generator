import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BingoCard from './BingoCard'
import { buildCard, mulberry32 } from '../lib/bingo'
import { BINGO_WORDS } from '../data/words'

describe('BingoCard', () => {
  it('renders the aquarela preview with a 4x4 word set', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(12))

    render(<BingoCard card={card} />)

    expect(screen.getByLabelText('Prévia da cartela')).toBeInTheDocument()
    expect(screen.getByAltText('Cartela aquarela do bingo')).toBeInTheDocument()
    expect(screen.getByText(card[0])).toBeInTheDocument()
    expect(screen.getByText(card[15])).toBeInTheDocument()
  })

  it('renders a custom background image when backgroundImage is provided', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(42))
    const customImage = 'data:image/png;base64,customimage'

    render(<BingoCard card={card} backgroundImage={customImage} />)

    const img = screen.getByAltText('Cartela aquarela do bingo')
    expect(img).toHaveAttribute('src', customImage)
  })

  it('falls back to the default aquarela when backgroundImage is not provided', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(42))

    render(<BingoCard card={card} />)

    const img = screen.getByAltText('Cartela aquarela do bingo')
    expect(img.getAttribute('src')).not.toBe('')
  })

  it('renders cells at custom positions when cellPositions is provided', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(12))
    const cellPositions = Array.from({ length: 16 }, (_, i) => ({
      x: 5 + (i % 4) * 25,
      y: 40 + Math.floor(i / 4) * 15
    }))

    render(<BingoCard card={card} cellPositions={cellPositions} />)

    const firstCell = screen.getByText(card[0]).closest('[style]')
    expect(firstCell.style.left).toBe('5%')
    expect(firstCell.style.top).toBe('40%')
  })

  it('calls onCellDrag with new position when a cell is dragged', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(12))
    const onCellDrag = vi.fn()

    render(<BingoCard card={card} onCellDrag={onCellDrag} />)

    const container = screen.getByTestId('card-canvas')
    container.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 675,
      height: 953,
      right: 675,
      bottom: 953,
      x: 0,
      y: 0,
      toJSON() {}
    })

    const cellElement = screen.getByText(card[0]).closest('[style]')

    fireEvent.mouseDown(cellElement, { clientX: 50, clientY: 50 })
    fireEvent.mouseMove(document, { clientX: 150, clientY: 100 })
    fireEvent.mouseUp(document)

    expect(onCellDrag).toHaveBeenCalledWith(0, {
      x: expect.any(Number),
      y: expect.any(Number)
    })
    expect(onCellDrag.mock.calls[0][1].x).toBeCloseTo(23.11, 0)
    expect(onCellDrag.mock.calls[0][1].y).toBeCloseTo(48.27, 0)
  })

  it('does not throw when cell is dragged without onCellDrag callback', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(12))

    render(<BingoCard card={card} />)

    const container = screen.getByTestId('card-canvas')
    container.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 675,
      height: 953,
      right: 675,
      bottom: 953,
      x: 0,
      y: 0,
      toJSON() {}
    })

    const cellElement = screen.getByText(card[0]).closest('[style]')

    expect(() => {
      fireEvent.mouseDown(cellElement, { clientX: 50, clientY: 50 })
      fireEvent.mouseMove(document, { clientX: 150, clientY: 100 })
      fireEvent.mouseUp(document)
    }).not.toThrow()
  })
})
