import {PDFExtract} from 'pdf.js-extract'
import fs from "fs";

const filename = '/Users/dermotburke/pdf-extract-text/8361_EN_rs_-_SPECIMEN_V4';
const ext = ".pdf"

const pdfFile = fs.readFileSync(filename + ext).buffer;

const pdfExtract = new PDFExtract();
const options = {disableCombineTextItems: false};

const regex = /II\.[^\s+]*/g

const linesToIgnore =["", "II.a Certificate reference", "UNITED KINGDOM", "Certificate model COMP", "..............................."]

async function extractDoc(filename, options) {
    try {
        return await pdfExtract.extract(filename, options)
    } catch (err) {
        console.error(err);
    }
}

const doc = await extractDoc(filename + ext, options)

let attestations = [];

doc.pages.forEach(page => {
    // skip first few pages
    if (page.pageInfo.num > 2) {
        let currentAttestation = "";
        page.content.forEach(content => {
            content.page = page.pageInfo.num
            if (content.str.startsWith("II.") || content.str.startsWith("[II.") || content.str.trim() === "Notes" || content.str.trim() === "otes") {
                let nextAttestation = content.str.replace("[", "")
                if (nextAttestation !== currentAttestation) {
                    if (!isNaN(parseFloat(nextAttestation.charAt(3))) || content.str.trim() === "Notes" || content.str.trim() === "otes") {
                        currentAttestation = nextAttestation
                        content.absoluteY = Math.round((page.pageInfo.num - 1) * (page.pageInfo.height) + content.y)
                        attestations.push(content)
                        let previousAttestation = attestations[attestations.length - 2]
                        if (previousAttestation) {
                            previousAttestation.endY = Math.round(content.y)
                            previousAttestation.endPage = page.pageInfo.num
                            previousAttestation.absoluteEndY = content.absoluteY
                            attestations[attestations.length - 2] = previousAttestation
                        }
                    }
                }
            }
        })
    }
})

// remove Notes line
attestations.pop()

attestations.forEach(attestation => {
    const name = attestation.str.match(regex)
    attestation.name = name && name[0].trim()
    attestation.lines = []
    doc.pages.forEach(page => {
        if (page.pageInfo.num >= attestation.page && page.pageInfo.num <= attestation.endPage) {
            let line = {str: "", num: 0}
            page.content.forEach(content => {
                let absoluteY = Math.round((page.pageInfo.num - 1) * (page.pageInfo.height) + content.y)
                if (!linesToIgnore.includes(content.str.trim()) && absoluteY >= attestation.absoluteY - 4 && absoluteY < attestation.absoluteEndY) {
                    // if (!line.num || Math.round(content.y) === line.num) {
                    //     line = {
                    //         str: line.str += " " + content.str,
                    //         num: Math.round(content.y),
                    //         size: content.height,
                    //         x: Math.round(content.x),
                    //         absoluteNum: absoluteY
                    //     }
                    // } else {
                        line = {
                            str: content.str,
                            num: Math.round(content.y),
                            size: content.height,
                            x: Math.round(content.x),
                            font: content.fontName
                        }
                        attestation.lines.push(line)
                   // }
                }
            })
            attestation.lines.push(line)
        }
    })
})

attestations.sort((a, b) => b.name.length - a.name.length);

for (let i = attestations[0].name.length - 2; i > 0; i = i - 2) {
    attestations.forEach(outer => {
        attestations.forEach(inner => {
            if (inner.name !== outer.name && inner.name.substring(0, i) === outer.name) {
                if (!outer.children) {
                    outer.children = []
                }
                outer.children.push(inner)
                inner.isChild = true
            }
        })
        if (outer.children) {
            outer.children.sort((a, b) => b.name[b.name - 2] - a.name[a.name - 2]);
        }
    })
    attestations = attestations.filter(attestation => !attestation.isChild)
}

console.log(JSON.stringify(attestations))
