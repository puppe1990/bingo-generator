import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('starts with 100 bingo cards selected by default', () => {
    render(<App />)

    expect(screen.getByLabelText('Quantidade de cartelas')).toHaveValue(100)
  })
})
