import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

function createFakeFileReader() {
  return class FakeFileReader {
    readAsDataURL() {
      this.result = 'data:image/png;base64,fakeimagedata'
      this.onload?.()
    }
  }
}

describe('App', () => {
  beforeEach(() => {
    globalThis.FileReader = createFakeFileReader()
  })

  it('starts with 100 bingo cards selected by default', () => {
    render(<App />)

    expect(screen.getByLabelText('Quantidade de cartelas')).toHaveValue(100)
  })

  it('renders a file input for uploading a custom background image', () => {
    render(<App />)

    expect(screen.getByLabelText('Imagem de fundo')).toBeInTheDocument()
  })

  it('updates the card preview with the uploaded image', async () => {
    render(<App />)

    const file = new File(['fake-image'], 'custom.png', { type: 'image/png' })
    const input = screen.getByLabelText('Imagem de fundo')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      const img = screen.getByAltText('Cartela aquarela do bingo')
      expect(img.getAttribute('src')).toMatch(/^data:image/)
    })
  })

  it('persists cell position after drag and re-render', () => {
    render(<App />)

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

    const firstCell = container.querySelectorAll('.absolute')[0]
    const originalLeft = firstCell.style.left

    fireEvent.mouseDown(firstCell, { clientX: 50, clientY: 50 })
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 })
    fireEvent.mouseUp(document)

    fireEvent.click(screen.getByText('Embaralhar prévia'))

    const cellsAfter = screen
      .getByTestId('card-canvas')
      .querySelectorAll('.absolute')
    const firstCellAfterShuffle = cellsAfter[0]
    expect(firstCellAfterShuffle.style.left).not.toBe(originalLeft)
  })
})
