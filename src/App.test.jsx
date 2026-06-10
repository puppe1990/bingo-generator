import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const generatePdfMock = vi.fn()

vi.mock('./lib/pdf', () => ({
  generatePdf: (...args) => generatePdfMock(...args)
}))

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
    generatePdfMock.mockReset()
    generatePdfMock.mockResolvedValue({
      save: vi.fn()
    })
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

  it('shows loading feedback while generating the PDF', async () => {
    let resolvePdf
    generatePdfMock.mockReturnValue(
      new Promise((resolve) => {
        resolvePdf = resolve
      })
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Gerar PDF' }))

    const loadingButton = screen.getByRole('button', { name: 'Gerando PDF...' })
    expect(loadingButton).toBeDisabled()

    resolvePdf({ save: vi.fn() })

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Gerar PDF' })
      ).not.toBeDisabled()
    })
  })

  it('saves the PDF after generation succeeds', async () => {
    const saveMock = vi.fn()
    generatePdfMock.mockResolvedValue({ save: saveMock })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Gerar PDF' }))

    await waitFor(() => {
      expect(generatePdfMock).toHaveBeenCalledTimes(1)
      expect(saveMock).toHaveBeenCalledWith(
        'bingo-cha-de-bebe-100-cartelas-2-por-folha.pdf'
      )
    })
  })

  it('shows an error message when PDF generation fails', async () => {
    generatePdfMock.mockRejectedValue(new Error('PDF generation failed'))

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Gerar PDF' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Não foi possível gerar o PDF. Tente novamente.'
      )
    })
    expect(screen.getByRole('button', { name: 'Gerar PDF' })).not.toBeDisabled()
  })

  it('generates PDF after dragging a single cell without crashing', async () => {
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
    fireEvent.mouseDown(firstCell, { clientX: 50, clientY: 50 })
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 })
    fireEvent.mouseUp(document)

    fireEvent.click(screen.getByRole('button', { name: 'Gerar PDF' }))

    await waitFor(() => {
      expect(generatePdfMock).toHaveBeenCalledTimes(1)
    })

    const [, , , cellPositions] = generatePdfMock.mock.calls[0]
    expect(cellPositions[0]).toEqual(
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) })
    )
    expect(cellPositions[1]).toBeNull()
  })
})
