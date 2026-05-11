import designAquarelaBase from '../assets/design-aquarela-base.png'
import {
  TEMPLATE_CELLS,
  TEMPLATE_CELL_HEIGHT,
  TEMPLATE_CELL_WIDTH,
  TEMPLATE_HEIGHT,
  TEMPLATE_WIDTH
} from '../data/template'

const TEXT_COLOR = '#2f3d4c'

export default function BingoCard({ card }) {
  return (
    <section aria-label="Prévia da cartela">
      <div className="overflow-hidden rounded-[28px] border border-sky-100/90 bg-white/80 p-3 shadow-[0_32px_70px_rgba(115,141,171,0.14)]">
        <div
          className="relative mx-auto w-full max-w-[720px]"
          style={{ aspectRatio: `${TEMPLATE_WIDTH} / ${TEMPLATE_HEIGHT}` }}
        >
          <img
            alt="Cartela aquarela do bingo"
            className="h-full w-full rounded-[22px] object-cover"
            src={designAquarelaBase}
          />
          {card.map((word, index) => {
            const cell = TEMPLATE_CELLS[index]

            return (
              <div
                className="absolute flex items-center justify-center px-[0.25rem] text-center font-serif font-semibold leading-tight"
                key={`${word}-${index}`}
                style={{
                  color: TEXT_COLOR,
                  left: `${(cell.x / TEMPLATE_WIDTH) * 100}%`,
                  top: `${(cell.y / TEMPLATE_HEIGHT) * 100}%`,
                  width: `${(TEMPLATE_CELL_WIDTH / TEMPLATE_WIDTH) * 100}%`,
                  height: `${(TEMPLATE_CELL_HEIGHT / TEMPLATE_HEIGHT) * 100}%`,
                  fontSize: 'clamp(0.85rem, 1.35vw, 1.5rem)'
                }}
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
