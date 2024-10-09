import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", (errData) =>
    console.error(errData.parserError)
);
pdfParser.on("pdfParser_dataReady", (pdfData) => {
    fs.writeFile(
        "./F1040EZ.json",
        JSON.stringify(pdfData),
        (data) => console.log(data)
    );
});

pdfParser.loadPDF("/Users/dermotburke/pdf-extract-text/form-spcs2.pdf");