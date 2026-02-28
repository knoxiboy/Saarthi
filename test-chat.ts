import axios from 'axios';

(async () => {
    try {
        const response = await axios.post('http://localhost:3000/api/ai-career-chat-agent', {
            userInput: "how can it give conclusion like gap identfication even without taking interview",
            conversationHistory: [
                { role: "user", content: "MERN Stack developer" },
                { role: "assistant", content: "As a MERN Stack developer..." },
                { role: "user", content: "how can it give conclusion like gap identfication even without taking interview" }
            ]
        });
        console.log("Success:", response.data);
    } catch (e: any) {
        console.log("Error:", e.response?.data || e.message);
    }
})();
