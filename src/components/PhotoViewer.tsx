import { X, Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PhotoViewerProps {
  photo: {
    id: string;
    imageUrl: string;
    width: number;
    height: number;
    savedInGallery: boolean;
  };
  onClose: () => void;
  onToggleGallery: (photoId: string) => void;
}

const PhotoViewer = ({ photo, onClose, onToggleGallery }: PhotoViewerProps) => {
  const handleDownload = () => {
    // ✅ CORREÇÃO: Abrir link em nova aba
    window.open(photo.imageUrl, '_blank');
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
              <DropdownMenuItem onClick={() => onToggleGallery(photo.id)}>
                {photo.savedInGallery ? "Remover da Galeria" : "Salvar na Galeria"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Foto
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

        {/* Imagem */}
        <img
          src={photo.imageUrl}
          alt="Foto"
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default PhotoViewer;