import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle2, Send, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildUrl } from "@/lib/api";
import PhotoViewer from "./PhotoViewer";
import VideoViewer from "./VideoViewer";
import UploadModal from "./UploadModal";

interface Photo {
  id: string;
  messageId: string;
  imageUrl: string;
  width: number;
  height: number;
  timestamp: string;
  chatName: string;
  senderName: string;
  savedInGallery: boolean;
}

interface Video {
  id: string;
  messageId: string;
  videoUrl: string;
  width: number;
  height: number;
  seconds: number;
  timestamp: string;
  chatName: string;
  senderName: string;
  savedInGallery: boolean;
}

type PhotoWithType = Photo & { type: 'photo' };
type VideoWithType = Video & { type: 'video' };
type MediaItem = PhotoWithType | VideoWithType;

interface GalleryModalProps {
  onClose: () => void;
  selectionMode?: boolean;
  filterType?: 'photos' | 'videos';
  onMediaSelected?: (items: Array<{id: string; imageUrl?: string; videoUrl?: string}>, type: 'photo' | 'video') => void;
}

const GalleryModal = ({ onClose, selectionMode = false, filterType, onMediaSelected }: GalleryModalProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [filter, setFilter] = useState<'all' | 'photos' | 'videos'>(filterType || 'all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Ref para controlar o polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (filterType) {
      setFilter(filterType);
    }
  }, [filterType]);

  useEffect(() => {
    loadGalleryItems();
  }, []);

  // ✅ CORREÇÃO 1: Auto-reload da galeria quando UploadModal está aberto
  useEffect(() => {
    if (showUploadModal) {
      // Inicia polling a cada 3 segundos
      pollingIntervalRef.current = setInterval(() => {
        loadGalleryItems();
      }, 3000);
    } else {
      // Para o polling quando o modal é fechado
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup ao desmontar
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [showUploadModal]);

  const loadGalleryItems = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(buildUrl("/dashboard/messages/gallery/all"), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setPhotos(data.photos || []);
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar galeria:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePhotoGallery = async (photoId: string) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        buildUrl(`/dashboard/messages/photos/${photoId}/toggle-gallery`),
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        loadGalleryItems();
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error("Erro ao remover foto da galeria:", error);
    }
  };

  const toggleVideoGallery = async (videoId: string) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        buildUrl(`/dashboard/messages/videos/${videoId}/toggle-gallery`),
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        loadGalleryItems();
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error("Erro ao remover vídeo da galeria:", error);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleSendSelected = () => {
    if (selectedItems.size === 0) return;

    const selectedMediaItems: Array<{id: string; imageUrl?: string; videoUrl?: string}> = [];
    let mediaType: 'photo' | 'video' = 'photo';

    if (filter === 'photos') {
      mediaType = 'photo';
      selectedItems.forEach(id => {
        const photo = photos.find(p => p.id === id);
        if (photo) {
          selectedMediaItems.push({
            id: photo.id,
            imageUrl: photo.imageUrl
          });
        }
      });
    } else if (filter === 'videos') {
      mediaType = 'video';
      selectedItems.forEach(id => {
        const video = videos.find(v => v.id === id);
        if (video) {
          selectedMediaItems.push({
            id: video.id,
            videoUrl: video.videoUrl
          });
        }
      });
    }

    if (onMediaSelected && selectedMediaItems.length > 0) {
      onMediaSelected(selectedMediaItems, mediaType);
    }
    onClose();
  };

  const getFilteredItems = () => {
    const items = [];
    
    if (filter === 'all' || filter === 'photos') {
      items.push(...photos.map(p => ({ ...p, type: 'photo' as const })));
    }
    
    if (filter === 'all' || filter === 'videos') {
      items.push(...videos.map(v => ({ ...v, type: 'video' as const })));
    }
    
    return items.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleItemClick = (item: MediaItem) => {
    // ✅ CORREÇÃO 2: Bloquear cliques quando UploadModal está aberto
    if (showUploadModal) return;
    
    if (selectionMode) {
      toggleItemSelection(item.id);
    } else {
      if (item.type === 'photo') {
        setSelectedPhoto(item);
      } else {
        setSelectedVideo(item);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <Card 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-6xl h-[85vh] z-50 flex flex-col overflow-hidden shadow-2xl ${
          showUploadModal ? 'pointer-events-none' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectionMode ? (
              <>
                {filter === 'photos' && '📷 Selecionar Fotos'}
                {filter === 'videos' && '🎥 Selecionar Vídeos'}
                {filter === 'all' && 'Selecionar Mídias'}
              </>
            ) : (
              <>
                {filter === 'all' && 'Galeria'}
                {filter === 'photos' && '📷 Fotos'}
                {filter === 'videos' && '🎥 Vídeos'}
              </>
            )}
          </h2>
          
          {/* Filtros - apenas se não estiver em modo seleção com filterType definido */}
          {!selectionMode && (
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos ({photos.length + videos.length})
              </Button>
              <Button
                variant={filter === 'photos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('photos')}
              >
                Fotos ({photos.length})
              </Button>
              <Button
                variant={filter === 'videos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('videos')}
              >
                Vídeos ({videos.length})
              </Button>
              
              {/* ✅ NOVO: Botão de Upload */}
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white ml-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          )}

          {/* Botão Enviar - apenas em modo seleção */}
          {selectionMode && (
            <Button
              onClick={handleSendSelected}
              disabled={selectedItems.size === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar ({selectedItems.size})
            </Button>
          )}
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : getFilteredItems().length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg
                className="w-24 h-24 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg">
                {filter === 'all' && 'Nenhum item salvo na galeria'}
                {filter === 'photos' && 'Nenhuma foto salva na galeria'}
                {filter === 'videos' && 'Nenhum vídeo salvo na galeria'}
              </p>
              <p className="text-sm mt-2">
                {selectionMode 
                  ? 'Salve itens na galeria para poder enviá-los'
                  : 'Salve itens clicando nos 3 pontinhos dentro das conversas'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {getFilteredItems().map((item) => (
                <div
                  key={item.id}
                  className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100 transition-all ${
                    selectedItems.has(item.id) 
                      ? 'ring-4 ring-green-500 shadow-xl' 
                      : 'hover:shadow-lg'
                  } ${showUploadModal ? 'pointer-events-none' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  {item.type === 'photo' ? (
                    <img
                      src={item.imageUrl}
                      alt="Foto"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <>
                      <video
                        src={item.videoUrl}
                        className="w-full h-full object-cover"
                      />
                      {/* Ícone de play */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                      {/* Duração */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(item.seconds)}
                      </div>
                    </>
                  )}

                  {/* Indicador de seleção */}
                  {selectionMode && (
                    <div className="absolute top-2 left-2">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedItems.has(item.id)
                          ? 'bg-green-500 border-green-500'
                          : 'bg-white/80 border-white'
                      }`}>
                        {selectedItems.has(item.id) && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-medium truncate">
                        {item.chatName}
                      </p>
                      <p className="text-white/80 text-xs">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Photo Viewer - apenas se não estiver em modo seleção */}
      {!selectionMode && selectedPhoto && !showUploadModal && (
        <PhotoViewer
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onToggleGallery={togglePhotoGallery}
        />
      )}

      {/* Video Viewer - apenas se não estiver em modo seleção */}
      {!selectionMode && selectedVideo && !showUploadModal && (
        <VideoViewer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onToggleGallery={toggleVideoGallery}
        />
      )}

      {/* ✅ NOVO: Upload Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => {
            setShowUploadModal(false);
            // Recarrega a galeria uma última vez ao fechar
            loadGalleryItems();
          }} 
        />
      )}
    </>
  );
};

export default GalleryModal;