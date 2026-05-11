import designAquarelaBase from '../assets/design-aquarela-base.png'
import {
  TEMPLATE_CELLS,
  TEMPLATE_CELL_HEIGHT,
  TEMPLATE_CELL_WIDTH,
  TEMPLATE_HEIGHT,
  TEMPLATE_WIDTH
} from '../data/template'

const A4_PORTRAIT_WIDTH = 210
const A4_PORTRAIT_HEIGHT = 297
const PAGE_MARGIN_X = 10
const PAGE_MARGIN_Y = 10
const SLOT_GAP_X = 6
const SLOT_GAP_Y = 6
const CARD_ASPECT_RATIO = TEMPLATE_WIDTH / TEMPLATE_HEIGHT
const TEXT_COLOR = [47, 61, 76]

let cachedTemplatePromise

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read the design image.'))
    reader.readAsDataURL(blob)
  })
}

async function loadTemplateDataUrl() {
  if (!cachedTemplatePromise) {
    cachedTemplatePromise = fetch(designAquarelaBase)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load the design image.')
        }

        return response.blob()
      })
      .then(blobToDataUrl)
  }

  return cachedTemplatePromise
}

function getPageLayout(cardsPerPage) {
  if (cardsPerPage === 2) {
    return { columns: 2, rows: 1 }
  }

  if (cardsPerPage === 4) {
    return { columns: 2, rows: 2 }
  }

  throw new Error('Cards per page must be 2 or 4.')
}

function getPageOrientation(cardsPerPage) {
  if (cardsPerPage === 2) {
    return 'landscape'
  }

  if (cardsPerPage === 4) {
    return 'portrait'
  }

  throw new Error('Cards per page must be 2 or 4.')
}

function getPageSize(cardsPerPage) {
  if (getPageOrientation(cardsPerPage) === 'portrait') {
    return {
      width: A4_PORTRAIT_WIDTH,
      height: A4_PORTRAIT_HEIGHT
    }
  }

  return {
    width: A4_PORTRAIT_HEIGHT,
    height: A4_PORTRAIT_WIDTH
  }
}

function getCardPlacement(indexOnPage, cardsPerPage) {
  const pageSize = getPageSize(cardsPerPage)
  const { columns, rows } = getPageLayout(cardsPerPage)
  const availableWidth = pageSize.width - PAGE_MARGIN_X * 2
  const availableHeight = pageSize.height - PAGE_MARGIN_Y * 2
  const slotWidth = (availableWidth - SLOT_GAP_X * (columns - 1)) / columns
  const slotHeight = (availableHeight - SLOT_GAP_Y * (rows - 1)) / rows
  const slotColumn = indexOnPage % columns
  const slotRow = Math.floor(indexOnPage / columns)
  const slotX = PAGE_MARGIN_X + slotColumn * (slotWidth + SLOT_GAP_X)
  const slotY = PAGE_MARGIN_Y + slotRow * (slotHeight + SLOT_GAP_Y)

  let cardWidth = slotWidth
  let cardHeight = cardWidth / CARD_ASPECT_RATIO

  if (cardHeight > slotHeight) {
    cardHeight = slotHeight
    cardWidth = cardHeight * CARD_ASPECT_RATIO
  }

  return {
    x: slotX + (slotWidth - cardWidth) / 2,
    y: slotY + (slotHeight - cardHeight) / 2,
    width: cardWidth,
    height: cardHeight
  }
}

function drawCardWord(pdf, word, cell, cardBox, fontSize) {
  const x = cardBox.x + (cell.x / TEMPLATE_WIDTH) * cardBox.width
  const y = cardBox.y + (cell.y / TEMPLATE_HEIGHT) * cardBox.height
  const width = (TEMPLATE_CELL_WIDTH / TEMPLATE_WIDTH) * cardBox.width
  const height = (TEMPLATE_CELL_HEIGHT / TEMPLATE_HEIGHT) * cardBox.height
  const maxWidth = Math.max(width - 4, 18)
  const lines = pdf.splitTextToSize(word, maxWidth)
  const lineHeight = fontSize * 0.38
  const textBlockHeight = Math.max(lines.length, 1) * lineHeight
  const startY = y + (height - textBlockHeight) / 2 + lineHeight * 0.78

  pdf.text(lines, x + width / 2, startY, {
    align: 'center',
    baseline: 'alphabetic',
    maxWidth
  })
}

function drawCardPage(pdf, templateDataUrl, cards, cardsPerPage, startIndex) {
  const pageSize = getPageSize(cardsPerPage)

  pdf.setFillColor(255, 251, 246)
  pdf.rect(0, 0, pageSize.width, pageSize.height, 'F')

  cards.forEach((card, indexOnPage) => {
    const cardBox = getCardPlacement(indexOnPage, cardsPerPage)
    const fontSize = cardsPerPage === 2 ? 12 : 9

    pdf.addImage(
      templateDataUrl,
      'PNG',
      cardBox.x,
      cardBox.y,
      cardBox.width,
      cardBox.height
    )
    pdf.setFont('times', 'bold')
    pdf.setFontSize(fontSize)
    pdf.setTextColor(...TEXT_COLOR)

    card.forEach((word, wordIndex) => {
      drawCardWord(pdf, word, TEMPLATE_CELLS[wordIndex], cardBox, fontSize)
    })

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(cardsPerPage === 2 ? 9 : 8)
    pdf.setTextColor(142, 160, 176)
    pdf.text(
      `Cartela ${startIndex + indexOnPage + 1}`,
      cardBox.x + cardBox.width - 6,
      cardBox.y + cardBox.height - 2,
      {
        align: 'right'
      }
    )
  })
}

export async function generatePdf(cards, cardsPerPage) {
  const { jsPDF } = await import('jspdf')
  const templateDataUrl = await loadTemplateDataUrl()
  const orientation = getPageOrientation(cardsPerPage)
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  })

  for (
    let startIndex = 0;
    startIndex < cards.length;
    startIndex += cardsPerPage
  ) {
    if (startIndex > 0) {
      pdf.addPage('a4', orientation)
    }

    drawCardPage(
      pdf,
      templateDataUrl,
      cards.slice(startIndex, startIndex + cardsPerPage),
      cardsPerPage,
      startIndex
    )
  }

  return pdf
}
