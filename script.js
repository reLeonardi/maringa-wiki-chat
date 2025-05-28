const form = document.getElementById("form");
const input = document.getElementById("pergunta");
const chat = document.getElementById("chat");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pergunta = input.value;
  input.value = "";

  // Mensagem do usuário: fundo cinza claro
  const perguntaDiv = document.createElement("div");
  perguntaDiv.className = "text-right";
  perguntaDiv.innerHTML = `<p class="bg-gray-100 p-2 rounded inline-block mb-2">${pergunta}</p>`;
  chat.appendChild(perguntaDiv);

  // Mensagem de resposta: temporária com texto "Pensando..."
  const respostaDiv = document.createElement("div");
  respostaDiv.innerHTML = `<p class="p-2 inline-block mb-2 text-gray-800 italic">Pensando...</p>`;
  chat.appendChild(respostaDiv);

  const res = await fetch("http://localhost:8000/perguntar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pergunta })
  });

  const data = await res.json();

  // Resposta do sistema: sem fundo
  respostaDiv.innerHTML = `<p class="p-2 inline-block mb-2 text-gray-800">${data.resposta}</p>`;
});
