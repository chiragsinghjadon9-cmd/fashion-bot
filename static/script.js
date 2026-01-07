document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script Loaded");

    const chatForm = document.getElementById("chat-form");
    const textInput = document.getElementById("text-input");
    const imageInput = document.getElementById("image-input");
    const chatContainer = document.getElementById("chat-container");
    const welcomeScreen = document.getElementById("welcome-screen");
    const sendBtn = document.getElementById("send-btn");
    
    // Preview Elements
    const previewContainer = document.getElementById("image-preview-container");
    const previewImage = document.getElementById("image-preview");
    const removeImageBtn = document.getElementById("remove-image-btn");

    const BACKEND_URL = "http://127.0.0.1:8000/chat";

    // --- 1. ENABLE/DISABLE SEND BUTTON ---
    function toggleSendBtn() {
        const hasText = textInput.value.trim() !== "";
        const hasImage = imageInput.files.length > 0;

        if (hasText || hasImage) {
            sendBtn.disabled = false;
            sendBtn.style.background = "white"; 
            sendBtn.style.color = "black";
            sendBtn.style.cursor = "pointer";
        } else {
            // Optional: You can keep it enabled if you removed 'disabled' from HTML
            sendBtn.disabled = true; 
            sendBtn.style.background = "#333";
            sendBtn.style.color = "#555";
            sendBtn.style.cursor = "default";
        }
    }

    // Listen for typing or image selection
    textInput.addEventListener("input", toggleSendBtn);
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewContainer.classList.remove("hidden");
                toggleSendBtn();
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove Image Logic
    if(removeImageBtn) {
        removeImageBtn.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent form submit
            imageInput.value = "";
            previewContainer.classList.add("hidden");
            toggleSendBtn();
        });
    }

    // --- 2. SUGGESTION CARDS CLICK ---
    window.fillInput = (text) => {
        textInput.value = text;
        toggleSendBtn();
        textInput.focus();
    };

    // --- 3. HANDLE FORM SUBMIT ---
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // STOP PAGE REFRESH
        console.log("🚀 Sending Message...");

        const text = textInput.value.trim();
        const image = imageInput.files[0];

        if (!text && !image) {
            console.log("⚠️ Input is empty");
            return;
        }

        // UI Updates
        welcomeScreen.style.display = "none";
        chatContainer.style.display = "block";
        previewContainer.classList.add("hidden");

        // Add User Message
        addMessage("user", text, image);

        // Reset Form
        textInput.value = "";
        imageInput.value = "";
        toggleSendBtn();

        // Loading
        const loadingId = addLoadingMessage();

        // Backend Request
        const formData = new FormData();
        formData.append("text", text);
        if (image) formData.append("image", image);

        try {
            const response = await fetch(BACKEND_URL, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const data = await response.json();
            removeMessage(loadingId);
            addMessage("bot", data.reply);

        } catch (error) {
            console.error("❌ Error:", error);
            removeMessage(loadingId);
            addMessage("bot", "⚠️ Error: Could not connect to backend.");
        }
    });

    // --- HELPERS ---
    function addMessage(role, text, imageFile) {
        const isUser = role === "user";
        const row = document.createElement("div");
        row.className = "message-row";

        const content = document.createElement("div");
        content.className = "message-content";

        const avatar = document.createElement("div");
        avatar.className = `msg-avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`;
        avatar.innerText = isUser ? "U" : "AI";

        const textDiv = document.createElement("div");
        textDiv.className = "msg-text";

        if (imageFile && isUser) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(imageFile);
            img.className = "chat-image";
            textDiv.appendChild(img);
        }

        if (text) {
            const textSpan = document.createElement("div");
            textSpan.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            textDiv.appendChild(textSpan);
        }

        content.appendChild(avatar);
        content.appendChild(textDiv);
        row.appendChild(content);
        chatContainer.appendChild(row);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function addLoadingMessage() {
        const id = "loading-" + Date.now();
        const row = document.createElement("div");
        row.className = "message-row";
        row.id = id;
        row.innerHTML = `
            <div class="message-content">
                <div class="msg-avatar bot-avatar">AI</div>
                <div class="msg-text">
                    <div class="typing-indicator"><span></span><span></span><span></span></div>
                </div>
            </div>`;
        chatContainer.appendChild(row);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
});
