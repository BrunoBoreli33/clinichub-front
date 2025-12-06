import { useEffect, useRef, useCallback } from 'react';

interface UseAutoReloadOptions {
  inactivityTimeout?: number;
  onReload?: () => void;
  checkChatOpen?: () => boolean;
}

export const useAutoReload = (options: UseAutoReloadOptions = {}) => {
  const {
    inactivityTimeout = 10 * 60 * 1000,
    onReload,
    checkChatOpen
  } = options;

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Executar reload imediatamente
  const performReload = useCallback(() => {
    console.log('🔄 INATIVIDADE DETECTADA - RECARREGANDO IMEDIATAMENTE!');
    
    if (onReload) {
      try {
        onReload();
      } catch (e) {
        console.error('Erro no onReload:', e);
      }
    }

    window.location.reload();
  }, [onReload]);

  // Verificar inatividade e recarregar
  const checkAndReload = useCallback(() => {
    if (checkChatOpen && checkChatOpen()) {
      console.log('⛔ Reload cancelado - há chat aberto');
      inactivityTimerRef.current = setTimeout(checkAndReload, inactivityTimeout);
      return;
    }

    performReload();
  }, [checkChatOpen, inactivityTimeout, performReload]);

  // Registrar atividade
  const registerActivity = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = setTimeout(checkAndReload, inactivityTimeout);
  }, [inactivityTimeout, checkAndReload]);

  // Setup listeners
  useEffect(() => {
    window.addEventListener('mousedown', registerActivity);
    registerActivity();

    return () => {
      window.removeEventListener('mousedown', registerActivity);
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [registerActivity]);

  return {
    registerActivity
  };
};