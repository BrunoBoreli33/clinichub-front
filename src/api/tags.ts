// src/api/tags.ts

import { buildUrl } from "@/lib/api";
import apiFetch from "@/lib/http";

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
 * Buscar todas as tags do usuÃ¡rio
 */
export const getAllTags = async (): Promise<Tag[]> => {
  const data = await apiFetch<{ tags: Tag[] }>('/dashboard/tags', { method: 'GET' });
  if (!data || !data.tags) throw new Error('Erro ao buscar etiquetas');
  return data.tags as Tag[];
};

/**
 * Criar nova tag
 */
export const createTag = async (tagData: TagRequest): Promise<Tag> => {
  const data = await apiFetch<{ tag: Tag }>('/dashboard/tags', { method: 'POST', body: JSON.stringify(tagData) });
  return data.tag as Tag;
};

/**
 * Atualizar tag existente
 */
export const updateTag = async (tagId: string, tagData: TagRequest): Promise<Tag> => {
  const data = await apiFetch<{ tag: Tag }>(`/dashboard/tags/${tagId}`, { method: 'PUT', body: JSON.stringify(tagData) });
  return data.tag as Tag;
};

/**
 * Deletar tag
 */
export const deleteTag = async (tagId: string): Promise<void> => {
  await apiFetch(`/dashboard/tags/${tagId}`, { method: 'DELETE' });
};

/**
 * Adicionar tags a um chat
 */
export const addTagsToChat = async (chatId: string, tagIds: string[]): Promise<void> => {
  await apiFetch(`/dashboard/zapi/chats/${chatId}/tags`, { method: 'POST', body: JSON.stringify({ tagIds }) });
};

/**
 * Remover tag de um chat
 */
export const removeTagFromChat = async (chatId: string, tagId: string): Promise<void> => {
  await apiFetch(`/dashboard/zapi/chats/${chatId}/tags/${tagId}`, { method: 'DELETE' });
};

/**
 * Substituir todas as tags de um chat
 */
export const setTagsForChat = async (chatId: string, tagIds: string[]): Promise<void> => {
  await apiFetch(`/dashboard/zapi/chats/${chatId}/tags`, { method: 'PUT', body: JSON.stringify({ tagIds }) });
};