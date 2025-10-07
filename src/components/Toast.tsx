import { useEffect } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  description?: string;
  variant?: "default" | "destructive";
  onClose: () => void;
}

const Toast = ({ message, description, variant = "default", onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = variant === "destructive" ? "bg-red-500" : "bg-green-500";

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg max-w-md z-50 animate-in slide-in-from-bottom-5`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{message}</h4>
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;