const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

// ⚠️ Ganti dengan API key kamu
const OPENAI_API_KEY = "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";

// Tambahkan pesan ke chat
function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add(sender === "user" ? "user-message" : "bot-message");

  const messageText = document.createElement("div");
  messageText.classList.add("message");

  // Gunakan innerHTML supaya link bisa diklik
  messageText.innerHTML = sender === "bot" ? markdownToHTML(text) : text;

  messageDiv.appendChild(messageText);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🔧 Markdown → HTML versi ringkas & rapi
function markdownToHTML(md) {
  let html = md
    // Hapus simbol markdown
    .replace(/^#{1,6}\s?/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^\d+\.\s+(.*)$/gm, "• $1")
    .replace(/^\s*[-*]\s+(.*)$/gm, "• $1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // markdown link
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>') // auto-link URL polos
    // Ganti 2+ enter menjadi 1 <br>
    .replace(/\n{2,}/g, "<br>")
    // Ganti enter tunggal jadi <br>
    .replace(/\n/g, "<br>")
    // Hapus <br> ganda (biar ga dobel)
    .replace(/(<br>\s*){2,}/g, "<br>")
    // Hapus <br> di awal & akhir
    .replace(/^(<br>)+|(<br>)+$/g, "")
    .trim();

  return html;
}



// Ambil respons dari OpenAI
async function getBotResponse(userText) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
            Kamu adalah **Dunlop AI**, asisten virtual resmi dari **Dunlop Indonesia**.

            🎯 **Tujuan Utama:**
            - Memberikan informasi akurat dan profesional seputar produk, teknologi, dan layanan Dunlop.
            - Gunakan gaya bahasa yang sopan, profesional, dan mudah dibaca.
            - Hindari penggunaan simbol markdown seperti ### atau tanda pagar.
            - Jawaban harus rapi: gunakan list, poin, atau paragraf singkat tanpa spasi berlebihan.
            - Gunakan **bold** untuk nama produk, tipe ban, atau istilah penting.

            🌐 **Sumber Resmi:**
            Jika pengguna ingin tahu lebih lanjut, arahkan dengan sopan ke situs resmi Dunlop Indonesia:
            https://www.dunlop.co.id/en

            ⚠️ **Batasan Topik:**
            Jika pengguna mengajukan pertanyaan yang tidak berhubungan dengan Dunlop, produk Dunlop, ban, layanan, atau teknologi terkait Dunlop Indonesia, 
            jangan menjawab pertanyaan tersebut. 
            Sebaliknya, berikan tanggapan singkat dan sopan seperti:
            "Maaf, saya hanya dapat membantu menjawab pertanyaan yang berkaitan dengan produk dan layanan Dunlop Indonesia. 
            Silakan ajukan pertanyaan seputar Dunlop, ya."

            Selalu jaga konsistensi gaya komunikasi agar terlihat seperti asisten virtual resmi perusahaan.
            `,

          },
          { role: "user", content: userText },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      return "Maaf, saya tidak dapat memproses permintaan saat ini.";
    }
  } catch (error) {
    console.error("Error:", error);
    return "Terjadi kesalahan koneksi ke server AI.";
  }
}

// Event kirim pesan
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (userText === "") return;

  addMessage("user", userText);
  userInput.value = "";

  const typingDiv = document.createElement("div");
  typingDiv.classList.add("bot-message");
  typingDiv.innerHTML = `<div class="message"><em>Dunlop AI sedang mengetik...</em></div>`;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  const botReply = await getBotResponse(userText);

  chatBox.removeChild(typingDiv);
  addMessage("bot", botReply);
});
