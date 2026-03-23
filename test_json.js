function extractJsonFromMarkdown(text) {
    let cleanText = text;
    // Strip markdown code blocks if they exist. Match any language identifier (e.g., json, python, bash)
    const match = text.match(/```[a-zA-Z]*\s*([\s\S]*)\s*```/i);
    if (match) {
        cleanText = match[1];
    }

    cleanText = cleanText.trim();

    // Find the first '{' or '[' and extract up to the last '}' or ']'
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');

    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
        startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        startIdx = firstBrace;
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
    }

    if (startIdx !== -1) {
        const isObject = cleanText[startIdx] === '{';
        const endIdx = isObject ? cleanText.lastIndexOf('}') : cleanText.lastIndexOf(']');
        if (endIdx > startIdx) {
            cleanText = cleanText.substring(startIdx, endIdx + 1);
        }
    }

    return cleanText;
}

const tests = [
    "```json\n{\"a\": 1}\n```",
    "```python\n{\"a\": 1}\n```",
    "```\n{\"a\": 1}\n```",
    "python\n# MLOps\n{\"a\": 1}",
    "bash\npip install x\n[{\"a\": 1}]"
];

tests.forEach((t, i) => {
    try {
        const ext = extractJsonFromMarkdown(t);
        JSON.parse(ext);
        console.log(`Test ${i} PASSED:`, ext);
    } catch (e) {
        console.log(`Test ${i} FAILED:`, e.message, "\nGot:", extractJsonFromMarkdown(t));
    }
});
