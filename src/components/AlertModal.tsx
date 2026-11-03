import React from 'react';
import { AlertState } from '../types/aluno';
import { AlertCircle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

interface AlertModalProps {
  alerta: AlertState;
  onFechar: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ alerta, onFechar }) => {
  if (!alerta.visivel) return null;

  const renderIcon = () => {
    switch (alerta.tipo) {
      case 'sucesso':
        return <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />;
      case 'erro':
        return <XCircle className="w-8 h-8 text-rose-500 mb-2" />;
      case 'confirmacao':
        return <HelpCircle className="w-8 h-8 text-blue-500 mb-2" />;
      default:
        return <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center transform scale-100 transition-all"
        role="alertdialog"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="pt-6 px-5 pb-5 flex flex-col items-center">
          {renderIcon()}
          <h3 id="alert-dialog-title" className="text-base font-bold text-slate-900 tracking-tight">
            {alerta.titulo}
          </h3>
          <p id="alert-dialog-description" className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {alerta.mensagem}
          </p>
        </div>

        {/* Botões no estilo nativo iOS/Android */}
        <div className={`grid ${alerta.botoes.length > 1 ? 'grid-cols-2 divide-x divide-slate-200' : 'grid-cols-1'} border-t border-slate-200 bg-slate-50/50`}>
          {alerta.botoes.map((botao, idx) => {
            const isDestructive = botao.estilo === 'destructive';
            const isCancel = botao.estilo === 'cancel';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onFechar();
                  if (botao.onPress) botao.onPress();
                }}
                className={`py-3 px-4 text-xs font-semibold transition-colors active:bg-slate-200/60 focus:outline-none ${
                  isDestructive
                    ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                    : isCancel
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                {botao.texto}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
