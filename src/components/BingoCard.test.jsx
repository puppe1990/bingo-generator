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
    const cellWidth = 128
    const cellHeight = 104
    const cellLeft = 56
    const cellTop = 410
    const clickX = cellLeft + 20
    const clickY = cellTop + 20
    const dropX = 150
    const dropY = 200

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
    cellElement.getBoundingClientRect = () => ({
      left: cellLeft,
      top: cellTop,
      width: cellWidth,
      height: cellHeight,
      right: cellLeft + cellWidth,
      bottom: cellTop + cellHeight,
      x: cellLeft,
      y: cellTop,
      toJSON() {}
    })
    Object.defineProperty(cellElement, 'offsetWidth', { value: cellWidth })
    Object.defineProperty(cellElement, 'offsetHeight', { value: cellHeight })

    fireEvent.mouseDown(cellElement, { clientX: clickX, clientY: clickY })
    fireEvent.mouseMove(document, { clientX: dropX, clientY: dropY })
    fireEvent.mouseUp(document)

    const expectedX = ((dropX - 20) / 675) * 100
    const expectedY = ((dropY - 20) / 953) * 100

    expect(onCellDrag).toHaveBeenCalledWith(0, {
      x: expect.any(Number),
      y: expect.any(Number)
    })
    expect(onCellDrag.mock.calls[0][1].x).toBeCloseTo(expectedX, 1)
    expect(onCellDrag.mock.calls[0][1].y).toBeCloseTo(expectedY, 1)
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
    cellElement.getBoundingClientRect = () => ({
      left: 56,
      top: 410,
      width: 128,
      height: 104,
      right: 184,
      bottom: 514,
      x: 56,
      y: 410,
      toJSON() {}
    })
    Object.defineProperty(cellElement, 'offsetWidth', { value: 128 })
    Object.defineProperty(cellElement, 'offsetHeight', { value: 104 })

    expect(() => {
      fireEvent.mouseDown(cellElement, { clientX: 70, clientY: 420 })
      fireEvent.mouseMove(document, { clientX: 150, clientY: 500 })
      fireEvent.mouseUp(document)
    }).not.toThrow()
  })

  it('keeps cell under the cursor when dragging from the center of the cell', () => {
    const card = buildCard(BINGO_WORDS, mulberry32(12))
    const onCellDrag = vi.fn()
    const cellWidth = 128
    const cellHeight = 104
    const containerLeft = 100
    const containerTop = 50
    const cellRenderedLeft = containerLeft + 215
    const cellRenderedTop = containerTop + 330
    const clickX = cellRenderedLeft + cellWidth / 2
    const clickY = cellRenderedTop + cellHeight / 2
    const dropX = 500
    const dropY = 700

    render(<BingoCard card={card} onCellDrag={onCellDrag} />)

    const container = screen.getByTestId('card-canvas')
    container.getBoundingClientRect = () => ({
      left: containerLeft,
      top: containerTop,
      width: 675,
      height: 953,
      right: containerLeft + 675,
      bottom: containerTop + 953,
      x: containerLeft,
      y: containerTop,
      toJSON() {}
    })

    const cellElement = screen.getByText(card[0]).closest('[style]')
    cellElement.getBoundingClientRect = () => ({
      left: cellRenderedLeft,
      top: cellRenderedTop,
      width: cellWidth,
      height: cellHeight,
      right: cellRenderedLeft + cellWidth,
      bottom: cellRenderedTop + cellHeight,
      x: cellRenderedLeft,
      y: cellRenderedTop,
      toJSON() {}
    })
    Object.defineProperty(cellElement, 'offsetWidth', { value: cellWidth })
    Object.defineProperty(cellElement, 'offsetHeight', { value: cellHeight })

    fireEvent.mouseDown(cellElement, { clientX: clickX, clientY: clickY })
    fireEvent.mouseMove(document, { clientX: dropX, clientY: dropY })

    const expectedLeftPct =
      ((dropX - containerLeft - cellWidth / 2) / 675) * 100
    const expectedTopPct = ((dropY - containerTop - cellHeight / 2) / 953) * 100

    expect(parseFloat(cellElement.style.left)).toBeCloseTo(expectedLeftPct, 1)
    expect(parseFloat(cellElement.style.top)).toBeCloseTo(expectedTopPct, 1)

    fireEvent.mouseUp(document)

    expect(onCellDrag).toHaveBeenCalledWith(0, {
      x: expect.any(Number),
      y: expect.any(Number)
    })
    expect(onCellDrag.mock.calls[0][1].x).toBeCloseTo(expectedLeftPct, 1)
    expect(onCellDrag.mock.calls[0][1].y).toBeCloseTo(expectedTopPct, 1)
  })
})
