// src/lib/tokenRefresh.ts
import { buildUrl } from "./api";

/**
 * Sistema de renovação automática de token baseado em atividade do usuário
 * 
 * Funcionalidades:
 * 1. Detecta requisições ao backend (atividade do usuário)
 * 2. Renova o token automaticamente antes de expirar
 * 3. Mantém a sessão ativa enquanto houver atividade
 * 4. Expira após 4 horas sem atividade
 */

// Interface para o payload decodificado do JWT
interface JWTPayload {
  exp?: number;
  iss?: string;
  sub?: string;
  [key: string]: unknown;
}

class TokenRefreshManager {
  private lastActivityTime: number = Date.now();
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_TIMEOUT = 4 * 60 * 60 * 1000; // 4 horas em ms
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // Verificar a cada 5 minutos
  private readonly REFRESH_THRESHOLD = 30 * 60 * 1000; // Renovar se faltar menos de 30 min
  private isRefreshing: boolean = false;

  /**
   * Inicializa o sistema de refresh automático
   */
  public initialize(): void {
    console.log("🔄 Sistema de renovação de token inicializado");
    
    // Interceptar requisições fetch para detectar atividade
    this.interceptFetch();
    
    // Iniciar verificação periódica
    this.startPeriodicCheck();
    
    // Detectar atividade do usuário (mouse, teclado)
    this.setupActivityListeners();
  }

  /**
   * Intercepta todas as requisições fetch para detectar atividade
   */
  private interceptFetch(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url] = args;
      
      // Detectar requisições ao backend (exceto o próprio refresh)
      if (typeof url === 'string' && url.includes('/dashboard') && !url.includes('/auth/refresh')) {
        this.updateActivity();
      }
      
      return originalFetch(...args);
    };
  }

  /**
   * Configurar listeners para atividade do usuário
   */
  private setupActivityListeners(): void {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity();
      }, { passive: true });
    });
  }

  /**
   * Atualiza o timestamp da última atividade
   */
  private updateActivity(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;
    
    // Só atualiza se passou pelo menos 1 minuto desde a última atualização
    if (timeSinceLastActivity > 60 * 1000) {
      console.log("✅ Atividade detectada - atualizando timestamp");
      this.lastActivityTime = now;
      
      // Tentar renovar token se estiver próximo de expirar
      this.checkAndRefreshToken();
    }
  }

  /**
   * Inicia verificação periódica do token
   */
  private startPeriodicCheck(): void {
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Verifica se deve renovar o token e executa a renovação
   */
  private async checkAndRefreshToken(): Promise<void> {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.warn("⚠️ Token não encontrado");
      return;
    }

    // Verificar inatividade
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    
    if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT) {
      console.warn("⏰ Usuário inativo por mais de 4 horas - sessão expirada");
      this.handleSessionExpired();
      return;
    }

    // Verificar se o token está próximo de expirar
    const shouldRefresh = await this.shouldRefreshToken(token);
    
    if (shouldRefresh && !this.isRefreshing) {
      await this.refreshToken(token);
    }
  }

  /**
   * Verifica se o token deve ser renovado
   */
  private async shouldRefreshToken(token: string): Promise<boolean> {
    try {
      // Decodificar o token JWT para verificar expiração
      const payload = this.decodeToken(token);
      
      if (!payload || !payload.exp) {
        return true;
      }

      const expirationTime = payload.exp * 1000; // Converter para ms
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // Renovar se faltar menos de 30 minutos
      return timeUntilExpiration < this.REFRESH_THRESHOLD;
    } catch (error) {
      console.error("Erro ao verificar expiração do token:", error);
      return true;
    }
  }

  /**
   * Decodifica o token JWT (apenas payload, sem validação de assinatura)
   */
  private decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JWTPayload;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  }

  /**
   * Renova o token no backend
   */
  private async refreshToken(oldToken: string): Promise<void> {
    if (this.isRefreshing) {
      console.log("⏳ Refresh já em andamento, aguardando...");
      return;
    }

    this.isRefreshing = true;
    console.log("🔄 Renovando token...");

    try {
      const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: oldToken }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Atualizar token no localStorage
        localStorage.setItem("token", data.token);
        console.log("✅ Token renovado com sucesso");
      } else {
        console.error("❌ Falha ao renovar token:", data.message);
        
        // Se falhar, considerar sessão expirada
        if (response.status === 401) {
          this.handleSessionExpired();
        }
      }
    } catch (error) {
      console.error("❌ Erro ao renovar token:", error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Lida com sessão expirada
   */
  private handleSessionExpired(): void {
    console.warn("🔒 Sessão expirada - redirecionando para login");
    
    // Limpar dados locais
    localStorage.clear();
    
    // Parar verificação periódica
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    
    // Redirecionar para login
    window.location.href = "/";
  }

  /**
   * Para o sistema de refresh (útil para logout)
   */
  public stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    console.log("⏹️ Sistema de renovação de token parado");
  }
}

// Singleton
const tokenRefreshManager = new TokenRefreshManager();

export default tokenRefreshManager;