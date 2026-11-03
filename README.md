# PDMO - Trabalho Prático: CRUD de Alunos

Aplicativo mobile desenvolvido em **React** simulando o ecossistema **React Native** para o trabalho prático de **Programação para Dispositivos Móveis (PDMO)**.

O objetivo do projeto é compreender e aplicar as quatro operações do **CRUD (Create, Read, Update, Delete)** de forma simples e intuitiva, abordando tanto o modelo local quanto a integração com API HTTP.

---

## 📱 Recursos e Fases do Projeto

### 1. Fase 1: CRUD Local (Laboratório)
- **CREATE**: Cadastra novos alunos informando nome e curso, gerando um ID numérico único.
- **READ**: Exibe a lista de alunos cadastrados em formato de lista otimizada (`FlatList`).
- **UPDATE**: Permite selecionar um aluno, carregar seus dados no formulário e salvar as alterações (`map`).
- **DELETE**: Exclui o aluno selecionado com confirmação por alerta nativo (`filter`).
- **Validação**: Bloqueia cadastro e edição caso o nome ou o curso estejam em branco (`Alert`).

### 2. Fase 2: CRUD com API HTTP
- **POST** (`/api/alunos`): Envia novo aluno via JSON (`JSON.stringify`).
- **GET** (`/api/alunos`): Consulta e converte a lista retornada (`response.json`).
- **PUT** (`/api/alunos/:id`): Atualiza os dados do aluno no servidor.
- **DELETE** (`/api/alunos/:id`): Remove o aluno do servidor.
- **Recursos Assíncronos**: `async / await`, `try / catch / finally`, `response.ok`, e indicador de carregamento visual (`ActivityIndicator`).
- **Inspetor HTTP**: Console integrado para acompanhar requisições, status e payloads em tempo real.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Express 4** (Backend API HTTP)
- **Tailwind CSS v4**
- **Lucide Icons**
- **Vite**

---

## 🚀 Como Executar Localmente

1. **Clone o repositório:**
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

4. Abra seu navegador em `http://localhost:3000`.

---

## 📦 Estrutura de Pastas

```
├── server.ts                    # Servidor Express e endpoints da API HTTP (/api/alunos)
├── src/
│   ├── components/
│   │   ├── ActivityIndicator.tsx # Indicador visual de carregamento
│   │   ├── AlertModal.tsx        # Modal simulando o Alert.alert nativo
│   │   └── HttpConsoleModal.tsx  # Inspetor de requisições HTTP em tempo real
│   ├── types/
│   │   └── aluno.ts              # Definições de tipos e interfaces TypeScript
│   ├── App.tsx                   # Componente principal do CRUD e moldura mobile
│   ├── main.tsx                  # Ponto de entrada do React
│   └── index.css                 # Estilos globais e Tailwind CSS
└── package.json
```
