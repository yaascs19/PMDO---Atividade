import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Aluno {
  id: number;
  nome: string;
  curso: string;
}

let alunos: Aluno[] = [
  { id: 1, nome: 'João da Silva', curso: 'Informática' },
  { id: 2, nome: 'Maria Oliveira', curso: 'Administração' },
  { id: 3, nome: 'Pedro Santos', curso: 'Desenvolvimento de Sistemas' },
  { id: 4, nome: 'Ana Costa', curso: 'Redes de Computadores' }
];

let nextId = 5;

const app = express();
app.use(express.json());

// API HTTP CRUD de Alunos (Fase 2 do Trabalho Prático PDMO)
// GET: Consultar a lista de alunos
app.get('/api/alunos', (_req: Request, res: Response) => {
  res.json(alunos);
});

// POST: Cadastrar um novo aluno
app.post('/api/alunos', (req: Request, res: Response) => {
  const { nome, curso } = req.body;

  if (!nome || !curso || !nome.trim() || !curso.trim()) {
    return res.status(400).json({ error: 'Nome e curso são obrigatórios!' });
  }

  const novoAluno: Aluno = {
    id: nextId++,
    nome: nome.trim(),
    curso: curso.trim()
  };

  alunos.push(novoAluno);
  return res.status(201).json(novoAluno);
});

// PUT: Alterar um aluno existente
app.put('/api/alunos/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { nome, curso } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (!nome || !curso || !nome.trim() || !curso.trim()) {
    return res.status(400).json({ error: 'Nome e curso são obrigatórios!' });
  }

  const index = alunos.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Aluno não encontrado' });
  }

  alunos[index] = {
    id,
    nome: nome.trim(),
    curso: curso.trim()
  };

  return res.json(alunos[index]);
});

// DELETE: Excluir um aluno
app.delete('/api/alunos/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const index = alunos.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Aluno não encontrado' });
  }

  const removido = alunos.splice(index, 1)[0];
  return res.json({ success: true, message: 'Aluno removido com sucesso!', aluno: removido });
});

// Endpoint auxiliar para resetar a lista de alunos para testes
app.post('/api/alunos/reset', (_req: Request, res: Response) => {
  alunos = [
    { id: 1, nome: 'João da Silva', curso: 'Informática' },
    { id: 2, nome: 'Maria Oliveira', curso: 'Administração' },
    { id: 3, nome: 'Pedro Santos', curso: 'Desenvolvimento de Sistemas' },
    { id: 4, nome: 'Ana Costa', curso: 'Redes de Computadores' }
  ];
  nextId = 5;
  return res.json({ success: true, alunos });
});

// Configuração do Vite dev server ou arquivos estáticos de produção
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0'
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Servir index.html com Vite transform para qualquer rota SPA
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api/')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite.ssrFixStacktrace) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portNumber = Number(PORT);
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`\n🚀 Servidor rodando em http://0.0.0.0:${portNumber}`);
    if (process.env.CODESPACE_NAME) {
      const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
      const codespaceUrl = `https://${process.env.CODESPACE_NAME}-${portNumber}.${domain}`;
      console.log(`📱 Link do Codespaces: ${codespaceUrl}`);
      console.log(`⚠️  ATENÇÃO: Na aba "PORTS" do Codespaces, mude a visibilidade da porta ${portNumber} de "Private" para "Public" para abrir no celular!\n`);
    }
  });
}

startServer();
