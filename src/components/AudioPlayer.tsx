import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  fromMe: boolean;
  messageId: string;
}

const AudioPlayer = ({ audioUrl, duration, fromMe, messageId }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Usamos useRef para armazenar o ID do setInterval
  const intervalRef = useRef<number | null>(null);

  /**
   * Lógica de controle do setInterval (atualização de 1 em 1 segundo)
   */
  const stopUpdatingTime = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startUpdatingTime = () => {
    // Garante que qualquer intervalo anterior seja limpo antes de iniciar um novo
    stopUpdatingTime();

    // A atualização do tempo ocorre a cada 1 segundo (1000ms), 
    // ajustada pelo playbackRate para sincronia
    const intervalId = window.setInterval(() => {
      if (audioRef.current) {
        // Atualiza o currentTime arredondando para baixo (segundos inteiros)
        setCurrentTime(Math.floor(audioRef.current.currentTime));
      }
    }, 1000 / playbackRate);

    // O retorno de window.setInterval em TS é um número
    intervalRef.current = intervalId;
  };


  /**
   * useEffect: Inicialização e limpeza do elemento de áudio
   */
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleAudioEnded = () => {
      setIsPlaying(false);
      stopUpdatingTime(); // Para de atualizar o tempo
      setCurrentTime(0); // Volta o tempo de exibição para 0:00, como solicitado

      // Garante que o player HTMLAudioElement volte para o início
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };

    audio.addEventListener("ended", handleAudioEnded);

    // Cleanup function
    return () => {
      stopUpdatingTime(); // Limpa o setInterval
      audio.pause();
      audio.removeEventListener("ended", handleAudioEnded);
      // A referência ao elemento será limpa pelo Garbage Collector do React/JS
    };
  }, [audioUrl]);


  /**
   * useEffect: Sincroniza playbackRate no áudio e no setInterval
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      // Se estiver tocando, reinicia o setInterval para ajustar à nova velocidade
      if (isPlaying) {
        startUpdatingTime();
      }
    }
  // isPlaying é uma dependência que deve ser considerada.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackRate, isPlaying]);


  /**
   * Lógica para Play/Pause
   */
  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Pausa
      audioRef.current.pause();
      setIsPlaying(false);
      stopUpdatingTime(); // Pausa a atualização do tempo
    } else {
      // Play
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        startUpdatingTime(); // Inicia a atualização do tempo
      } catch (error) {
        // Captura o erro de reprodução, comum em mobile (Auto-play policy)
        console.error("Erro ao reproduzir áudio:", error);
      }
    }
  };

  /**
   * Lógica para Troca de Velocidade
   */
  const toggleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    // O useEffect [playbackRate, isPlaying] acima cuidará de reiniciar o intervalo se estiver tocando
  };

  /**
   * Função de formatação de tempo
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calcula o progresso para a barra, baseado no currentTime que atualiza a cada 1s
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg ${
        fromMe ? "bg-green-100" : "bg-gray-100"
      } min-w-[200px] max-w-[300px]`}
    >
      <Button
        type="button"
        onClick={togglePlay}
        size="sm"
        className={`h-8 w-8 p-0 rounded-full ${
          fromMe
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-600 hover:bg-gray-700"
        }`}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 text-white" />
        ) : (
          <Play className="h-4 w-4 text-white" />
        )}
      </Button>

      <div className="flex-1">
        {/* Barra de Progresso, movida pelo 'progress' atualizado a cada 1s */}
        <div className="relative h-1 bg-gray-300 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${
              fromMe ? "bg-green-600" : "bg-gray-600"
            } transition-all duration-100`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          {/* Exibição do tempo atualizado a cada 1s */}
          <span className="text-xs text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          {/* Botão de velocidade */}
          <Button
            type="button"
            onClick={toggleSpeed}
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs font-semibold text-gray-900 hover:bg-gray-200 hover:text-gray-900"
          >
            {playbackRate}x
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;