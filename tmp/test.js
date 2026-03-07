fetch("http://localhost:3000/api/mock-interview/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "Custom", topic: "React", duration: "15 min", difficulty: "Medium" })
}).then(res => res.text()).then(console.log).catch(console.error);
