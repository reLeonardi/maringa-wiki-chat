document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form");
  const input = document.getElementById("pergunta");
  const chat = document.getElementById("chat");
  const historicoEl = document.getElementById("historico");
  const novaConversaBtn = document.getElementById("novaConversa");

  let conversas = JSON.parse(localStorage.getItem("conversas")) || [];
  let conversaAtivaId = null;

  function renderHistorico() {
    historicoEl.innerHTML = '';
    conversas.sort((a, b) => b.data - a.data);
    conversas.forEach((conversa, idx) => {
      const li = document.createElement("li");
      li.className = "flex justify-between items-center p-2 bg-white rounded cursor-pointer hover:bg-green-100 mb-1";
      const tituloTexto = conversa.titulo || `Conversa ${idx + 1}`;
      const tituloEl = document.createElement("span");
      tituloEl.textContent = tituloTexto;
      tituloEl.className = conversaAtivaId === conversa.id ? "font-bold text-green-700" : "";
      tituloEl.style.flexGrow = "1";
      tituloEl.onclick = () => {
        conversaAtivaId = conversa.id;
        renderHistorico();
        renderChat();
      };
      const excluirBtn = document.createElement("button");
      excluirBtn.textContent = "✕";
      excluirBtn.title = "Excluir conversa";
      excluirBtn.className = "text-red-600 hover:text-red-900 font-bold ml-2";
      excluirBtn.onclick = (e) => {
        e.stopPropagation();
        excluirConversa(conversa.id);
      };
      li.appendChild(tituloEl);
      li.appendChild(excluirBtn);
      historicoEl.appendChild(li);
    });
  }

  function renderChat() {
    chat.innerHTML = '';
    if (!conversaAtivaId) {
      chat.innerHTML = '<p class="text-gray-500 italic">Digite algo para começar a conversar.</p>';
      return;
    }
    const conversa = conversas.find(c => c.id === conversaAtivaId);
    if (!conversa || !conversa.mensagens) return;
    conversa.mensagens.forEach(msg => {
      const div = document.createElement("div");
      if (msg.tipo === "usuario") {
        div.className = "text-right";
        div.innerHTML = `<p class="bg-gray-100 p-2 rounded inline-block mb-2">${msg.texto}</p>`;
      } else {
        div.innerHTML = `<p class="p-2 inline-block mb-2 text-gray-800">${msg.texto}</p>`;
      }
      chat.appendChild(div);
    });
    chat.scrollTop = chat.scrollHeight;
  }

  function criarNovaConversa() {
    const id = Date.now().toString();
    const nova = { id, titulo: null, mensagens: [], data: Date.now() };
    conversas.push(nova);
    conversaAtivaId = id;
    salvarConversas();
    renderHistorico();
    renderChat();
  }

  function salvarConversas() {
    localStorage.setItem("conversas", JSON.stringify(conversas));
  }

  function atualizarTitulo(conversa) {
    if (!conversa.titulo && conversa.mensagens.length) {
      const primeira = conversa.mensagens.find(m => m.tipo === "usuario");
      if (primeira) {
        conversa.titulo = primeira.texto.substring(0, 30) + (primeira.texto.length > 30 ? "..." : "");
      }
    }
  }

  function excluirConversa(id) {
    conversas = conversas.filter(c => c.id !== id);
    if (conversaAtivaId === id) {
      conversaAtivaId = conversas.length > 0 ? conversas[0].id : null;
    }
    salvarConversas();
    renderHistorico();
    renderChat();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;

    if (!conversaAtivaId) criarNovaConversa();

    const conversa = conversas.find(c => c.id === conversaAtivaId);
    conversa.data = Date.now();
    conversa.mensagens.push({ tipo: "usuario", texto });
    renderChat();
    salvarConversas();

    input.value = "";
    input.disabled = true;

    const respostaDiv = document.createElement("div");
    respostaDiv.innerHTML = `<p class="p-2 inline-block mb-2 text-gray-800 italic">Pensando...</p>`;
    chat.appendChild(respostaDiv);
    chat.scrollTop = chat.scrollHeight;

    try {
      const res = await fetch("http://localhost:8000/perguntar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: texto })
      });


      const data = await res.json();
      conversa.mensagens.push({ tipo: "bot", texto: data.resposta });
    } catch (err) {
      conversa.mensagens.push({ tipo: "bot", texto: "Erro ao conectar com o servidor." });
    }

    atualizarTitulo(conversa);
    salvarConversas();
    renderChat();
    renderHistorico();
    input.disabled = false;
    input.focus();
  });

  novaConversaBtn.addEventListener("click", criarNovaConversa);

  document.getElementById("btnCompartilhar").addEventListener("click", () => {
    alert("Funcionalidade de compartilhar ainda não implementada.");
  });

  if (conversas.length > 0) {
    conversaAtivaId = conversas[0].id;
  }
  renderHistorico();
  renderChat();
});