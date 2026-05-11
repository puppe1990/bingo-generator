import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const jsPdfCalls = []

vi.mock('jspdf', () => ({
  jsPDF: class FakeJsPdf {
    constructor(options) {
      this.options = options
      jsPdfCalls.push({ type: 'constructor', options })
    }

    addPage(format, orientation) {
      jsPdfCalls.push({ type: 'addPage', format, orientation })
    }

    setFillColor() {}

    rect() {}

    addImage(_dataUrl, _format, x, y, width, height) {
      jsPdfCalls.push({ type: 'addImage', x, y, width, height })
    }

    setFont() {}

    setFontSize() {}

    setTextColor() {}

    text(content, x, y, options) {
      jsPdfCalls.push({ type: 'text', content, x, y, options })
    }

    splitTextToSize(word) {
      return [word]
    }
  }
}))

function createFakeFileReader() {
  return class FakeFileReader {
    readAsDataURL() {
      this.result = 'data:image/png;base64,ZmFrZQ=='
      this.onload?.()
    }
  }
}

function createCard(prefix) {
  return Array.from({ length: 16 }, (_, index) => `${prefix}-${index + 1}`)
}

describe('generatePdf', () => {
  beforeEach(() => {
    jsPdfCalls.length = 0
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      blob: async () => ({})
    }))
    globalThis.FileReader = createFakeFileReader()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('uses portrait pages when rendering 4 cards per sheet', async () => {
    const { generatePdf } = await import('./pdf')

    await generatePdf([createCard('A'), createCard('B'), createCard('C')], 4)
    const cartelaLabelCall = jsPdfCalls.find(
      (call) => call.type === 'text' && call.content === 'Cartela 1'
    )

    expect(jsPdfCalls[0]).toEqual({
      type: 'constructor',
      options: {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      }
    })
    expect(jsPdfCalls[1]).toEqual({
      type: 'addImage',
      x: expect.any(Number),
      y: expect.any(Number),
      width: expect.any(Number),
      height: expect.any(Number)
    })
    expect(jsPdfCalls[1].x).toBeGreaterThanOrEqual(10)
    expect(jsPdfCalls[1].x + jsPdfCalls[1].width).toBeLessThanOrEqual(200)
    expect(jsPdfCalls[1].y).toBeGreaterThanOrEqual(10)
    expect(jsPdfCalls[1].y + jsPdfCalls[1].height).toBeLessThanOrEqual(287)
    expect(cartelaLabelCall).toEqual({
      type: 'text',
      content: 'Cartela 1',
      x: expect.any(Number),
      y: expect.any(Number),
      options: { align: 'right' }
    })
    expect(cartelaLabelCall.y).toBeCloseTo(
      jsPdfCalls[1].y + jsPdfCalls[1].height - 2,
      5
    )
  })

  it('keeps landscape pages when rendering 2 cards per sheet', async () => {
    const { generatePdf } = await import('./pdf')

    await generatePdf([createCard('A'), createCard('B'), createCard('C')], 2)
    const addPageCall = jsPdfCalls.find((call) => call.type === 'addPage')

    expect(jsPdfCalls[0]).toEqual({
      type: 'constructor',
      options: {
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      }
    })
    expect(addPageCall).toEqual({
      type: 'addPage',
      format: 'a4',
      orientation: 'landscape'
    })
  })
})
