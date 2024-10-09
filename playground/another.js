const { load } = require('@pspdfkit/nodejs');
const fs = require('node:fs');

async function convertToPDF() {
    const pdf = fs.readFileSync('/Users/dermotburke/pdf-extract-text/8361_EN_rs_-_SPECIMEN_V4.pdf');
    const instance = await load({document: pdf});


    const instantJSON = await instance.exportInstantJSON();

    const formFieldValues = instantJSON.formFieldValues;
    console.log(instantJSON);
};

convertToPDF();