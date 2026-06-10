import { useRef, useState } from 'react'
import designAquarelaBase from '../assets/design-aquarela-base.png'
import {
  TEMPLATE_CELLS,
  TEMPLATE_CELL_HEIGHT,
  TEMPLATE_CELL_WIDTH,
  TEMPLATE_HEIGHT,
  TEMPLATE_WIDTH
} from '../data/template'
import { fitWordInCell } from '../lib/cellTextLayout'

const TEXT_COLOR = '#2f3d4c'
const CELL_WIDTH_PCT = (TEMPLATE_CELL_WIDTH / TEMPLATE_WIDTH) * 100
const CELL_HEIGHT_PCT = (TEMPLATE_CELL_HEIGHT / TEMPLATE_HEIGHT) * 100

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getDefaultPosition(index) {
  const cell = TEMPLATE_CELLS[index]
  return {
    x: ((cell.x + TEMPLATE_CELL_WIDTH / 2) / TEMPLATE_WIDTH) * 100,
    y: ((cell.y + TEMPLATE_CELL_HEIGHT / 2) / TEMPLATE_HEIGHT) * 100
  }
}

export default function BingoCard({
  card,
  backgroundImage,
  cellPositions,
  onCellDrag
}) {
  const containerRef = useRef(null)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  function handleMouseDown(event, index) {
    if (!containerRef.current || !onCellDrag) return

    event.preventDefault()

    const cellElement = event.currentTarget
    const cellRect = cellElement.getBoundingClientRect()
    const cellCenterX = cellRect.left + cellRect.width / 2
    const cellCenterY = cellRect.top + cellRect.height / 2
    const offsetX = event.clientX - cellCenterX
    const offsetY = event.clientY - cellCenterY
    const currentPosition = cellPositions?.[index] ?? getDefaultPosition(index)

    setDraggingIndex(index)
    setDragOffset({ x: currentPosition.x, y: currentPosition.y })
    dragOffsetRef.current = { x: currentPosition.x, y: currentPosition.y }

    function handleMouseMove(moveEvent) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const cellWidthPx = cellRect.width
      const cellHeightPx = cellRect.height

      const newCenterX = moveEvent.clientX - containerRect.left - offsetX
      const newCenterY = moveEvent.clientY - containerRect.top - offsetY
      const clampedX = clamp(
        newCenterX,
        cellWidthPx / 2,
        containerRect.width - cellWidthPx / 2
      )
      const clampedY = clamp(
        newCenterY,
        cellHeightPx / 2,
        containerRect.height - cellHeightPx / 2
      )

      const newX = (clampedX / containerRect.width) * 100
      const newY = (clampedY / containerRect.height) * 100

      setDragOffset({ x: newX, y: newY })
      dragOffsetRef.current = { x: newX, y: newY }
    }

    function handleMouseUp() {
      onCellDrag(index, {
        x: dragOffsetRef.current.x,
        y: dragOffsetRef.current.y
      })
      setDraggingIndex(null)

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
          className="relative mx-auto w-full max-w-[720px] [container-type:inline-size]"
          data-testid="card-canvas"
          style={{ aspectRatio: `${TEMPLATE_WIDTH} / ${TEMPLATE_HEIGHT}` }}
        >
          <img
            alt="Cartela aquarela do bingo"
            className="h-full w-full rounded-[22px] object-cover"
            src={backgroundImage || designAquarelaBase}
          />
          {card.map((word, index) => {
            const position =
              draggingIndex === index
                ? { x: dragOffset.x, y: dragOffset.y }
                : (cellPositions?.[index] ?? getDefaultPosition(index))

            const textLayout = fitWordInCell(
              word,
              TEMPLATE_CELL_WIDTH,
              TEMPLATE_CELL_HEIGHT
            )
            const fontSizeCqw = (textLayout.fontSizePx / TEMPLATE_WIDTH) * 100

            return (
              <div
                className={`absolute flex items-center justify-center overflow-hidden px-[2%] text-center font-serif font-semibold leading-tight ${onCellDrag ? 'cursor-grab' : ''}`}
                key={`${word}-${index}`}
                style={{
                  color: TEXT_COLOR,
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: `${CELL_WIDTH_PCT}%`,
                  height: `${CELL_HEIGHT_PCT}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${fontSizeCqw}cqw`
                }}
                onMouseDown={(event) => handleMouseDown(event, index)}
              >
                <span className="block w-full whitespace-pre-line">
                  {textLayout.lines.join('\n')}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
