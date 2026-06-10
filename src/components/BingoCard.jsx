import { useRef } from 'react'
import designAquarelaBase from '../assets/design-aquarela-base.png'
import {
  TEMPLATE_CELLS,
  TEMPLATE_CELL_HEIGHT,
  TEMPLATE_CELL_WIDTH,
  TEMPLATE_HEIGHT,
  TEMPLATE_WIDTH
} from '../data/template'

const TEXT_COLOR = '#2f3d4c'
const DEFAULT_CELL_WIDTH_PCT = (TEMPLATE_CELL_WIDTH / TEMPLATE_WIDTH) * 100
const DEFAULT_CELL_HEIGHT_PCT = (TEMPLATE_CELL_HEIGHT / TEMPLATE_HEIGHT) * 100

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getDefaultPosition(index) {
  const cell = TEMPLATE_CELLS[index]
  return {
    x: (cell.x / TEMPLATE_WIDTH) * 100,
    y: (cell.y / TEMPLATE_HEIGHT) * 100
  }
}

export default function BingoCard({
  card,
  backgroundImage,
  cellPositions,
  onCellDrag
}) {
  const containerRef = useRef(null)

  function handleMouseDown(event, index) {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const cellElement = event.currentTarget
    const cellRect = cellElement.getBoundingClientRect()
    const cellLeftInContainer = cellRect.left - containerRect.left
    const cellTopInContainer = cellRect.top - containerRect.top
    const offsetX = event.clientX - containerRect.left - cellLeftInContainer
    const offsetY = event.clientY - containerRect.top - cellTopInContainer

    function handleMouseMove(moveEvent) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const cellWidthPx = (DEFAULT_CELL_WIDTH_PCT / 100) * containerRect.width
      const cellHeightPx =
        (DEFAULT_CELL_HEIGHT_PCT / 100) * containerRect.height

      cellElement.style.width = `${cellWidthPx}px`
      cellElement.style.height = `${cellHeightPx}px`

      const newCellX = moveEvent.clientX - containerRect.left - offsetX
      const newCellY = moveEvent.clientY - containerRect.top - offsetY
      const clampedX = clamp(newCellX, 0, containerRect.width - cellWidthPx)
      const clampedY = clamp(newCellY, 0, containerRect.height - cellHeightPx)

      cellElement.style.left = `${(clampedX / containerRect.width) * 100}%`
      cellElement.style.top = `${(clampedY / containerRect.height) * 100}%`
    }

    function handleMouseUp() {
      const finalLeft = parseFloat(cellElement.style.left)
      const finalTop = parseFloat(cellElement.style.top)

      cellElement.style.width = ''
      cellElement.style.height = ''

      onCellDrag?.(index, { x: finalLeft, y: finalTop })

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <section aria-label="Prévia da cartela">
      <div className="overflow-hidden rounded-[28px] border border-sky-100/90 bg-white/80 p-3 shadow-[0_32px_70px_rgba(115,141,171,0.14)]">
        <div
          ref={containerRef}
          className="relative mx-auto w-full max-w-[720px]"
          data-testid="card-canvas"
          style={{ aspectRatio: `${TEMPLATE_WIDTH} / ${TEMPLATE_HEIGHT}` }}
        >
          <img
            alt="Cartela aquarela do bingo"
            className="h-full w-full rounded-[22px] object-cover"
            src={backgroundImage || designAquarelaBase}
          />
          {card.map((word, index) => {
            const position = cellPositions?.[index] ?? getDefaultPosition(index)

            return (
              <div
                className={`absolute flex items-center justify-center px-[0.25rem] text-center font-serif font-semibold leading-tight ${onCellDrag ? 'cursor-grab' : ''}`}
                key={`${word}-${index}`}
                style={{
                  color: TEXT_COLOR,
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: `${DEFAULT_CELL_WIDTH_PCT}%`,
                  height: `${DEFAULT_CELL_HEIGHT_PCT}%`,
                  fontSize: 'clamp(0.85rem, 1.35vw, 1.5rem)'
                }}
                onMouseDown={(event) => handleMouseDown(event, index)}
              >
                <span>{word}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
