// task.ts - FunÃƒÂ§ÃƒÂµes API para gerenciar tarefas

import { buildUrl, getAuthHeaders } from "@/lib/http";

export interface Task {
  id: string;
  chatId: string;
  chatName: string;
  message: string;
  scheduledDate: string;
  executed: boolean;
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  chatId: string;
  message: string;
  scheduledDate: string; // ISO format: "2025-01-15T10:30:00"
}

/**
 * Criar nova tarefa
 */
export const createTask = async (request: TaskRequest): Promise<Task> => {
  const response = await fetch(buildUrl("/api/tasks"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao criar tarefa");
  }

  const data = await response.json();
  return data.task;
};

/**
 * Buscar tarefa por ID
 */
export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await fetch(buildUrl(`/api/tasks/${taskId}`), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao buscar tarefa");
  }

  const data = await response.json();
  return data.task;
};

/**
 * Buscar tarefa por chatId
 */
export const getTaskByChatId = async (chatId: string): Promise<Task> => {
  const response = await fetch(buildUrl(`/api/tasks/chat/${chatId}`), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao buscar tarefa");
  }

  const data = await response.json();
  return data.task;
};

/**
 * Listar todas as tarefas de um chat
 */
export const getAllTasksByChat = async (chatId: string): Promise<Task[]> => {
  const response = await fetch(buildUrl(`/api/tasks/chat/${chatId}/all`), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao listar tarefas");
  }

  const data = await response.json();
  return data.tasks;
};

/**
 * Atualizar tarefa
 */
export const updateTask = async (
  taskId: string,
  request: TaskRequest
): Promise<Task> => {
  const response = await fetch(buildUrl(`/api/tasks/${taskId}`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao atualizar tarefa");
  }

  const data = await response.json();
  return data.task;
};

/**
 * Excluir tarefa
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await fetch(buildUrl(`/api/tasks/${taskId}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao excluir tarefa");
  }
};

/**
 * Marcar tarefa como concluÃƒÂ­da
 */
export const completeTask = async (taskId: string): Promise<Task> => {
  const response = await fetch(buildUrl(`/api/tasks/${taskId}/complete`), {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao concluir tarefa");
  }

  const data = await response.json();
  return data.task;
};