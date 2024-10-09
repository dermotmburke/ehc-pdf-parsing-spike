import extractFormFields from "@cityssm/pdf-form-extract"

const data = await extractFormFields("/Users/dermotburke/pdf-extract-text/8361_EN_rs_-_SPECIMEN_V4.pdf")
console.log(data)

const dataWithOptions = await extractFormFields("/Users/dermotburke/pdf-extract-text/form-spcs2.pdf", { useFieldName: true })
console.log(data)