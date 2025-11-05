// Centralized API base URL helper
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8081';

export function buildUrl(path: string) {
  // ensure single slash between base and path
  return `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// ✅ NOVO: Função para alternar o estado de oculto do chat
export const toggleChatHidden = async (chatId: string): Promise<{ success: boolean; message: string; isHidden: boolean }> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(buildUrl(`/dashboard/chats/${chatId}/toggle-hidden`), {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao alternar visibilidade do chat');
  }

  return response.json();
};