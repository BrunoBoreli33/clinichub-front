import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [showPicker, setShowPicker] = useState(false);

  // ✅ CORRIGIDO: Removidos emojis com combinadores Unicode problemáticos
  const emojiCategories = {
    "Smileys & People": [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
      "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
      "😘", "😗", "😚", "😙", "😋", "😛", "😜",
      "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
      "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
      "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒",
      "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵",
      "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕",
      "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺",
      "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱",
      "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤",
      "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩"
    ],
    "Gestos": [
      "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️",
      "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆",
      "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙",
      "💪", "🦾", "🖕", "✍️", "🙏", "🦶", "🦵", "👂",
      "🦻", "👃", "🧠", "🦷", "🦴", "👀"
    ],
    "Corações": [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "🤎", "💔", "💕", "💞", "💓", "💗", "💖", "💘",
      "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "✡️", "🔯",
      "🕎", "☸️", "☯️", "🛐", "⛎", "♈", "♉", "♊"
    ],
    "Natureza": [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
      "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
      "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺",
      "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞"
    ],
    "Comida": [
      "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈",
      "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆",
      "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕",
      "🥔", "🍠", "🥐", "🥖", "🍞", "🥨", "🥯", "🧀"
    ],
    "Objetos": [
      "⌚", "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️",
      "🕹️", "📷", "📹", "📼", "🔍", "🔎", "💡", "🔦",
      "🕯️", "📔", "📕", "📖", "📗", "📘", "📙", "📚",
      "📓", "📒", "📃", "📜", "📄", "📰", "🗞️", "📑"
    ]
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full"
      >
        <Smile className="h-5 w-5 text-gray-600" />
      </Button>

      {showPicker && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />

          {/* Picker de Emojis */}
          <div className="absolute bottom-12 left-0 z-50 w-80 bg-[#2a2f32] rounded-lg shadow-2xl p-3">
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-4">
                  <h3 className="text-xs text-gray-400 mb-2 font-medium">
                    {category}
                  </h3>
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          onEmojiSelect(emoji);
                          setShowPicker(false);
                        }}
                        className="text-2xl hover:bg-gray-700 rounded p-1 transition-colors"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPicker;