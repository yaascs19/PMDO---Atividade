import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, X, Smartphone, Globe, ExternalLink } from 'lucide-react';

interface QrCodeModalProps {
  aberto: boolean;
  onFechar: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ aberto, onFechar }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [copiado, setCopiado] = useState<boolean>(false);

  useEffect(() => {
    if (aberto) {
      buscarUrlEGerar();
    }
  }, [aberto]);

  const buscarUrlEGerar = async () => {
    try {
      const res = await fetch('/api/app-url');
      const data = await res.json();
      const appUrl = data.url || window.location.href;
      setUrl(appUrl);
      gerarQr(appUrl);
    } catch {
      // fallback para URL atual
      const fallback = window.location.href;
      setUrl(fallback);
      gerarQr(fallback);
    }
  };

  const gerarQr = async (text: string) => {
    try {
      const qrFn = (QRCode as any).toDataURL || (QRCode as any).default?.toDataURL;
      if (qrFn) {
        const dataUrl = await qrFn(text, {
          width: 260,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
        setQrCodeDataUrl(dataUrl);
      }
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
    }
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                Abrir no Celular
              </h3>
              <p className="text-[10px] text-slate-500">
                Aponte a câmera do seu smartphone
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo com o QR Code */}
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code para abrir no celular"
                className="w-56 h-56 rounded-lg object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Gerando QR Code...
              </div>
            )}
          </div>

          {/* Campo com o link para copiar */}
          <div className="w-full space-y-1.5 text-left">
            <label className="text-[10px] font-semibold text-slate-600 block">
              Link de Acesso:
            </label>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full bg-transparent px-2 text-[11px] font-mono text-slate-700 outline-none truncate"
              />
              <button
                type="button"
                onClick={copiarLink}
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0 flex items-center gap-1"
              >
                {copiado ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dica para Codespaces */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[10px] text-amber-900 text-left leading-relaxed">
            <span className="font-bold">⚠️ Dica para o Codespaces:</span> Na aba{' '}
            <strong>PORTS</strong> do Codespaces, mude a visibilidade da porta{' '}
            <strong>3000</strong> de <em>Private</em> para <strong>Public</strong> para que o celular não peça senha de login do GitHub ao carregar.
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end">
          <button
            onClick={onFechar}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
