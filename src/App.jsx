import { useEffect, useRef } from "react";

export default function Visualizer() {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaElementSource(audio);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);

        draw(); // start drawing when audio context is ready
      }
    };

    const draw = () => {
      if (!canvas || !ctx) return;
      requestAnimationFrame(draw);

      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      if (!analyser || !dataArray) return;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100},50,150)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    // mobile fix: resume context on first user interaction
    const resumeAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
    };

    document.addEventListener("click", resumeAudioContext);
    document.addEventListener("touchstart", resumeAudioContext);

    audio.addEventListener("play", initAudio);

    return () => {
      audio.removeEventListener("play", initAudio);
      document.removeEventListener("click", resumeAudioContext);
      document.removeEventListener("touchstart", resumeAudioContext);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={800} height={400} className="w-full max-w-xl border rounded-lg" />
      <audio ref={audioRef} controls>
        <source src="/song.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
