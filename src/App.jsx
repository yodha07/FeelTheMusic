import { useRef, useState, useEffect } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [audioCtx, setAudioCtx] = useState(null);
  const [currentSong, setCurrentSong] = useState("KuttyKudiye.mp3");
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // 🎵 Handle Visualizer Drawing
  const startVisualizer = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaElementSource(audioRef.current);

      source.connect(analyser);
      analyser.connect(ctx.destination);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const c = canvas.getContext("2d");

      function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        c.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i];
          const gradient = c.createLinearGradient(
            0,
            canvas.height - barHeight,
            0,
            canvas.height
          );
          gradient.addColorStop(0, `hsl(${i * 4}, 100%, 50%)`);
          gradient.addColorStop(1, "black");
          c.fillStyle = gradient;
          c.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }

      function resize() {
        canvas.width = window.innerWidth * 0.5;
        canvas.height = window.innerHeight * 0.35;
      }

      resize();
      window.addEventListener("resize", resize);

      draw();
      setAudioCtx(ctx);
    }

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  };

  // 🎧 Spotify Login
  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:3000/login"; // change URL
  };

  // 🎧 Spotify Callback → exchange code for token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !spotifyToken) {
      fetch(`http://localhost:3000/callback?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          setSpotifyToken(data.access_token);
          window.history.replaceState({}, document.title, "/"); // clean URL
        });
    }
  }, [spotifyToken]);

  // 🔍 Search Spotify
  const handleSearch = async (query) => {
    if (!spotifyToken) return;
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`,
      {
        headers: { Authorization: `Bearer ${spotifyToken}` },
      }
    );
    const data = await res.json();
    setSearchResults(data.tracks.items);
  };

  // ▶️ Play Spotify song
  const handlePlaySpotify = (previewUrl, name) => {
    if (previewUrl) {
      audioRef.current.src = previewUrl;
      audioRef.current.play();
      setCurrentSong(name);
      startVisualizer();
    } else {
      alert("No preview available for this track");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-animated from-gray-900 to-gray-800">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          Feel the Music!!!
        </h1>
        <p className="text-gray-300 mb-6">Now Playing {currentSong}</p>

        {!spotifyToken ? (
          <button
            className="px-4 py-2 mb-4 rounded-lg bg-green-500 hover:bg-green-600 text-white shadow-md"
            onClick={handleSpotifyLogin}
          >
            Login with Spotify
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search Spotify songs..."
              className="border border-gray-600 bg-gray-800 text-white rounded-lg px-4 py-2 mb-4 w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(e.target.value);
              }}
            />
            <ul className="text-white mb-6">
              {searchResults.map((track) => (
                <li
                  key={track.id}
                  className="cursor-pointer hover:text-green-400"
                  onClick={() =>
                    handlePlaySpotify(track.preview_url, track.name)
                  }
                >
                  {track.name} — {track.artists[0].name}
                </li>
              ))}
            </ul>
          </>
        )}

        <audio
          className="w-full rounded-lg my-5"
          ref={audioRef}
          controls
          crossOrigin="anonymous"
          src="/KuttyKudiye.mp3"
          onPlay={startVisualizer}
        ></audio>

        <div className="canvas">
          <canvas
            className="w-full rounded-lg border border-gray-600 shadow-inner bg-black h-full"
            ref={canvasRef}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
