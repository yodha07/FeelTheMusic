import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [audioCtx, setAudioCtx] = useState(null);
  const [currentSong, setCurrentSong] = useState("KuttyKudiye.mp3");

  useEffect(() => {
    if(!audioRef.current) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaElementSource(audioRef.current);
    const analyser = ctx.createAnalyser();

    source.connect(analyser);
    analyser.connect(ctx.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const c = canvas.getContext('2d');

    function draw(){
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      c.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for(let i= 0; i< bufferLength; i++){
        const barHeight = dataArray[i];
        // c.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        //c.fillStyle = `hsl(${i * 4}, 100%, 50%)`;
        //c.fillStyle = `rgba(${i * 3}, ${barHeight + 50}, ${150}, 0.8)`;
        
        const gradient = c.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, `hsl(${i * 4}, 100%, 50%)`);
        gradient.addColorStop(1, "black");
        c.fillStyle = gradient;
        c.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      // for (let i = 0; i < bufferLength; i++) {
      //   const barHeight = dataArray[i];
      //   const angle = (i / bufferLength) * Math.PI * 2; // full circle
      //   const x = canvas.width / 2 + Math.cos(angle) * (100 + barHeight);
      //   const y = canvas.height / 2 + Math.sin(angle) * (100 + barHeight);
            
      //   c.beginPath();
      //   c.moveTo(canvas.width / 2, canvas.height / 2);
      //   c.lineTo(x, y);
      //   c.strokeStyle = `hsl(${i * 4}, 100%, 50%)`;
      //   c.stroke();
      // }

    }

    function resize(){
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.5;
    }

    resize();
    window.addEventListener('resize', resize);

    draw();
    return () => {
      window.removeEventListener('resize', resize); 
    }
    setAudioCtx(ctx);
  }, []);

  const handlePlay = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    audioRef.current.play();
  }

  const handlePause = () => {
    audioRef.current.pause();
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0){
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.play();
      setCurrentSong(file.name);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-animated from-gray-900 to-gray-800">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-center">
    <h1 className="text-4xl font-extrabold text-white mb-2">
      Feel the Music!!!
    </h1>
    <p className="text-gray-300 mb-6">Now Playing {currentSong}</p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
      <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-md w-full sm:w-auto" onClick={handlePlay}>Play</button>
      <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md w-full sm:w-auto" onClick={handlePause}>Pause</button>
    </div>


    <input
      type="file"
      accept="audio/*"
      onChange={handleFileChange}
      className="border border-gray-600 bg-gray-800 text-white rounded-lg px-4 py-2"
    />

    <audio className='w-full rounded-lg my-5' ref={audioRef} controls crossOrigin="anonymous" src="/KuttyKudiye.mp3"></audio>
    <div className="canvas">
      <canvas
        className="w-full rounded-lg border border-gray-600 shadow-inner bg-black"
        ref={canvasRef}

      />
    </div>
  </div>
    </div>
  );
}

export default App
