import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateCourseOutline(topic: string, context?: string) {
    const prompt = `
You are an expert curriculum designer. 
Generate a comprehensive, professional course outline for the topic: "${topic}".
${context ? `Additional Context: ${context}` : ""}

Output Requirement:
You MUST respond with a valid JSON object ONLY. Use exactly these keys:
{
  "title": "Course Title",
  "description": "Comprehensive description of the course.",
  "modules": [
    {
      "title": "Module Title",
      "order": 1,
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Detailed educational content for this lesson. Use markdown.",
          "takeaways": ["Takeaway 1", "Takeaway 2"],
          "order": 1
        }
      ]
    }
  ]
}
`;

    try {
        console.log(`AI: Generating course for topic: ${topic}`);
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are an expert curriculum designer. Always output valid JSON strictly following the requested structure." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const aiOutput = response.data.choices[0].message.content;
        const result = JSON.parse(aiOutput);

        // Robust normalization
        let rawModules = result.modules || result.courseOutline || result.outline || result.course_outline || [];
        if (!Array.isArray(rawModules)) {
            // Find any property that is an array
            const foundArray = Object.values(result).find(val => Array.isArray(val));
            rawModules = Array.isArray(foundArray) ? foundArray : [];
        }

        const normalized = {
            title: result.title || result.courseTitle || result.course_title || topic || "Untitled Course",
            description: result.description || result.courseDescription || result.course_description || "",
            modules: rawModules
        };

        // Normalize modules and lessons
        normalized.modules = normalized.modules.map((m: any, idx: number) => {
            let rawLessons = m.lessons || m.topics || m.units || m.content || [];
            if (!Array.isArray(rawLessons)) rawLessons = [];

            return {
                title: m.title || m.moduleTitle || m.module_title || `Module ${idx + 1}`,
                order: m.order || idx + 1,
                lessons: rawLessons.map((l: any, lIdx: number) => ({
                    title: l.title || l.lessonTitle || l.lesson_title || l.topic || `Lesson ${lIdx + 1}`,
                    content: l.content || l.explanation || l.details || "",
                    takeaways: l.takeaways || l.keyTakeaways || l.key_takeaways || [],
                    order: l.order || lIdx + 1
                }))
            };
        });

        console.log(`AI: Successfully generated ${normalized.modules.length} modules for "${normalized.title}"`);
        return normalized;
    } catch (error: any) {
        console.error("Groq Course Generation Error:", error.response?.data || error.message);
        throw new Error("Failed to generate course outline via AI");
    }
}

export async function generateQuiz(lessonText: string) {
    const prompt = `
Given the following lesson content, generate 5 multiple-choice questions. 
Each question must have 4 options and one clearly marked correct answer.

Lesson Content:
${lessonText}

Output Requirement:
Respond with a valid JSON array of objects ONLY. No wrapper object.
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]
`;

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are an expert educator. Always output a valid JSON array of objects. Do not wrap the array in another object." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const aiOutput = response.data.choices[0].message.content;
        const result = JSON.parse(aiOutput);

        let quizArray: any[] = [];
        if (Array.isArray(result)) quizArray = result;
        else if (result.quiz && Array.isArray(result.quiz)) quizArray = result.quiz;
        else if (result.questions && Array.isArray(result.questions)) quizArray = result.questions;
        else if (result.items && Array.isArray(result.items)) quizArray = result.items;
        else {
            const possibleArray = Object.values(result).find(val => Array.isArray(val));
            if (possibleArray) quizArray = possibleArray as any[];
        }

        // Normalize quiz items
        return quizArray.map((q: any) => ({
            question: q.question || q.title || "",
            options: q.options || q.choices || [],
            correctAnswer: q.correctAnswer || q.answer || q.correct || ""
        }));

    } catch (error: any) {
        console.error("Groq Quiz Generation Error:", error.response?.data || error.message);
        return [];
    }
}
