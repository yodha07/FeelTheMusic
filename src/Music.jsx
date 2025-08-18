import { useEffect, useRef, useState } from "react";

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100},50,150)`;
        ctx.fillRect(
          x,
          canvas.height - barHeight,
          barWidth,
          barHeight
        );
        x += barWidth + 1;
      }
    };

    draw();
  }, [analyser]);

  const handlePlay = async () => {
    if (!audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();

      const source = context.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(context.destination);

      setAudioContext(context);
      setAnalyser(analyserNode);
    }

    if (audioRef.current.paused) {
      await audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4">🎶 Feel The Music</h1>

      {/* Audio element */}
      <audio ref={audioRef} src="/music.mp3" preload="auto"></audio>

      {/* Play/Pause button */}
      <button
        onClick={handlePlay}
        className="px-4 py-2 bg-purple-600 rounded-lg mb-4 hover:bg-purple-800 transition"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth * 0.9}
        height={300}
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}

export default App;
