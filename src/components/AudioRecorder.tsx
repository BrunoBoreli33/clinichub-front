import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";

interface AudioRecorderProps {
  onAudioRecorded: (audioBase64: string, duration: number) => void;
  disabled?: boolean;
}

const AudioRecorder = ({ onAudioRecorded, disabled }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/mpeg" });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onAudioRecorded(base64Audio, recordingTime);
          
          // Limpar
          stream.getTracks().forEach(track => track.stop());
          setRecordingTime(0);
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {formatTime(recordingTime)}
          </div>
          <Button
            type="button"
            onClick={stopRecording}
            className="h-10 w-10 p-0 bg-red-500 hover:bg-red-600 rounded-full"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="h-10 w-10 p-0 bg-gray-200 hover:bg-gray-300 rounded-full"
        >
          <Mic className="h-5 w-5 text-gray-700" />
        </Button>
      )}
    </div>
  );
};

export default AudioRecorder;