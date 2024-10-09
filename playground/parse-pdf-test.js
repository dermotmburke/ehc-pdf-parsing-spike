import { PDFExtract } from 'pdf.js-extract'
import { PDFDocument } from 'pdf-lib'
import fs from "fs";

const filename = '/Users/dermotburke/pdf-extract-text/8361_EN_rs_-_SPECIMEN_V4.pdf';
const lineText = 'have been obtained'

const pdfFile = fs.readFileSync(filename).buffer;


const pdfExtract = new PDFExtract();
const options = {disableCombineTextItems: false}; /* see below */

async function getLineContaining(filename, lineText, options) {
    try {
        const data = await pdfExtract.extract(filename, options);
        const page = data.pages[2];
        const lines = page.content.filter((line) => line.str.startsWith(lineText));
        if (lines.length > 0) {
            return lines[0]
        }
    } catch (err) {
        console.error(err);
    }
}

const line = await getLineContaining(filename, lineText,  options)
const pdfDoc = await PDFDocument.load(pdfFile,  { ignoreEncryption: true })
const pages = pdfDoc.getPages()
const firstPage = pages[2]

// Get the width and height of the first page
const { width, height } = firstPage.getSize()

const textSizeOffset = 2
const textLength = 540
const yPosition = line.y
const xPosition = line.x

const y = height - yPosition + textSizeOffset
const startX = xPosition
const endX = textLength

firstPage.drawLine({
    start: { x: startX, y: y },
    end: { x: endX, y: y },
    thickness: 1
})

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

fs.writeFileSync("/Users/dermotburke/pdf-extract-text/pdf-lib_modification_example-mod.pdf", pdfBytes)

