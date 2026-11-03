import React from 'react';

interface ActivityIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  mensagem?: string;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  size = 'small',
  color = 'text-blue-600',
  mensagem
}) => {
  const sizeClasses = size === 'large' ? 'w-8 h-8 border-3' : 'w-5 h-5 border-2';

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      <div
        className={`${sizeClasses} ${color} border-current border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Carregando..."
      />
      {mensagem && (
        <span className="text-xs font-medium text-slate-500 animate-pulse">
          {mensagem}
        </span>
      )}
    </div>
  );
};
