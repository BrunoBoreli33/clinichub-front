// src/api/tags.ts
// ✅ Crie este arquivo SOMENTE se quiser separar as funções da API

import { buildUrl } from "@/lib/api";

export interface Tag {
  id: string;
  name: string;
  color: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface TagRequest {
  name: string;
  color: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * Buscar todas as tags do usuário
 */
export const getAllTags = async (): Promise<Tag[]> => {
  const response = await fetch(buildUrl('/dashboard/tags'), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao buscar etiquetas");
  }

  return data.tags;
};

/**
 * Criar nova tag
 */
export const createTag = async (tagData: TagRequest): Promise<Tag> => {
  const response = await fetch(buildUrl('/dashboard/tags'), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(tagData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao criar etiqueta");
  }

  return data.tag;
};

/**
 * Atualizar tag existente
 */
export const updateTag = async (tagId: string, tagData: TagRequest): Promise<Tag> => {
  const response = await fetch(buildUrl(`/dashboard/tags/${tagId}`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(tagData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao atualizar etiqueta");
  }

  return data.tag;
};

/**
 * Deletar tag
 */
export const deleteTag = async (tagId: string): Promise<void> => {
  const response = await fetch(buildUrl(`/dashboard/tags/${tagId}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao deletar etiqueta");
  }
};

/**
 * Adicionar tags a um chat
 */
export const addTagsToChat = async (chatId: string, tagIds: string[]): Promise<void> => {
  const response = await fetch(buildUrl(`/dashboard/zapi/chats/${chatId}/tags`), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tagIds }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao adicionar tags ao chat");
  }
};

/**
 * Remover tag de um chat
 */
export const removeTagFromChat = async (chatId: string, tagId: string): Promise<void> => {
  const response = await fetch(buildUrl(`/dashboard/zapi/chats/${chatId}/tags/${tagId}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao remover tag do chat");
  }
};

/**
 * Substituir todas as tags de um chat
 */
export const setTagsForChat = async (chatId: string, tagIds: string[]): Promise<void> => {
  const response = await fetch(buildUrl(`/dashboard/zapi/chats/${chatId}/tags`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tagIds }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao atualizar tags do chat");
  }
};