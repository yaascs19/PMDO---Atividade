import React from 'react';
import { HttpLog } from '../types/aluno';
import { Terminal, Trash2, X } from 'lucide-react';

interface HttpConsoleModalProps {
  aberto: boolean;
  onFechar: () => void;
  logs: HttpLog[];
  onLimpar: () => void;
}

export const HttpConsoleModal: React.FC<HttpConsoleModalProps> = ({
  aberto,
  onFechar,
  logs,
  onLimpar
}) => {
  if (!aberto) return null;

  const getMethodColor = (metodo: string) => {
    switch (metodo) {
      case 'GET':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'POST':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'PUT':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'DELETE':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header do Console */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold tracking-tight font-mono">
              HTTP Inspector · Requisições da API
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {logs.length} requisições
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLimpar}
              className="px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              title="Limpar histórico"
            >
              <Trash2 className="w-3 h-3" />
              Limpar
            </button>
            <button
              onClick={onFechar}
              className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de requisições */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 font-mono text-[11px] text-slate-200">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p>Nenhuma requisição HTTP registrada ainda.</p>
              <p className="text-[10px] mt-1 text-slate-600">
                Execute ações no modo API (Listar, Cadastrar, Alterar ou Excluir) para monitorar as chamadas.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodColor(
                        log.metodo
                      )}`}
                    >
                      {log.metodo}
                    </span>
                    <span className="text-slate-100 font-semibold">{log.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    {log.duracaoMs !== undefined && (
                      <span className="text-slate-500">{log.duracaoMs}ms</span>
                    )}
                    {log.status && (
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          log.status >= 200 && log.status < 300
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : 'text-rose-400 bg-rose-950/60'
                        }`}
                      >
                        {log.status}
                      </span>
                    )}
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                {log.payload && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Corpo enviado (JSON.stringify):
                    </span>
                    <pre className="bg-slate-950/80 p-2 rounded border border-slate-800/80 text-emerald-300 overflow-x-auto text-[10px]">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                )}

                {log.resposta && (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Resposta recebida (response.json):
                    </span>
                    <pre className="bg-slate-950/80 p-2 rounded border border-slate-800/80 text-blue-300 overflow-x-auto text-[10px]">
                      {JSON.stringify(log.resposta, null, 2)}
                    </pre>
                  </div>
                )}

                {log.erro && (
                  <div className="text-rose-400 text-[10px] bg-rose-950/40 p-2 rounded border border-rose-900/50">
                    Erro: {log.erro}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
