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

    addImage(dataUrl, _format, x, y, width, height) {
      jsPdfCalls.push({ type: 'addImage', dataUrl, x, y, width, height })
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
      dataUrl: expect.any(String),
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

  it('uses a custom image data URL instead of the default template when provided', async () => {
    const { generatePdf } = await import('./pdf')
    const customDataUrl = 'data:image/png;base64,customtemplate'

    await generatePdf([createCard('A')], 2, customDataUrl)

    const addImageCall = jsPdfCalls.find((call) => call.type === 'addImage')
    expect(addImageCall).toBeDefined()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('uses custom cell positions for word placement when provided', async () => {
    const { generatePdf } = await import('./pdf')
    const customPositions = Array.from({ length: 16 }, () => ({
      x: 50,
      y: 50
    }))

    await generatePdf([createCard('A')], 2, null, customPositions)

    const defaultTextCall = jsPdfCalls.find(
      (call) => call.type === 'text' && String(call.content) === 'A-1'
    )
    expect(defaultTextCall).toBeDefined()

    jsPdfCalls.length = 0
    await generatePdf([createCard('A')], 2)
    const originalTextCall = jsPdfCalls.find(
      (call) => call.type === 'text' && String(call.content) === 'A-1'
    )

    expect(defaultTextCall.x).not.toBeCloseTo(originalTextCall.x, 1)
    expect(defaultTextCall.y).not.toBeCloseTo(originalTextCall.y, 1)
  })

  it('falls back to template positions when cellPositions entries are null', async () => {
    const { generatePdf } = await import('./pdf')
    const partialPositions = Array.from({ length: 16 }, () => null)
    partialPositions[0] = { x: 12, y: 18 }

    await expect(
      generatePdf([createCard('A')], 2, null, partialPositions)
    ).resolves.toBeDefined()

    const draggedTextCall = jsPdfCalls.find(
      (call) => call.type === 'text' && String(call.content) === 'A-1'
    )
    const untouchedTextCall = jsPdfCalls.find(
      (call) => call.type === 'text' && String(call.content) === 'A-2'
    )

    jsPdfCalls.length = 0
    await generatePdf([createCard('A')], 2)
    const defaultTextCall = jsPdfCalls.find(
      (call) => call.type === 'text' && String(call.content) === 'A-2'
    )

    expect(draggedTextCall).toBeDefined()
    expect(untouchedTextCall).toBeDefined()
    expect(untouchedTextCall.x).toBeCloseTo(defaultTextCall.x, 1)
    expect(untouchedTextCall.y).toBeCloseTo(defaultTextCall.y, 1)
  })
})
