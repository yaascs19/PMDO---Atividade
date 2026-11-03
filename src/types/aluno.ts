export interface Aluno {
  id: number;
  nome: string;
  curso: string;
}

export type ModoOperacao = 'local' | 'api';

export interface HttpLog {
  id: string;
  timestamp: string;
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status?: number;
  duracaoMs?: number;
  payload?: any;
  resposta?: any;
  erro?: string;
}

export interface AlertState {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  tipo?: 'info' | 'sucesso' | 'erro' | 'confirmacao';
  botoes: Array<{
    texto: string;
    estilo?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }>;
}
