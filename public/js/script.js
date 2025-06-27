const API = "http://localhost:3000";

function mostrarLogin() {
  alternarSecao("loginSection");
}

function mostrarMenu() {
  alternarSecao("menuSection");
}

function mostrarCadastro() {
  alternarSecao("cadastroSection");
  listarUsuarios();
}

function mostrarChat() {
  alternarSecao("chatSection");
  carregarAssuntos();
}

function voltarMenu() {
  mostrarMenu();
}

function alternarSecao(id) {
  ["loginSection", "menuSection", "cadastroSection", "chatSection"].forEach(sec => {
    document.getElementById(sec).style.display = "none";
  });
  document.getElementById(id).style.display = "block";
}

async function fazerLogin() {
  const login = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ login, senha })
  });

  const data = await res.json();
  if (res.ok) {
    mostrarMenu();
  } else {
    document.getElementById("erroLogin").innerText = data.resultado || "Erro";
  }
}

async function cadastrarUsuario() {
  const nome = document.getElementById("nome").value;
  const dataNascimento = document.getElementById("dataNascimento").value;
  const apelido = document.getElementById("apelido").value;
  const assunto = document.getElementById("assuntoPreferido").value;
  const senha = document.getElementById("senhaCadastro").value;
  const login = document.getElementById("loginCadastro").value;

  if (!nome || !dataNascimento || !apelido || !assunto || !senha || !login) {
    alert("Preencha todos os campos.");
    return;
  }

  const res = await fetch(`${API}/cadastrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ nome, dataNascimento, apelido, assuntoPreferido: assunto, senha, login })
  });

  const data = await res.json();
  if (res.ok) {
    alert(data.resultado);
    await listarUsuarios();
  } else {
    alert(data.resultado || "Erro ao cadastrar");
  }
}

async function listarUsuarios() {
  const res = await fetch(`${API}/usuarios`, { credentials: "include" });
  const data = await res.json();
  const listaDiv = document.getElementById("listaUsuarios");

  listaDiv.innerHTML = "<h3>Usuários Cadastrados</h3><ul>" +
    data.contas.map(u => `<li>${u.nome} (${u.apelido}) - ${u.assuntoPreferido}</li>`).join("") +
    "</ul>";
}

async function carregarAssuntos() {
  const res = await fetch(`${API}/assuntos`);
  const data = await res.json();
  const selectCadastro = document.getElementById("assuntoPreferido");
  const selectChat = document.getElementById("chatAssuntoSelect");

  selectCadastro.innerHTML = "<option value=''>Selecione um assunto</option>";
  selectChat.innerHTML = "<option value=''>Escolha o assunto</option>";

  data.assuntos.forEach(assunto => {
    selectCadastro.innerHTML += `<option value="${assunto}">${assunto}</option>`;
    selectChat.innerHTML += `<option value="${assunto}">${assunto}</option>`;
  });
}

async function carregarMensagens() {
  const assunto = document.getElementById("chatAssuntoSelect").value;
  if (!assunto) return;

  const res = await fetch(`${API}/mensagens/${assunto}`, { credentials: "include" });
  const data = await res.json();

  const mensagensDiv = document.getElementById("mensagensContainer");
  mensagensDiv.innerHTML = "<h3>Mensagens</h3><ul>" +
    data.mensagens.map(m => `<li><strong>${m.usuario}:</strong> ${m.texto}</li>`).join("") +
    "</ul>";
}

async function enviarMensagem() {
  const assunto = document.getElementById("chatAssuntoSelect").value;
  const texto = document.getElementById("mensagemTexto").value;

  if (!texto || !assunto) return;

  await fetch(`${API}/mensagens/${assunto}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ texto })
  });

  document.getElementById("mensagemTexto").value = "";
  await carregarMensagens();
}

async function fazerLogout() {
  await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
  mostrarLogin();
}

async function verificarSessao() {
  try {
    const res = await fetch(`${API}/logado`, { credentials: "include" });
    if (res.ok) {
      mostrarMenu();
      await carregarAssuntos();
    } else {
      mostrarLogin();
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    mostrarLogin();
  }
}


verificarSessao();
carregarAssuntos();
