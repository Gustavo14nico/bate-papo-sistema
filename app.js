import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(session({
    secret: "chave-dahora",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}));
app.set('trust proxy', 1);

const PORTA = 3000;

const assuntosDisponiveis = [
  "Futebol",
  "Games",
  "Carros",
  "Música",
  "Filmes",
  "Coisas",
  "Mangás",
  "Programação",
  "Geral"
];

let contas = [
  {
    id: 1,
    nome: "admin",
    dataNascimento: "1990-01-01",
    apelido: "admin",
    assuntoPreferido: "Coisas",
    senha: "admin123",
    login: "admin@gmail.com"
  }
];

let mensagensPublicas = [];   
let mensagensPrivadas = [];   

function middlewareLogin(req, res, next) {
    if (req.session && req.session.usuario) {
        next();
    } else {
        res.status(401).json({ resultado: "Acesso negado! Faça login primeiro." });
    }
}

app.post("/login", (req, res) => {
    let { login, senha } = req.body;
    let conta = contas.find(x => login === x.login);

    if (!conta || conta.senha !== senha) {
        return res.status(401).json({ resultado: "Conta não encontrada!" });
    }

    req.session.usuario = conta;
    res.status(200).json({ resultado: "Login realizado com sucesso!" });
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ resultado: "Logout realizado com sucesso!" });
    });
});

app.post("/cadastrar", (req, res) => {
    let { nome, dataNascimento, apelido, assuntoPreferido, senha } = req.body;

    if (!assuntosDisponiveis.includes(assuntoPreferido)) {
        return res.status(400).json({
            resultado: "Assunto inválido!",
            sugestoes: assuntosDisponiveis
        });
    }

    let id = contas.length > 0 ? contas[contas.length - 1].id + 1 : 1;
    contas.push({ id, nome, dataNascimento, apelido, assuntoPreferido, senha });

    res.status(201).json({
        resultado: "Criado com sucesso!",
        conta: { nome, dataNascimento }
    });
});


// Aqui eu acabei fazendo errado e perdendo tempo, mas tá ai para n jogar fora

// app.post("/mensagem/enviar/:idUsuarioEnviando/:idUsuarioEnviado", middlewareLogin, (req, res) => {
//     const { mensagem } = req.body;
//     const { idUsuarioEnviando, idUsuarioEnviado } = req.params;

//     const id = mensagensPrivadas.length > 0 ? mensagensPrivadas[mensagensPrivadas.length - 1].id + 1 : 1;

//     mensagensPrivadas.push({
//         id,
//         idUsuarioEnviando,
//         idUsuarioEnviado,
//         mensagem
//     });

//     res.status(201).json({ resultado: "Mensagem privada enviada com sucesso!" });
// });

// app.post("/mensagem/receber/:idUsuarioEnviando/:idUsuarioEnviado", middlewareLogin, (req, res) => {
//     const { idUsuarioEnviado, idUsuarioEnviando } = req.params;

//     const mensagensUsuario = mensagensPrivadas.filter(
//         x =>
//             (x.idUsuarioEnviando === idUsuarioEnviando && x.idUsuarioEnviado === idUsuarioEnviado) ||
//             (x.idUsuarioEnviando === idUsuarioEnviado && x.idUsuarioEnviado === idUsuarioEnviando)
//     );

//     if (mensagensUsuario.length <= 0) {
//         return res.status(200).json({ resultado: "Nenhuma mensagem encontrada!", mensagens: [] });
//     }

//     res.status(200).json({ resultado: "Mensagens privadas encontradas", mensagens: mensagensUsuario });
// });


app.get("/mensagens/:assunto", middlewareLogin, (req, res) => {
    const { assunto } = req.params;

    if (!assuntosDisponiveis.includes(assunto)) {
        return res.status(400).json({
            resultado: "Assunto inválido!",
            sugestoes: assuntosDisponiveis
        });
    }

    const mensagensDoAssunto = mensagensPublicas.filter(msg => msg.assunto === assunto);

    res.status(200).json({
        resultado: "Mensagens encontradas",
        mensagens: mensagensDoAssunto
    });
});

app.post("/mensagens/:assunto", middlewareLogin, (req, res) => {
    const { assunto } = req.params;
    const { texto } = req.body;

    if (!texto) {
        return res.status(400).json({ resultado: "Mensagem vazia!" });
    }

    if (!assuntosDisponiveis.includes(assunto)) {
        return res.status(400).json({
            resultado: "Assunto inválido!",
            sugestoes: assuntosDisponiveis
        });
    }

    const id = mensagensPublicas.length > 0 ? mensagensPublicas[mensagensPublicas.length - 1].id + 1 : 1;

    const novaMensagem = {
        id,
        usuario: req.session.usuario.apelido,
        assunto,
        texto
    };

    mensagensPublicas.push(novaMensagem);

    res.status(201).json({ resultado: "Mensagem enviada com sucesso!", mensagem: novaMensagem });
});


app.get("/usuarios", middlewareLogin, (req, res) => {
    res.status(200).json({ contas });
});

app.get("/assuntos", (req, res) => {
    res.status(200).json({ assuntos: assuntosDisponiveis });
});

app.get("/logado", (req, res) => {
  if (req.session && req.session.usuario) {
    const { senha, ...usuarioSemSenha } = req.session.usuario;
    res.status(200).json({ usuario: usuarioSemSenha });
  } else {
    res.status(401).json({ resultado: "Não autenticado" });
  }
});

// app.listen(PORTA, () => {
//    console.log(`Rodando na porta ${PORTA}`);
// });

module.exports = app;