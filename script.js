window.addEventListener("load", () => {
    const chatMessages = document.getElementById("messages");
    const msgInput = document.getElementById("msgInput");
    const sendBtn = document.getElementById("sendBtn");

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => console.log("WebSocket connected");
    socket.onclose = () => console.log("WebSocket disconnected");

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const div = document.createElement("div");

        if (data.type === "status") {
            div.className = "status";
            div.textContent = data.text;
        } else if (data.type === "message") {
            div.className = "msg";
            div.textContent = `${data.user} (${data.time}): ${data.text}`;
        }

        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    function sendMsg() {
        if (!msgInput.value.trim()) return;
        socket.send(msgInput.value);
        msgInput.value = "";
        msgInput.focus();
    }

    sendBtn.addEventListener("click", sendMsg);
    msgInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMsg();
    });
});
