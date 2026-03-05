const pdf = require('pdf-parse');
const pdfParse = typeof pdf === 'function' ? pdf : pdf.default;
import fs from 'fs';

(async () => {
    try {
        console.log("Testing pdf-parse...");
        // Use a dummy PDF or just a random buffer to see if it even initializes
        const buffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");
        const data = await pdfParse(buffer);
        console.log("PDF parsed successfully:", data.text);
    } catch (e: any) {
        console.error("PDF parse error:", e.message);
    }
})();
