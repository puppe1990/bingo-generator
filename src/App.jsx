import { useState } from 'react'
import BingoCard from './components/BingoCard'
import { BINGO_WORDS } from './data/words'
import { buildCard, buildUniqueCards } from './lib/bingo'
import { generatePdf } from './lib/pdf'

export default function App() {
  const [cardCount, setCardCount] = useState(4)
  const [cardsPerPage, setCardsPerPage] = useState(2)
  const [previewCard, setPreviewCard] = useState(() => buildCard(BINGO_WORDS))

  function refreshPreview() {
    setPreviewCard(buildCard(BINGO_WORDS))
  }

  async function handleGeneratePdf() {
    const cards = buildUniqueCards(cardCount, BINGO_WORDS)
    const pdf = await generatePdf(cards, cardsPerPage)
    pdf.save(
      `bingo-cha-de-bebe-${cardCount}-cartelas-${cardsPerPage}-por-folha.pdf`
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,227,209,0.8),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(206,229,255,0.85),transparent_26%),linear-gradient(180deg,#fffaf3_0%,#fffefc_100%)] px-8 py-8 text-slate-700 max-[820px]:px-[18px]">
      <section className="grid items-start gap-7 xl:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
        <div className="py-4">
          <p className="mb-2.5 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-sky-400">
            Bingo do chá de bebê
          </p>
          <h1 className="m-0 max-w-[12ch] font-serif text-[clamp(2.2rem,4vw,4.2rem)] leading-[0.94] text-slate-800">
            Gere cartelas no design aquarela e exporte em PDF.
          </h1>
          <p className="max-w-[34ch] text-base leading-7 text-slate-500">
            Cada cartela usa 16 palavras sorteadas da lista. O PDF pode sair com
            2 ou 4 cartelas por folha A4.
          </p>
          <div className="mt-7 grid gap-[18px]">
            <label className="grid max-w-[220px] gap-2">
              <span className="text-[0.95rem] font-semibold">
                Quantidade de cartelas
              </span>
              <input
                className="rounded-[14px] border border-sky-200 bg-white/80 px-3.5 py-3 text-slate-800 outline-none"
                min="1"
                max="100"
                type="number"
                value={cardCount}
                onChange={(event) =>
                  setCardCount(Number(event.target.value) || 1)
                }
              />
            </label>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-[0.95rem] font-semibold">
                Layout do PDF
              </legend>
              <div className="flex flex-wrap gap-3">
                {[2, 4].map((option) => {
                  const isSelected = cardsPerPage === option

                  return (
                    <button
                      className={`cursor-pointer rounded-full border px-[18px] py-[14px] font-bold transition ${
                        isSelected
                          ? 'border-sky-300 bg-sky-100 text-sky-700'
                          : 'border-sky-200 bg-white/90 text-sky-700'
                      }`}
                      key={option}
                      onClick={() => setCardsPerPage(option)}
                      type="button"
                    >
                      {option} cartelas por folha
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <div className="flex flex-wrap gap-3">
              <button
                className="cursor-pointer rounded-full border border-sky-200 bg-white/90 px-[18px] py-[14px] font-bold text-sky-700 shadow-none"
                onClick={refreshPreview}
                type="button"
              >
                Embaralhar prévia
              </button>
              <button
                className="cursor-pointer rounded-full bg-sky-400 px-[18px] py-[14px] font-bold text-white shadow-[0_12px_30px_rgba(126,177,224,0.28)]"
                onClick={handleGeneratePdf}
                type="button"
              >
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
        <BingoCard card={previewCard} />
      </section>
    </main>
  )
}
