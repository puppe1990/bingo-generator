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
})
