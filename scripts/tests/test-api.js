const FormData = require('form-data');
const fetch = require('node-fetch');

async function testApi() {
    try {
        const form = new FormData();
        const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
        form.append('resume', dummyPdf, { filename: 'test.pdf', contentType: 'application/pdf' });
        form.append('jobDescription', 'Software Engineer');

        console.log('Sending request to http://localhost:3000/api/resume-analyzer...');
        const res = await fetch('http://localhost:3000/api/resume-analyzer', {
            method: 'POST',
            body: form
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text.substring(0, 150));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testApi();
