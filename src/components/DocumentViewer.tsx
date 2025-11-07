import React from "react";
import { X, Download, FileText } from "lucide-react";

interface DocumentViewerProps {
  document: {
    id: string;
    documentUrl: string;
    fileName: string;
    caption?: string;
  };
  onClose: () => void;
}

const DocumentViewer = ({ document, onClose }: DocumentViewerProps) => {
  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.documentUrl;
    link.download = document.fileName || 'document';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full bg-white rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {document.fileName}
            </h3>
            {document.caption && (
              <p className="text-sm text-gray-500 mt-1">{document.caption}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 max-h-[70vh] overflow-auto">
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileText className="w-24 h-24 text-blue-500" />
            <p className="text-gray-600 text-center">
              Visualização de documento não disponível.
              <br />
              Clique no botão de download para baixar o arquivo.
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Baixar Documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;