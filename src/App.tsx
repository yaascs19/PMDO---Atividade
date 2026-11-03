/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Aluno, ModoOperacao, HttpLog, AlertState } from './types/aluno';
import { AlertModal } from './components/AlertModal';
import { ActivityIndicator } from './components/ActivityIndicator';
import { HttpConsoleModal } from './components/HttpConsoleModal';
import { QrCodeModal } from './components/QrCodeModal';
import {
  UserPlus,
  Edit2,
  Trash2,
  Check,
  X,
  Terminal,
  Smartphone,
  Maximize2,
  RotateCcw,
  GraduationCap,
  Sparkles,
  Wifi,
  Battery,
  Layers,
  Globe,
  QrCode
} from 'lucide-react';

// Dados iniciais para o CRUD Local (Fase 1 do PDF)
const DADOS_INICIAIS: Aluno[] = [
  { id: 1, nome: 'João da Silva', curso: 'Informática' },
  { id: 2, nome: 'Maria Oliveira', curso: 'Administração' },
  { id: 3, nome: 'Pedro Santos', curso: 'Desenvolvimento de Sistemas' },
];

export default function App() {
  // -------------------------------------------------------------
  // 1. ESTADOS DO APLICATIVO (useState exigido no item 2 do PDF)
  // -------------------------------------------------------------
  const [nome, setNome] = useState<string>('');
  const [curso, setCurso] = useState<string>('');
  const [alunos, setAlunos] = useState<Aluno[]>(DADOS_INICIAIS);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagemCarregamento, setMensagemCarregamento] = useState<string>('Carregando alunos...');
  
  // Controle de Modo: Fase 1 (CRUD Local) vs Fase 2 (CRUD com API HTTP)
  const [modo, setModo] = useState<ModoOperacao>('local');
  
  // Visualização: Moldura de Celular (Mobile Preview) vs Tela Expandida
  const [visualizacaoMobile, setVisualizacaoMobile] = useState<boolean>(true);

  // Estados dos modais auxiliares
  const [consoleAberto, setConsoleAberto] = useState<boolean>(false);
  const [qrModalAberto, setQrModalAberto] = useState<boolean>(false);
  const [httpLogs, setHttpLogs] = useState<HttpLog[]>([]);

  // Estado do Alert (conforme item 2 e 10 do PDF)
  const [alerta, setAlerta] = useState<AlertState>({
    visivel: false,
    titulo: '',
    mensagem: '',
    tipo: 'info',
    botoes: [{ texto: 'OK' }]
  });

  // Referência para o campo de nome para foco automático ao editar
  const inputNomeRef = useRef<HTMLInputElement>(null);

  // Função auxiliar para exibir alertas nativos mobile
  const exibirAlerta = (
    titulo: string,
    mensagem: string,
    tipo: 'info' | 'sucesso' | 'erro' | 'confirmacao' = 'info',
    botoes?: AlertState['botoes']
  ) => {
    setAlerta({
      visivel: true,
      titulo,
      mensagem,
      tipo,
      botoes: botoes || [{ texto: 'OK' }]
    });
  };

  const fecharAlerta = () => {
    setAlerta((prev) => ({ ...prev, visivel: false }));
  };

  // Helper para adicionar ao histórico HTTP da Fase 2
  const registrarLogHttp = (log: Omit<HttpLog, 'id' | 'timestamp'>) => {
    const novoLog: HttpLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('pt-BR')
    };
    setHttpLogs((prev) => [novoLog, ...prev]);
  };

  // -------------------------------------------------------------
  // 2. CONSULTA INICIAL (useEffect exigido no item 2 do PDF)
  // -------------------------------------------------------------
  useEffect(() => {
    if (modo === 'api') {
      listarAlunosApi();
    } else {
      // No modo local, garantimos a lista inicial da memória
      // (conforme Etapa 2 do PDF: Comece com alguns registros de teste)
    }
  }, [modo]);

  // -------------------------------------------------------------
  // 3. READ: CONSULTAR E EXIBIR A LISTA DE ALUNOS
  // -------------------------------------------------------------
  // Consulta via API HTTP (GET)
  const listarAlunosApi = async () => {
    setCarregando(true);
    setMensagemCarregamento('Consultando alunos na API (GET)...');
    const inicio = Date.now();

    try {
      // fetch + GET conforme item 2 e 12 do PDF
      const response = await fetch('/api/alunos', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      // response.ok conforme item 2 e 12 do PDF
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: Falha ao buscar lista`);
      }

      // response.json() conforme item 2 do PDF
      const dados: Aluno[] = await response.json();
      setAlunos(dados);

      registrarLogHttp({
        metodo: 'GET',
        endpoint: '/api/alunos',
        status: response.status,
        duracaoMs: Date.now() - inicio,
        resposta: dados
      });
    } catch (error: any) {
      registrarLogHttp({
        metodo: 'GET',
        endpoint: '/api/alunos',
        duracaoMs: Date.now() - inicio,
        erro: error.message || 'Falha de conexão com a API'
      });
      exibirAlerta(
        'Erro na Consulta (GET)',
        'Não foi possível consultar os alunos na API: ' + (error.message || 'Verifique o servidor.'),
        'erro'
      );
    } finally {
      // try/catch/finally conforme item 2 do PDF
      setCarregando(false);
    }
  };

  // -------------------------------------------------------------
  // 4. CREATE: CADASTRAR UM NOVO ALUNO
  // -------------------------------------------------------------
  const cadastrarAluno = async () => {
    // Validação de campos vazios (Item 7 e 10 do PDF)
    if (!nome.trim() || !curso.trim()) {
      exibirAlerta(
        'Campos Obrigatórios',
        'Por favor, preencha o nome e o curso do aluno antes de cadastrar.',
        'info'
      );
      return;
    }

    if (modo === 'local') {
      // CREATE Local (Etapa 3 do PDF)
      // O novo aluno deverá receber um id e ser acrescentado à lista existente
      const novoId = alunos.length > 0 ? Math.max(...alunos.map((a) => a.id)) + 1 : 1;
      const novoAluno: Aluno = {
        id: novoId,
        nome: nome.trim(),
        curso: curso.trim()
      };

      // Atualização de lista via useState
      setAlunos([...alunos, novoAluno]);

      // Limpar campos após cadastro
      setNome('');
      setCurso('');

      exibirAlerta(
        'Sucesso (Local)',
        `Aluno "${novoAluno.nome}" cadastrado com sucesso na lista local!`,
        'sucesso'
      );
    } else {
      // CREATE via API HTTP (POST) - Fase 2 do PDF
      setCarregando(true);
      setMensagemCarregamento('Enviando dados para a API (POST)...');
      const inicio = Date.now();
      const payload = { nome: nome.trim(), curso: curso.trim() };

      try {
        // fetch + POST + JSON.stringify() conforme item 2 e 12 do PDF
        const response = await fetch('/api/alunos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const dadosRetornados = await response.json();

        // response.ok
        if (!response.ok) {
          throw new Error(dadosRetornados.error || `Erro HTTP ${response.status}`);
        }

        registrarLogHttp({
          metodo: 'POST',
          endpoint: '/api/alunos',
          status: response.status,
          duracaoMs: Date.now() - inicio,
          payload,
          resposta: dadosRetornados
        });

        // Atualizar lista após cadastro via API
        await listarAlunosApi();

        // Limpar campos
        setNome('');
        setCurso('');

        exibirAlerta(
          'Sucesso (API)',
          `Aluno cadastrado com sucesso via POST! (ID: ${dadosRetornados.id})`,
          'sucesso'
        );
      } catch (error: any) {
        registrarLogHttp({
          metodo: 'POST',
          endpoint: '/api/alunos',
          duracaoMs: Date.now() - inicio,
          payload,
          erro: error.message
        });

        exibirAlerta(
          'Erro ao Cadastrar (POST)',
          'Ocorreu um erro ao salvar na API: ' + (error.message || 'Erro de rede'),
          'erro'
        );
      } finally {
        setCarregando(false);
      }
    }
  };

  // -------------------------------------------------------------
  // 5. UPDATE: SELECIONAR E EDITAR DADOS DO ALUNO
  // -------------------------------------------------------------
  // Etapa 5 do PDF: carregar nome e curso nos TextInput e guardar id selecionado
  const iniciarEdicao = (aluno: Aluno) => {
    setAlunoEmEdicao(aluno);
    setNome(aluno.nome);
    setCurso(aluno.curso);

    // Focar no campo de texto para facilitar a digitação
    setTimeout(() => {
      inputNomeRef.current?.focus();
    }, 50);
  };

  const cancelarEdicao = () => {
    setAlunoEmEdicao(null);
    setNome('');
    setCurso('');
  };

  const salvarAlteracao = async () => {
    if (!alunoEmEdicao) return;

    // Validação de campos vazios (Item 10 do PDF)
    if (!nome.trim() || !curso.trim()) {
      exibirAlerta(
        'Campos Obrigatórios',
        'O nome e o curso não podem ficar em branco.',
        'info'
      );
      return;
    }

    if (modo === 'local') {
      // UPDATE Local (Etapa 5 do PDF: localize o aluno pelo id, altere seus dados na lista com map)
      const listaAtualizada = alunos.map((item) =>
        item.id === alunoEmEdicao.id
          ? { ...item, nome: nome.trim(), curso: curso.trim() }
          : item
      );

      setAlunos(listaAtualizada);
      cancelarEdicao();

      exibirAlerta(
        'Sucesso (Local)',
        'Dados do aluno atualizados com sucesso!',
        'sucesso'
      );
    } else {
      // UPDATE via API HTTP (PUT) - Fase 2 do PDF
      setCarregando(true);
      setMensagemCarregamento('Atualizando aluno na API (PUT)...');
      const inicio = Date.now();
      const payload = { nome: nome.trim(), curso: curso.trim() };

      try {
        const response = await fetch(`/api/alunos/${alunoEmEdicao.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const dadosRetornados = await response.json();

        if (!response.ok) {
          throw new Error(dadosRetornados.error || `Erro HTTP ${response.status}`);
        }

        registrarLogHttp({
          metodo: 'PUT',
          endpoint: `/api/alunos/${alunoEmEdicao.id}`,
          status: response.status,
          duracaoMs: Date.now() - inicio,
          payload,
          resposta: dadosRetornados
        });

        // Atualizar lista
        await listarAlunosApi();
        cancelarEdicao();

        exibirAlerta(
          'Sucesso (API)',
          'Dados do aluno atualizados com sucesso via PUT!',
          'sucesso'
        );
      } catch (error: any) {
        registrarLogHttp({
          metodo: 'PUT',
          endpoint: `/api/alunos/${alunoEmEdicao.id}`,
          duracaoMs: Date.now() - inicio,
          payload,
          erro: error.message
        });

        exibirAlerta(
          'Erro ao Atualizar (PUT)',
          'Falha ao atualizar aluno na API: ' + (error.message || 'Erro de rede'),
          'erro'
        );
      } finally {
        setCarregando(false);
      }
    }
  };

  // -------------------------------------------------------------
  // 6. DELETE: EXCLUIR UM ALUNO
  // -------------------------------------------------------------
  // Etapa 4 do PDF: botão Excluir com id do aluno e confirmação via Alert
  const solicitarExclusao = (aluno: Aluno) => {
    exibirAlerta(
      'Confirmar Exclusão',
      `Deseja realmente remover o aluno "${aluno.nome}" (ID: ${aluno.id})?`,
      'confirmacao',
      [
        { texto: 'Cancelar', estilo: 'cancel' },
        {
          texto: 'Excluir',
          estilo: 'destructive',
          onPress: () => executarExclusao(aluno.id)
        }
      ]
    );
  };

  const executarExclusao = async (id: number) => {
    // Se estiver editando este mesmo aluno, cancela a edição
    if (alunoEmEdicao?.id === id) {
      cancelarEdicao();
    }

    if (modo === 'local') {
      // DELETE Local (Etapa 4 do PDF: filter() para remover registro)
      const novaLista = alunos.filter((item) => item.id !== id);
      setAlunos(novaLista);

      exibirAlerta(
        'Excluído (Local)',
        'O aluno foi removido da lista local.',
        'sucesso'
      );
    } else {
      // DELETE via API HTTP (DELETE) - Fase 2 do PDF
      setCarregando(true);
      setMensagemCarregamento('Excluindo aluno na API (DELETE)...');
      const inicio = Date.now();

      try {
        const response = await fetch(`/api/alunos/${id}`, {
          method: 'DELETE'
        });

        const dadosRetornados = await response.json();

        if (!response.ok) {
          throw new Error(dadosRetornados.error || `Erro HTTP ${response.status}`);
        }

        registrarLogHttp({
          metodo: 'DELETE',
          endpoint: `/api/alunos/${id}`,
          status: response.status,
          duracaoMs: Date.now() - inicio,
          resposta: dadosRetornados
        });

        await listarAlunosApi();

        exibirAlerta(
          'Excluído (API)',
          'O aluno foi excluído no servidor via DELETE com sucesso.',
          'sucesso'
        );
      } catch (error: any) {
        registrarLogHttp({
          metodo: 'DELETE',
          endpoint: `/api/alunos/${id}`,
          duracaoMs: Date.now() - inicio,
          erro: error.message
        });

        exibirAlerta(
          'Erro ao Excluir (DELETE)',
          'Não foi possível excluir o aluno da API: ' + (error.message || 'Erro de rede'),
          'erro'
        );
      } finally {
        setCarregando(false);
      }
    }
  };

  // Resetar dados para os iniciais
  const resetarDados = async () => {
    if (modo === 'local') {
      setAlunos(DADOS_INICIAIS);
      cancelarEdicao();
      exibirAlerta('Reiniciado', 'Lista local restaurada com os alunos de exemplo.', 'info');
    } else {
      setCarregando(true);
      try {
        await fetch('/api/alunos/reset', { method: 'POST' });
        await listarAlunosApi();
        cancelarEdicao();
        exibirAlerta('Reiniciado', 'API restaurada com a lista padrão de alunos.', 'sucesso');
      } catch (e) {
        exibirAlerta('Erro', 'Falha ao restaurar lista na API', 'erro');
      } finally {
        setCarregando(false);
      }
    }
  };

  // Sugestões rápidas de curso para facilitar o preenchimento no mobile
  const cursosRapidos = ['Informática', 'Administração', 'Desenvolvimento de Sistemas', 'Enfermagem'];

  // Renderização da interface do aplicativo (Etapa 1 a 6 do PDF)
  const renderAppContent = () => (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 select-none">
      {/* Top Bar / Header Mobile (Etapa 1: Título: Cadastro de Alunos) */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shrink-0 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                Cadastro de Alunos
              </h1>
              <span className="text-[10px] text-slate-500 font-medium">
                {modo === 'local' ? 'Fase 1 · CRUD Local (useState)' : 'Fase 2 · CRUD via API (HTTP)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setQrModalAberto(true)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Abrir no Celular (QR Code)"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetarDados}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Restaurar dados iniciais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Alternador de Modo (Fase 1 vs Fase 2) */}
        <div className="mt-2.5 p-0.5 bg-slate-100 rounded-xl grid grid-cols-2 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => {
              if (alunoEmEdicao) cancelarEdicao();
              setModo('local');
            }}
            className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              modo === 'local'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            Fase 1: CRUD Local
          </button>
          <button
            type="button"
            onClick={() => {
              if (alunoEmEdicao) cancelarEdicao();
              setModo('api');
            }}
            className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              modo === 'api'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3 h-3" />
            Fase 2: API HTTP
          </button>
        </div>
      </header>

      {/* Corpo rolável do app */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Formulário (Etapa 1 e 5 do PDF: Nome, Curso, Botão Cadastrar/Salvar) */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              {alunoEmEdicao ? 'Alterar Aluno (UPDATE)' : 'Novo Aluno (CREATE)'}
            </span>
            {alunoEmEdicao && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Editando ID #{alunoEmEdicao.id}
              </span>
            )}
          </div>

          {/* TextInput: Nome */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nome do Aluno
            </label>
            <input
              ref={inputNomeRef}
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* TextInput: Curso */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Curso
            </label>
            <input
              type="text"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              placeholder="Ex: Informática"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {/* Sugestões rápidas para agilizar testes no mobile */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {cursosRapidos.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurso(c)}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Botões de Ação do Formulário */}
          <div className="pt-1 flex gap-2">
            {alunoEmEdicao ? (
              <>
                <button
                  type="button"
                  onClick={salvarAlteracao}
                  disabled={carregando}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar Alteração
                </button>
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  disabled={carregando}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={cadastrarAluno}
                disabled={carregando}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Cadastrar Aluno
              </button>
            )}
          </div>
        </section>

        {/* Indicador de Carregamento (ActivityIndicator do PDF) */}
        {carregando && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <ActivityIndicator size="small" mensagem={mensagemCarregamento} />
          </div>
        )}

        {/* Lista de Alunos (Estilo FlatList exigido no item 2, 5 e 6 do PDF) */}
        <section className="space-y-2 pb-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              Alunos Cadastrados
              <span className="text-[10px] font-semibold text-slate-500 font-mono">
                ({alunos.length})
              </span>
            </h2>
            {modo === 'api' && (
              <button
                onClick={listarAlunosApi}
                disabled={carregando}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Atualizar (GET)
              </button>
            )}
          </div>

          {alunos.length === 0 && !carregando ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Nenhum aluno cadastrado</p>
              <p className="text-[11px] text-slate-500">
                Preencha o formulário acima para adicionar o primeiro aluno à lista.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {alunos.map((item) => {
                const emEdicao = alunoEmEdicao?.id === item.id;
                return (
                  <div
                    key={item.id.toString()}
                    className={`bg-white rounded-2xl p-3.5 border transition-all ${
                      emEdicao
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Dados do aluno: nome, curso e id */}
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          #{item.id}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {item.nome}
                          </h3>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Curso: <span className="text-slate-700 font-medium">{item.curso}</span>
                          </p>
                        </div>
                      </div>

                      {/* Botões Editar e Excluir (item 1 e 5 do PDF) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(item)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                          title="Editar este aluno"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => solicitarExclusao(item)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                          title="Excluir este aluno"
                        >
                          <Trash2 className="w-3 h-3" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Barra de Status Inferior / Ações de Apoio */}
      <footer className="border-t border-slate-200 bg-white/95 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{modo === 'local' ? 'Modo: Memória Local' : 'Modo: Servidor Express / API'}</span>
        </div>

        {modo === 'api' && (
          <button
            type="button"
            onClick={() => setConsoleAberto(true)}
            className="font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 text-[11px] py-1 px-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            Ver Logs HTTP ({httpLogs.length})
          </button>
        )}
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 font-sans">
      {/* Barra de Controle Externa (Ambiente de Desenvolvimento / Demonstração) */}
      <div className="w-full max-w-4xl mb-3 flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">PDMO - Trabalho Prático</span>
            <span className="text-slate-400 ml-2 hidden sm:inline">· CRUD de Alunos (React Native)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternar visualização Mobile / Full */}
          <button
            onClick={() => setVisualizacaoMobile(!visualizacaoMobile)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors flex items-center gap-1.5 font-medium"
            title="Alternar entre moldura de smartphone e visão expandida"
          >
            {visualizacaoMobile ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Visão Expandida</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Moldura Mobile</span>
              </>
            )}
          </button>

          {/* Botão Abrir no Celular (QR) */}
          <button
            onClick={() => setQrModalAberto(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 font-medium"
            title="Exibir QR Code para abrir no celular"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Abrir no Celular</span>
          </button>

          {/* Botão Console HTTP */}
          <button
            onClick={() => setConsoleAberto(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Logs API
          </button>
        </div>
      </div>

      {/* Renderização do App: Moldura Mobile ou Layout Expandido */}
      {visualizacaoMobile ? (
        // Moldura de Smartphone Elegante
        <div className="relative w-full max-w-[400px] h-[780px] max-h-[90vh] bg-black rounded-[42px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800 flex flex-col overflow-hidden">
          {/* Barra de Status do Smartphone */}
          <div className="w-full bg-slate-900 text-slate-300 px-6 pt-2 pb-1 flex items-center justify-between text-[11px] font-mono shrink-0 select-none rounded-t-[32px]">
            <span>09:41</span>
            {/* Ilha / Câmera Frontal */}
            <div className="w-20 h-4 bg-black rounded-full" />
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Tela do Aplicativo dentro do celular */}
          <div className="flex-1 w-full bg-slate-50 overflow-hidden rounded-b-[32px] flex flex-col">
            {renderAppContent()}
          </div>

          {/* Barra Home Indicator do celular */}
          <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto my-1.5 shrink-0" />
        </div>
      ) : (
        // Layout Expandido Responsivo
        <div className="w-full max-w-2xl h-[780px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
          {renderAppContent()}
        </div>
      )}

      {/* Modal de Alerta Nativo Mobile (Alert.alert do React Native) */}
      <AlertModal alerta={alerta} onFechar={fecharAlerta} />

      {/* Modal de QR Code para abrir no celular */}
      <QrCodeModal aberto={qrModalAberto} onFechar={() => setQrModalAberto(false)} />

      {/* Modal do Inspetor HTTP para depurar as chamadas da Fase 2 */}
      <HttpConsoleModal
        aberto={consoleAberto}
        onFechar={() => setConsoleAberto(false)}
        logs={httpLogs}
        onLimpar={() => setHttpLogs([])}
      />
    </div>
  );
}
