import { ImagePlus, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaTypeSelectorModalProps {
  onSelectType: (type: 'photo' | 'video' | 'document') => void;
  onClose: () => void;
}

const MediaTypeSelectorModal = ({ onSelectType, onClose }: MediaTypeSelectorModalProps) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={onClose}
      />
      
      {/* Modal estilo WhatsApp */}
      <div 
        className="fixed z-50 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-[240px]"
        style={{ bottom: '140px', right: '510px' }}
      >
        {/* Botão Enviar Imagem */}
        <button
          onClick={() => onSelectType('photo')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
            <ImagePlus className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-800">Enviar Imagem</span>
        </button>

        {/* Botão Enviar Vídeo */}
        <button
          onClick={() => onSelectType('video')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-800">Enviar Vídeo</span>
        </button>

        {/* Botão Enviar Documento */}
        <button
          onClick={() => onSelectType('document')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-800">Enviar Documento</span>
        </button>
      </div>
    </>
  );
};

export default MediaTypeSelectorModal;