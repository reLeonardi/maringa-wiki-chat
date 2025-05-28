let baseConhecimento = [];

async function carregarBaseConhecimento() {
  const res = await fetch("C:/maringa_wiki/data");
  baseConhecimento = await res.json();
}

// Função para calcular similaridade simples entre textos
function similaridade(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const palavrasA = new Set(a.split(/\s+/));
  const palavrasB = new Set(b.split(/\s+/));
  const intersecao = [...palavrasA].filter(p => palavrasB.has(p));
  return intersecao.length / Math.max(palavrasA.size, palavrasB.size);
}

// Busca a pergunta mais parecida
function buscarResposta(perguntaUsuario) {
  let melhor = { score: 0, resposta: "Desculpe, não encontrei uma resposta para isso." };
  for (const item of baseConhecimento) {
    const score = similaridade(perguntaUsuario, item.pergunta);
    if (score > melhor.score) {
      melhor = { score, resposta: item.resposta };
    }
  }
  // Define limite mínimo de similaridade
  return melhor.score >= 0.3 ? melhor.resposta : "Desculpe, não encontrei uma resposta parecida.";
}


document.addEventListener("DOMContentLoaded", async () => {
  await carregarBaseConhecimento();

  const form = document.getElementById("form");
  const input = document.getElementById("pergunta");
  const chat = document.getElementById("chat");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pergunta = input.value;
    input.value = "";

    // Mostra pergunta do usuário
    const perguntaDiv = document.createElement("div");
    perguntaDiv.className = "text-right";
    perguntaDiv.innerHTML = `<p class="bg-gray-100 p-2 rounded inline-block mb-2">${pergunta}</p>`;
    chat.appendChild(perguntaDiv);

    // Mostra resposta
    const respostaDiv = document.createElement("div");
    respostaDiv.innerHTML = `<p class="p-2 inline-block mb-2 text-gray-800 italic">Pensando...</p>`;
    chat.appendChild(respostaDiv);

    const resposta = buscarResposta(pergunta);
    respostaDiv.innerHTML = `<p class="p-2 inline-block mb-2 text-gray-800">${resposta}</p>`;
  });
});
