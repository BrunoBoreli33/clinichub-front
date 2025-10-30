import { X, Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface VideoViewerProps {
  video: {
    id: string;
    videoUrl: string;
    width: number;
    height: number;
    seconds: number;
    savedInGallery: boolean;
  };
  onClose: () => void;
  onToggleGallery: (videoId: string) => void;
}

const VideoViewer = ({ video, onClose, onToggleGallery }: VideoViewerProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `video-${video.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
        {/* Botões de ação */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onToggleGallery(video.id)}>
                {video.savedInGallery ? "Remover da Galeria" : "Salvar na Galeria"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Vídeo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Vídeo */}
        <video
          src={video.videoUrl}
          controls
          autoPlay
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    </div>
  );
};

export default VideoViewer;