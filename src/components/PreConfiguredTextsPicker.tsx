import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import { buildUrl } from "@/lib/api";

interface PreConfiguredText {
  id: string;
  title: string;
  content: string;
}

interface PreConfiguredTextsPickerProps {
  onSelectText: (content: string) => void;
}

const PreConfiguredTextsPicker: React.FC<PreConfiguredTextsPickerProps> = ({ onSelectText }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [texts, setTexts] = useState<PreConfiguredText[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showPicker) {
      loadTexts();
    }
  }, [showPicker]);

  const loadTexts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(buildUrl("/dashboard/pre-configured-texts"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTexts(data.texts);
      }
    } catch (error) {
      console.error("Erro ao carregar textos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectText = (content: string) => {
    onSelectText(content);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShowPicker(!showPicker)}
        className="h-10 w-10 rounded-full hover:bg-gray-100"
        title="Textos pré-configurados"
      >
        <FileText className="h-5 w-5 text-gray-600" />
      </Button>

      {showPicker && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />

          {/* Modal de textos */}
          <div className="absolute bottom-12 left-0 z-50 w-80 bg-white rounded-lg shadow-2xl border">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">Textos Prontos</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPicker(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {loading ? (
                <p className="text-center text-sm text-gray-500 py-4">Carregando...</p>
              ) : texts.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">
                  Nenhum texto cadastrado
                </p>
              ) : (
                <div className="space-y-1">
                  {texts.map((text) => (
                    <button
                      key={text.id}
                      onClick={() => handleSelectText(text.content)}
                      className="w-full text-left p-3 hover:bg-gray-100 rounded transition-colors"
                    >
                      <h4 className="font-medium text-sm text-gray-900">{text.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {text.content}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PreConfiguredTextsPicker;