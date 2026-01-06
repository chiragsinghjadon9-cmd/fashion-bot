const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const textInput = document.getElementById("text-input");
const imageInput = document.getElementById("image-input");

const BACKEND_URL = "http://localhost:8000/chat"; 
// later → https://your-render-app.onrender.com/chat

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = textInput.value;
  const image = imageInput.files[0];

  if (!text && !image) return;

  addMessage(text || "📷 Image sent", "user");

  const formData = new FormData();
  if (text) formData.append("text", text);
  if (image) formData.append("image", image);

  textInput.value = "";
  imageInput.value = "";

  addMessage("Thinking...", "bot");

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  chatBox.lastChild.remove(); // remove "Thinking..."
  addMessage(data.reply, "bot");
});
