import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
})
