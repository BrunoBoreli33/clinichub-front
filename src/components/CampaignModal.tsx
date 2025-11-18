import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Play, Pause, Square, Clock, Users, TrendingUp, ChevronLeft, ChevronRight, ImagePlus, Video } from 'lucide-react';
import { apiFetch } from '../lib/http';
import { toast } from '../hooks/use-toast';
import GalleryModal from './GalleryModal';

interface Campaign {
  id: string;
  name: string;
  message: string;
  chatsPerDispatch: number;
  intervalMinutes: number;
  status: 'CRIADA' | 'EM_ANDAMENTO' | 'PAUSADA' | 'CONCLUIDA' | 'CANCELADA';
  totalChats: number;
  dispatchedChats: number;
  progressPercentage: number;
  nextDispatchTime: string | null;
  tagIds: string[] | null;
  allTrustworthy: boolean;
  photoIds?: string[] | null;
  videoIds?: string[] | null;
  criadoEm: string;
  atualizadoEm: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Chat {
  id: string;
  name: string;
  phone: string;
  profileThumbnail: string | null;
  tags: Tag[];
  isTrustworthy: boolean;
}

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  chats: Chat[];
}

type ViewMode = 'list' | 'create' | 'edit' | 'details';

const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, onClose, tags, chats }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  // Estados para mídias
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryFilterType, setGalleryFilterType] = useState<'photos' | 'videos'>('photos');
  const [selectedPhotos, setSelectedPhotos] = useState<Array<{id: string; imageUrl: string}>>([]);
  const [selectedVideos, setSelectedVideos] = useState<Array<{id: string; videoUrl: string}>>([]);


  // Form state
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    chatsPerDispatch: 10,
    intervalMinutes: 60,
    tagIds: [] as string[],
    allTrustworthy: false,
    photoIds: [] as string[],
    videoIds: [] as string[],
  });

  // Filtro de chats para pré-visualização
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadCampaigns();
    }
  }, [isOpen]);

  // Auto-refresh para campanhas em andamento
  useEffect(() => {
    if (!isOpen) return;

    const hasActiveCampaigns = campaigns.some(
      campaign => campaign.status === 'EM_ANDAMENTO'
    );

    if (!hasActiveCampaigns) return;

    // Atualizar a cada 5 segundos quando houver campanhas em andamento
    const intervalId = setInterval(() => {
      loadCampaigns(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isOpen, campaigns]);

  // Auto-refresh para tela de detalhes quando campanha está em andamento
  useEffect(() => {
    if (!isOpen || viewMode !== 'details' || !selectedCampaign) return;

    if (selectedCampaign.status === 'EM_ANDAMENTO') {
      const intervalId = setInterval(async () => {
        try {
          const response = await apiFetch(`/dashboard/campaigns/${selectedCampaign.id}`);
          if (response.success && response.campaign) {
            const updatedCampaign = response.campaign as Campaign;
            setSelectedCampaign(updatedCampaign);
            setCampaigns(prevCampaigns =>
              prevCampaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c)
            );
          }
        } catch (error) {
          console.error('Erro ao atualizar detalhes:', error);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [isOpen, viewMode, selectedCampaign]);

  const loadCampaigns = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await apiFetch('/dashboard/campaigns');
      if (response.success && response.campaigns) {
        setCampaigns(response.campaigns as Campaign[]);
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      // Apenas mostrar toast se não for atualização automática
      if (showLoading) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as campanhas',
          variant: 'destructive',
        });
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  const handleMediaSelected = (items: Array<{id: string; imageUrl?: string; videoUrl?: string}>, type: 'photo' | 'video') => {
    if (type === 'photo') {
      setSelectedPhotos(items as Array<{id: string; imageUrl: string}>);
      setFormData({
        ...formData,
        photoIds: items.map(item => item.id),
      });
    } else if (type === 'video') {
      setSelectedVideos(items as Array<{id: string; videoUrl: string}>);
      setFormData({
        ...formData,
        videoIds: items.map(item => item.id),
      });
    }
    setShowGalleryModal(false);
  };


  const getFilteredChats = () => {
    if (formData.allTrustworthy) {
      return chats.filter(chat => chat.isTrustworthy);
    }

    if (formData.tagIds.length === 0) {
      return [];
    }

    return chats.filter(chat => {
      if (!chat.isTrustworthy) return false;
      return chat.tags.some(tag => formData.tagIds.includes(tag.id));
    });
  };

  const getPreviewChats = () => {
    const trustworthyChats = chats.filter(chat => chat.isTrustworthy);

    if (selectedTagFilter === 'all') {
      return trustworthyChats;
    }

    return trustworthyChats.filter(chat =>
      chat.tags.some(tag => tag.id === selectedTagFilter)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da campanha é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: 'Erro',
        description: 'Mensagem é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.allTrustworthy && formData.tagIds.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos uma etiqueta ou "Todos"',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        photoIds: formData.photoIds.length > 0 ? formData.photoIds : null,
        videoIds: formData.videoIds.length > 0 ? formData.videoIds : null,
      };

      if (viewMode === 'edit' && selectedCampaign) {
        await apiFetch(`/dashboard/campaigns/${selectedCampaign.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast({
          title: 'Sucesso',
          description: 'Campanha atualizada com sucesso',
        });
      } else {
        await apiFetch('/dashboard/campaigns', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({
          title: 'Sucesso',
          description: 'Campanha criada com sucesso',
        });
      }

      await loadCampaigns();
      resetForm();
      setViewMode('list');
    } catch (error: unknown) {
      console.error('Erro ao salvar campanha:', error);
      const errorMessage = error instanceof Error && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : 'Não foi possível salvar a campanha';
      toast({
        title: 'Erro',
        description: errorMessage || 'Não foi possível salvar a campanha',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta campanha?')) return;

    try {
      setLoading(true);
      await apiFetch(`/dashboard/campaigns/${id}`, { method: 'DELETE' });
      toast({
        title: 'Sucesso',
        description: 'Campanha deletada com sucesso',
      });
      await loadCampaigns();
    } catch (error: unknown) {
      console.error('Erro ao deletar campanha:', error);
      const errorMessage = error instanceof Error && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : 'Não foi possível deletar a campanha';
      toast({
        title: 'Erro',
        description: errorMessage || 'Não foi possível deletar a campanha',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      setLoading(true);
      await apiFetch(`/dashboard/campaigns/${id}/start`, { method: 'POST' });
      toast({
        title: 'Sucesso',
        description: 'Campanha iniciada com sucesso',
      });
      await loadCampaigns();
    } catch (error: unknown) {
      console.error('Erro ao iniciar campanha:', error);
      const errorMessage = error instanceof Error && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : 'Não foi possível iniciar a campanha';
      toast({
        title: 'Erro',
        description: errorMessage || 'Não foi possível iniciar a campanha',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    try {
      setLoading(true);
      await apiFetch(`/dashboard/campaigns/${id}/pause`, { method: 'POST' });
      toast({
        title: 'Sucesso',
        description: 'Campanha pausada com sucesso',
      });
      await loadCampaigns();
    } catch (error: unknown) {
      console.error('Erro ao pausar campanha:', error);
      const errorMessage = error instanceof Error && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : 'Não foi possível pausar a campanha';
      toast({
        title: 'Erro',
        description: errorMessage || 'Não foi possível pausar a campanha',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta campanha?')) return;

    try {
      setLoading(true);
      await apiFetch(`/dashboard/campaigns/${id}/cancel`, { method: 'POST' });
      toast({
        title: 'Sucesso',
        description: 'Campanha cancelada com sucesso',
      });
      await loadCampaigns();
    } catch (error: unknown) {
      console.error('Erro ao cancelar campanha:', error);
      const errorMessage = error instanceof Error && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message 
        : 'Não foi possível cancelar a campanha';
      toast({
        title: 'Erro',
        description: errorMessage || 'Não foi possível cancelar a campanha',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      message: campaign.message,
      chatsPerDispatch: campaign.chatsPerDispatch,
      intervalMinutes: campaign.intervalMinutes,
      tagIds: campaign.tagIds || [],
      allTrustworthy: campaign.allTrustworthy,
      photoIds: campaign.photoIds || [],
      videoIds: campaign.videoIds || [],
    });
    setSelectedPhotos((campaign.photoIds || []).map(id => ({ id, imageUrl: '' })));
    setSelectedVideos((campaign.videoIds || []).map(id => ({ id, videoUrl: '' })));
    setViewMode('edit');
  };

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewMode('details');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      message: '',
      chatsPerDispatch: 10,
      intervalMinutes: 60,
      tagIds: [],
      allTrustworthy: false,
      photoIds: [],
      videoIds: [],
    });
    setSelectedCampaign(null);
    setSelectedPhotos([]);
    setSelectedVideos([]);
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      CRIADA: { label: 'Criada', color: 'bg-gray-500' },
      EM_ANDAMENTO: { label: 'Em andamento', color: 'bg-green-500' },
      PAUSADA: { label: 'Pausada', color: 'bg-yellow-500' },
      CONCLUIDA: { label: 'Concluída', color: 'bg-blue-500' },
      CANCELADA: { label: 'Cancelada', color: 'bg-red-500' },
    };

    const config = statusConfig[status];
    return (
      <span className={`${config.color} text-white text-xs px-2 py-1 rounded`}>
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Disparo de Campanha</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* List View */}
          {viewMode === 'list' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Minhas Campanhas</h3>
                <button
                  onClick={() => {
                    resetForm();
                    setViewMode('create');
                  }}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  <Plus size={20} />
                  Nova Campanha
                </button>
              </div>

              {loading && campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Carregando campanhas...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma campanha criada ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{campaign.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(campaign.status)}
                            <span className="text-sm text-gray-500">
                              {campaign.dispatchedChats}/{campaign.totalChats} disparos
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {campaign.status === 'CRIADA' || campaign.status === 'PAUSADA' ? (
                            <button
                              onClick={() => handleStart(campaign.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Iniciar"
                              disabled={loading}
                            >
                              <Play size={20} />
                            </button>
                          ) : null}
                          {campaign.status === 'EM_ANDAMENTO' ? (
                            <button
                              onClick={() => handlePause(campaign.id)}
                              className="text-yellow-600 hover:text-yellow-700"
                              title="Pausar"
                              disabled={loading}
                            >
                              <Pause size={20} />
                            </button>
                          ) : null}
                          {campaign.status !== 'CONCLUIDA' && campaign.status !== 'CANCELADA' ? (
                            <>
                              <button
                                onClick={() => handleEdit(campaign)}
                                className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                title={campaign.status === 'EM_ANDAMENTO' ? 'Para Editar, Primeiro Pause a Campanha' : 'Editar'}
                                disabled={loading || campaign.status === 'EM_ANDAMENTO'}
                              >
                                <Edit2 size={20} />
                              </button>
                              <button
                                onClick={() => handleCancel(campaign.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Cancelar"
                                disabled={loading}
                              >
                                <Square size={20} />
                              </button>
                            </>
                          ) : null}
                          {campaign.status === 'CRIADA' || campaign.status === 'PAUSADA' || campaign.status === 'CANCELADA' || campaign.status === 'CONCLUIDA' ? (
                            <button
                              onClick={() => handleDelete(campaign.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Deletar"
                              disabled={loading}
                            >
                              <Trash2 size={20} />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span>{campaign.progressPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${campaign.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewDetails(campaign)}
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:gap-2 transition-all duration-200 ease-in-out mt-2 group"
                      >
                        Ver detalhes
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create/Edit View */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode('list');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
                <h3 className="text-lg font-medium">
                  {viewMode === 'create' ? 'Nova Campanha' : 'Editar Campanha'}
                </h3>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome da Campanha *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  maxLength={255}
                  required
                />
              </div>

              {/* Público Alvo */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Público Alvo * (apenas chats confiáveis)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.allTrustworthy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allTrustworthy: e.target.checked,
                          tagIds: e.target.checked ? [] : formData.tagIds,
                        })
                      }
                    />
                    <span>Todos os chats confiáveis</span>
                  </label>

                  {!formData.allTrustworthy && (
                    <div className="border rounded p-3">
                      <p className="text-sm mb-2">Selecione as etiquetas:</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <label
                            key={tag.id}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.tagIds.includes(tag.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    tagIds: [...formData.tagIds, tag.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    tagIds: formData.tagIds.filter((id) => id !== tag.id),
                                  });
                                }
                              }}
                            />
                            <span
                              className="px-2 py-1 rounded text-sm"
                              style={{ backgroundColor: tag.color, color: '#fff' }}
                            >
                              {tag.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview de chats */}
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm font-medium mb-2">
                      Chats elegíveis: {getFilteredChats().length}
                    </p>
                    {getFilteredChats().length > 0 && (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {getFilteredChats().slice(0, 10).map((chat) => (
                          <div key={chat.id} className="flex items-center gap-2 text-sm">
                            <img
                              src={chat.profileThumbnail || '/default-avatar.png'}
                              alt={chat.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span>{chat.name}</span>
                          </div>
                        ))}
                        {getFilteredChats().length > 10 && (
                          <p className="text-xs text-gray-500">
                            + {getFilteredChats().length - 10} outros
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mensagem da Campanha *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={6}
                  maxLength={5000}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/5000 caracteres
                </p>
              </div>

              {/* Seção de Mídias */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-3">
                  Mídias (Opcional)
                </label>
                
                <div className="space-y-3">
                  {/* Fotos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Fotos {selectedPhotos.length > 0 && `(${selectedPhotos.length})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryFilterType('photos');
                          setShowGalleryModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        <ImagePlus size={14} />
                        Adicionar
                      </button>
                    </div>
                    {selectedPhotos.length > 0 && (
                      <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                        {selectedPhotos.length} foto(s) selecionada(s)
                      </div>
                    )}
                  </div>

                  {/* Vídeos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Vídeos {selectedVideos.length > 0 && `(${selectedVideos.length})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryFilterType('videos');
                          setShowGalleryModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                      >
                        <Video size={14} />
                        Adicionar
                      </button>
                    </div>
                    {selectedVideos.length > 0 && (
                      <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                        {selectedVideos.length} vídeo(s) selecionado(s)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Configurações de Disparo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Chats por Disparo *
                  </label>
                  <input
                    type="number"
                    value={formData.chatsPerDispatch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatsPerDispatch: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Intervalo (minutos) *
                  </label>
                  <input
                    type="number"
                    value={formData.intervalMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        intervalMinutes: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode('list');
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : viewMode === 'create' ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </form>
          )}

          {/* Details View */}
          {viewMode === 'details' && selectedCampaign && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedCampaign(null);
                    setViewMode('list');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
                <h3 className="text-lg font-medium">Detalhes da Campanha</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{selectedCampaign.name}</h4>
                  <div className="mt-2">{getStatusBadge(selectedCampaign.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users size={16} />
                      <span className="text-sm">Total de Chats</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedCampaign.totalChats}</p>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <TrendingUp size={16} />
                      <span className="text-sm">Disparados</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedCampaign.dispatchedChats}</p>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock size={16} />
                      <span className="text-sm">Intervalo</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedCampaign.intervalMinutes}min</p>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users size={16} />
                      <span className="text-sm">Por Disparo</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedCampaign.chatsPerDispatch}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso da Campanha</span>
                    <span className="font-medium">
                      {selectedCampaign.progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${selectedCampaign.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-medium mb-1">Mensagem</label>
                  <div className="bg-gray-50 rounded p-3 whitespace-pre-wrap">
                    {selectedCampaign.message}
                  </div>
                </div>

                {/* Mídias Anexadas */}
                {(selectedCampaign.photoIds && selectedCampaign.photoIds.length > 0) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Fotos Anexadas</label>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-600">
                        {selectedCampaign.photoIds.length} foto(s) serão enviadas
                      </p>
                    </div>
                  </div>
                )}

                {(selectedCampaign.videoIds && selectedCampaign.videoIds.length > 0) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Vídeos Anexados</label>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-600">
                        {selectedCampaign.videoIds.length} vídeo(s) serão enviados
                      </p>
                    </div>
                  </div>
                )}

                {/* Próximo Disparo */}
                {selectedCampaign.nextDispatchTime && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Próximo Disparo
                    </label>
                    <p className="text-sm">
                      {new Date(selectedCampaign.nextDispatchTime).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Modal de Galeria */}
      {showGalleryModal && (
        <GalleryModal
          onClose={() => setShowGalleryModal(false)}
          selectionMode={true}
          filterType={galleryFilterType}
          onMediaSelected={handleMediaSelected}
        />
      )}
    </>
  );
};

export default CampaignModal;