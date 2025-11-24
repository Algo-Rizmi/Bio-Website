import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Briefcase,
  Mail,
  Home,
  X,
  MapPin,
  Terminal,
  Coffee,
  Github,
  Twitter,
  Skull,
  Sun,
  Moon,
  Brain,
  Sparkles,
  Send,
  Loader2,
  Cpu,
  Layout,
  ArrowLeft,
  Castle,
  Mountain,
} from "lucide-react";

export default function App() {
  // Global Mode State: null = selector visible, 'RPG' or 'Normal' = mode chosen
  const [appMode, setAppMode] = useState(null);

  const [currentView, setCurrentView] = useState("home");
  const [isNight, setIsNight] = useState(true);
  const [npcState, setNpcState] = useState({
    x: 50,
    y: 50,
    isWalking: false,
    facing: "front",
  });
  const [showModal, setShowModal] = useState(false);

  // --- GEMINI API STATE ---
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "system",
      text: "Greetings, Traveler. I am the Nexus Guardian. Accessing memory banks... How may I assist you?",
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillDescription, setSkillDescription] = useState("");
  const [isSkillLoading, setIsSkillLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // --- LOCATIONS ---
  const locations = {
    home: {
      x: 50,
      y: 45,
      label: "Start",
      icon: <Home size={24} />,
      routeLabel: "Home",
    },
    bio: {
      x: 20,
      y: 60,
      label: "Bio Forest",
      icon: <User size={24} />,
      routeLabel: "About Me",
    },
    function: {
      x: 80,
      y: 60,
      label: "Code Castle",
      icon: <Briefcase size={24} />,
      routeLabel: "Skills",
    },
    oracle: {
      x: 35,
      y: 85,
      label: "AI Nexus",
      icon: <Brain size={24} />,
      routeLabel: "AI Chat",
    },
    contact: {
      x: 65,
      y: 85,
      label: "Contact Cave",
      icon: <Mail size={24} />,
      routeLabel: "Contact",
    },
  };

  // --- GEMINI API HELPER ---
  const callGemini = async (prompt, systemInstruction = "") => {
    const apiKey = ""; // Injected at runtime
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    };

    const delays = [1000, 2000, 4000, 8000, 16000];

    for (let i = 0; i <= delays.length; i++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        return (
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "The signal was lost..."
        );
      } catch (error) {
        if (i === delays.length)
          return "Connection to the Neural Net failed. Please try again later.";
        await new Promise((resolve) => setTimeout(resolve, delays[i]));
      }
    }
  };

  // --- HANDLERS ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsChatLoading(true);

    const systemPrompt =
      "You are the AI Guardian of a Cyberpunk/RPG Portfolio. Speak in a mix of technical jargon and mystical RPG metaphors. You are helpful but slightly cryptic. Keep answers concise (under 50 words).";

    const aiResponse = await callGemini(userMsg, systemPrompt);

    setChatHistory((prev) => [...prev, { role: "ai", text: aiResponse }]);
    setIsChatLoading(false);
  };

  const handleSkillScan = async (skill) => {
    setSelectedSkill(skill);
    setSkillDescription("");
    setIsSkillLoading(true);

    const prompt = `Describe the technical skill "${skill}" as if it were a magical ability, weapon, or item in a fantasy RPG. Be creative but accurate to what it does. Max 1 sentence.`;
    const description = await callGemini(prompt);

    setSkillDescription(description);
    setIsSkillLoading(false);
  };

  // Animated navigation for RPG Mode
  const moveTo = (targetView) => {
    if (npcState.isWalking) return; // Ignore clicks while walking

    // FIX: If already at target location, just re-open modal if it's closed
    if (currentView === targetView) {
      if (!showModal && targetView !== "home") {
        setShowModal(true);
      }
      return;
    }

    const target = locations[targetView];
    const startX = npcState.x;
    let facing = "front";
    if (target.x > startX) facing = "right";
    if (target.x < startX) facing = "left";

    setShowModal(false);
    setNpcState((prev) => ({ ...prev, isWalking: true, facing }));
    setTimeout(
      () => setNpcState({ x: target.x, y: target.y, isWalking: true, facing }),
      50
    );
    setTimeout(() => {
      setNpcState((prev) => ({ ...prev, isWalking: false, facing: "front" }));
      setCurrentView(targetView);
      if (targetView !== "home") setShowModal(true);
      setSelectedSkill(null);
    }, 1500);
  };

  // Instant navigation for Standard Mode
  const directTo = (targetView) => {
    setCurrentView(targetView);
    setShowModal(true);
    setSelectedSkill(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSkill(null);
    if (appMode === "Normal") {
      setCurrentView("home");
    }
  };

  return (
    <div
      className={`relative w-full h-screen overflow-hidden font-mono select-none transition-colors duration-1000 ${
        isNight ? "bg-slate-900 text-white" : "bg-sky-300 text-slate-900"
      }`}
    >
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 255, 200, 0.5)); transform: scale(1); } 50% { filter: drop-shadow(0 0 25px rgba(255, 255, 200, 0.9)); transform: scale(1.05); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        .walking-animation { animation: bounce 0.3s infinite; }
        .moon-anim { animation: pulse-glow 3s infinite ease-in-out; }
        .sun-anim { animation: spin-slow 10s infinite linear; }
        .star { position: absolute; background: white; border-radius: 50%; animation: twinkle 3s infinite ease-in-out; }
        .pixel-border { box-shadow: -4px 0 0 0 currentColor, 4px 0 0 0 currentColor, 0 -4px 0 0 currentColor, 0 4px 0 0 currentColor; margin: 4px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- MODE SELECTION SCREEN --- */}
      {!appMode && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border-4 border-slate-700 p-10 text-center rounded-xl shadow-2xl pixel-border relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 mb-2 animate-pulse tracking-tighter">
              GREETINGS, STRUGGLER.
            </h1>
            <p className="text-slate-400 mb-10 text-lg">
              The path ahead is bifurcated. Choose your destiny.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <button
                onClick={() => setAppMode("RPG")}
                className="group relative p-8 bg-slate-800 border-2 border-slate-600 hover:border-green-500 transition-all rounded-xl flex flex-col items-center gap-4 hover:scale-105 hover:bg-slate-800/80"
              >
                <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors border border-green-700">
                  <MapPin
                    size={40}
                    className="text-green-400 group-hover:text-white"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400 group-hover:text-green-300">
                    Adventure Mode
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 group-hover:text-slate-300">
                    Explore the realm. Walk the path.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setAppMode("Normal")}
                className="group relative p-8 bg-slate-800 border-2 border-slate-600 hover:border-blue-500 transition-all rounded-xl flex flex-col items-center gap-4 hover:scale-105 hover:bg-slate-800/80"
              >
                <div className="w-20 h-20 bg-blue-900/50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors border border-blue-700">
                  <Layout
                    size={40}
                    className="text-blue-400 group-hover:text-white"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-400 group-hover:text-blue-300">
                    Standard Mode
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 group-hover:text-slate-300">
                    Efficient access. No wandering.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Dynamic Environment --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Stars */}
        <div
          className={`absolute top-0 h-[30%] w-full transition-opacity duration-1000 ${
            isNight ? "opacity-100" : "opacity-0"
          }`}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Sun/Moon Toggle */}
        <div
          onClick={() => setIsNight(!isNight)}
          className="absolute top-10 right-10 cursor-pointer z-50 pointer-events-auto transition-transform hover:scale-110"
        >
          {isNight ? (
            <div className="relative w-24 h-24 bg-yellow-100 rounded-full moon-anim flex items-center justify-center">
              <div className="absolute top-4 left-4 w-4 h-4 bg-yellow-200/50 rounded-full"></div>
              <div className="absolute bottom-6 right-6 w-6 h-6 bg-yellow-200/50 rounded-full"></div>
              <div className="absolute top-10 right-4 w-2 h-2 bg-yellow-200/50 rounded-full"></div>
            </div>
          ) : (
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 sun-anim">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-32 h-2 bg-yellow-400 rounded-full"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                    }}
                  ></div>
                ))}
              </div>
              <div className="absolute inset-0 m-auto w-16 h-16 bg-yellow-400 rounded-full border-4 border-orange-400 shadow-[0_0_40px_rgba(253,224,71,0.6)]"></div>
            </div>
          )}
        </div>

        {/* Horizon Trees */}
        <div className="absolute top-[25%] left-0 right-0 h-24 flex items-end justify-around opacity-80">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`w-0 h-0 border-l-[15px] border-r-[15px] border-b-[50px] border-l-transparent border-r-transparent transition-colors duration-1000 ${
                isNight ? "border-b-slate-800" : "border-b-emerald-700"
              }`}
              style={{ transform: `scale(${0.8 + Math.random() * 0.5})` }}
            ></div>
          ))}
        </div>

        {/* Ground */}
        <div
          className={`absolute top-[30%] bottom-0 left-0 right-0 transition-colors duration-1000 ${
            isNight ? "bg-green-900" : "bg-green-500"
          }`}
        >
          <div
            className="w-full h-full opacity-20"
            style={{
              backgroundImage: `radial-gradient(${
                isNight ? "#064e3b" : "#15803d"
              } 2px, transparent 2px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>

          {/* Scattered Trees on Grass */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`tree-${i}`}
              className={`absolute w-0 h-0 border-l-[15px] border-r-[15px] border-b-[40px] border-l-transparent border-r-transparent opacity-60 ${
                isNight ? "border-b-slate-900" : "border-b-green-800"
              }`}
              style={{
                left: `${Math.random() * 95}%`,
                top: `${Math.random() * 90}%`,
                transform: `scale(${0.7 + Math.random() * 0.5})`,
                zIndex: 0,
              }}
            />
          ))}

          {/* Normal Mode Decor */}
          {appMode === "Normal" && (
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-10 left-[15%] transition-colors duration-1000 text-slate-800/50">
                <Castle
                  size={120}
                  strokeWidth={1}
                  className={isNight ? "text-slate-600" : "text-slate-700"}
                />
              </div>
              <div className="absolute bottom-20 right-[15%] transition-colors duration-1000">
                <Mountain
                  size={100}
                  strokeWidth={1}
                  className={isNight ? "text-slate-700" : "text-slate-600"}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-10 bg-black/40 rounded-t-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- STANDARD MODE NAVIGATION --- */}
      {appMode === "Normal" && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in slide-in-from-top duration-500">
          <div className="bg-slate-900/90 p-3 rounded-full border-2 border-slate-600 shadow-xl backdrop-blur-md flex items-center justify-between">
            <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide w-full justify-center">
              {Object.entries(locations).map(
                ([key, loc]) =>
                  key !== "home" && (
                    <button
                      key={key}
                      onClick={() => directTo(key)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-purple-900/50 text-slate-300 hover:text-white rounded-full transition-colors whitespace-nowrap"
                    >
                      <span className="text-purple-400">{loc.icon}</span>
                      <span className="font-bold hidden sm:inline">
                        {loc.routeLabel}
                      </span>
                    </button>
                  )
              )}
            </div>
            <button
              onClick={() => setAppMode(null)}
              className="ml-4 p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-full transition-colors"
              title="Switch Mode"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      )}

      {/* --- RPG MODE: INTERACTIVE LOCATIONS & NPC --- */}
      {appMode === "RPG" && (
        <>
          {Object.entries(locations).map(([key, loc]) => (
            <div
              key={key}
              onClick={() => moveTo(key)}
              className={`absolute flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 z-10`}
              style={{
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`p-3 border-2 rounded-lg shadow-lg transition-colors duration-1000 ${
                  isNight
                    ? "bg-slate-800 border-slate-600 text-white"
                    : "bg-white border-emerald-600 text-emerald-800"
                } ${currentView === key ? "ring-4 ring-yellow-400" : ""}`}
              >
                {loc.icon}
              </div>
              <span
                className={`mt-2 px-2 py-1 rounded text-xs backdrop-blur-sm font-bold tracking-widest uppercase transition-colors duration-1000 ${
                  isNight ? "bg-black/50 text-white" : "bg-white/60 text-black"
                }`}
              >
                {loc.label}
              </span>
            </div>
          ))}

          <div
            className="absolute z-20 transition-all ease-linear"
            style={{
              left: `${npcState.x}%`,
              top: `${npcState.y}%`,
              transitionDuration: npcState.isWalking ? "1.5s" : "0s",
              transform: "translate(-50%, -100%)",
            }}
          >
            <div
              className={`relative w-16 h-16 ${
                npcState.isWalking ? "walking-animation" : ""
              }`}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-xl filter"
              >
                <ellipse
                  cx="50"
                  cy="95"
                  rx="20"
                  ry="5"
                  fill="rgba(0,0,0,0.5)"
                />
                <g
                  transform={
                    npcState.facing === "left"
                      ? "scale(-1, 1) translate(-100, 0)"
                      : ""
                  }
                >
                  <rect
                    x="35"
                    y="40"
                    width="30"
                    height="40"
                    fill="#3b82f6"
                    rx="5"
                  />
                  <rect
                    x="25"
                    y="10"
                    width="50"
                    height="40"
                    fill="#fca5a5"
                    rx="8"
                  />
                  <path d="M25 10 H75 V25 H25 Z" fill="#4b5563" />
                  {npcState.facing === "back" ? (
                    <rect
                      x="25"
                      y="10"
                      width="50"
                      height="40"
                      fill="#4b5563"
                      rx="8"
                    />
                  ) : (
                    <>
                      {" "}
                      <rect
                        x="35"
                        y="25"
                        width="8"
                        height="8"
                        fill="black"
                      />{" "}
                      <rect x="57" y="25" width="8" height="8" fill="black" />{" "}
                      <rect
                        x="45"
                        y="38"
                        width="10"
                        height="4"
                        fill="#be123c"
                      />{" "}
                    </>
                  )}
                  <rect
                    x="20"
                    y="45"
                    width="10"
                    height="25"
                    fill="#fca5a5"
                    rx="2"
                    className={npcState.isWalking ? "animate-pulse" : ""}
                  />
                  <rect
                    x="70"
                    y="45"
                    width="10"
                    height="25"
                    fill="#fca5a5"
                    rx="2"
                    className={npcState.isWalking ? "animate-pulse" : ""}
                  />
                  <rect x="38" y="80" width="8" height="15" fill="#1e3a8a" />
                  <rect x="54" y="80" width="8" height="15" fill="#1e3a8a" />
                </g>
              </svg>
              {!npcState.isWalking && !showModal && currentView === "home" && (
                <div
                  className={`absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold border-2 animate-bounce transition-colors duration-1000 ${
                    isNight
                      ? "bg-white text-black border-black"
                      : "bg-slate-800 text-white border-slate-600"
                  }`}
                >
                  Click a location!
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* --- Modal Content Area (Shared by Both Modes) --- */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 text-white">
          <div
            className={`relative w-full max-w-2xl border-4 p-8 shadow-2xl rounded-sm max-h-[80vh] overflow-y-auto pixel-border ${
              isNight
                ? "bg-slate-900 border-slate-700 text-slate-200"
                : "bg-white border-emerald-600 text-slate-800"
            }`}
          >
            {/* Close Button (Right) - Only this one remains */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-red-500 hover:text-white transition-colors border border-current rounded z-10"
            >
              <X size={20} />
            </button>

            {/* --- VIEW: BIO --- */}
            {currentView === "bio" && (
              <div className="space-y-6 mt-8">
                <div className="flex items-center gap-4 border-b border-current pb-4">
                  <div className="w-20 h-20 bg-black rounded-full overflow-hidden border-2 border-red-500 shadow-lg shrink-0">
                    <img
                      src="/hacker.png"
                      alt="Malicious Hacker"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.parentNode.classList.add(
                          "flex",
                          "items-center",
                          "justify-center"
                        );
                        e.target.parentNode.innerHTML = "💀";
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-red-500">
                      About Me
                    </h2>
                    <p className="opacity-70">Jawad Sharafi</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm md:text-base leading-relaxed">
                  <p>
                    My interest in software engineering began with the world of
                    **hacking and penetration testing**. I learned to code by
                    exploring vulnerabilities and understanding how to break
                    systems. This foundation guides all my development work
                    today.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div
                      className={`p-3 rounded ${
                        isNight ? "bg-slate-800" : "bg-slate-100"
                      }`}
                    >
                      <h3 className="font-bold text-red-500">Stats</h3>
                      <ul className="mt-2 space-y-1 text-xs opacity-80">
                        <li>STR: 12 (Keyboard Endurance)</li>
                        <li>INT: 20 (Exploit Analysis)</li>
                        <li>DEX: 15 (Rapid Injection)</li>
                      </ul>
                    </div>
                    <div
                      className={`p-3 rounded ${
                        isNight ? "bg-slate-800" : "bg-slate-100"
                      }`}
                    >
                      <h3 className="font-bold text-red-500">Interests</h3>
                      <ul className="mt-2 space-y-1 text-xs opacity-80">
                        <li>👨‍💻 Programming</li>
                        <li>💻 Hacking</li>
                        <li>🤼‍♂️ Wrestling</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- VIEW: FUNCTIONS (Code Castle) --- */}
            {currentView === "function" && (
              <div className="space-y-6 mt-8">
                <div className="flex items-center gap-4 border-b border-current pb-4">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-lg flex items-center justify-center text-3xl">
                    ⚔️
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-purple-500">
                      Functions & Skills
                    </h2>
                    <p className="opacity-70">
                      My Technical Arsenal - Click a skill to scan it! ✨
                    </p>
                  </div>
                </div>

                {/* Gemini Scan Result */}
                {selectedSkill && (
                  <div className="relative bg-purple-900/50 border border-purple-500 p-4 rounded animate-in fade-in slide-in-from-top-4">
                    {/* Close Scan Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSkill(null);
                      }}
                      className="absolute top-2 right-2 p-1 hover:bg-purple-800 rounded-full text-purple-300 transition-colors"
                      title="Close Scan"
                    >
                      <X size={16} />
                    </button>

                    <div className="flex items-center gap-2 text-purple-300 mb-1">
                      <Sparkles size={16} />
                      <span className="font-bold uppercase text-xs tracking-wider">
                        Scanning {selectedSkill}...
                      </span>
                    </div>
                    {isSkillLoading ? (
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <Loader2 size={14} className="animate-spin" />{" "}
                        Decrypting ancient scrolls...
                      </div>
                    ) : (
                      <p className="text-sm italic text-purple-100">
                        "{skillDescription}"
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SkillCard
                    onScan={handleSkillScan}
                    isNight={isNight}
                    icon={<Terminal />}
                    title="Frontend"
                    skills={[
                      "JavaScript",
                      "TypeScript",
                      "HTML",
                      "CSS",
                      "Tailwind",
                      "React",
                      "Bootstrap",
                    ]}
                  />
                  <SkillCard
                    onScan={handleSkillScan}
                    isNight={isNight}
                    icon={<Coffee />}
                    title="Backend"
                    skills={["Node.js", "C# .NET", "Python", "Java", "C"]}
                  />
                  <SkillCard
                    onScan={handleSkillScan}
                    isNight={isNight}
                    icon={<MapPin />}
                    title="Tools"
                    skills={[
                      "Git",
                      "Docker",
                      "Kali Linux",
                      "Visual Studio",
                      "VirtualBox",
                      "VMware",
                    ]}
                  />
                  <SkillCard
                    onScan={handleSkillScan}
                    isNight={isNight}
                    icon={<Cpu />}
                    title="Operating Systems"
                    skills={["Windows", "Linux"]}
                  />
                </div>
              </div>
            )}

            {/* --- VIEW: ORACLE (AI Nexus) --- */}
            {currentView === "oracle" && (
              <div className="h-[60vh] flex flex-col mt-8">
                <div className="flex items-center gap-4 border-b border-current pb-4 mb-4">
                  <div className="w-16 h-16 bg-cyan-600 text-white rounded-lg flex items-center justify-center text-3xl animate-pulse">
                    <Brain />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-cyan-500">
                      AI Nexus
                    </h2>
                    <p className="opacity-70">
                      Consult the Digital Construct ✨
                    </p>
                  </div>
                </div>

                {/* Chat Window */}
                <div
                  className={`flex-1 overflow-y-auto p-4 rounded mb-4 border font-mono text-sm space-y-3 ${
                    isNight
                      ? "bg-black/30 border-slate-600"
                      : "bg-slate-100 border-slate-300"
                  }`}
                >
                  {chatHistory.map(
                    (msg, idx) =>
                      msg.role !== "system" && (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === "user"
                                ? isNight
                                  ? "bg-cyan-900 text-cyan-100"
                                  : "bg-cyan-100 text-cyan-900"
                                : isNight
                                ? "bg-slate-800 text-slate-300"
                                : "bg-white text-slate-700 border"
                            }`}
                          >
                            <span className="block text-[10px] uppercase opacity-50 mb-1 font-bold">
                              {msg.role === "user" ? "You" : "Oracle"}
                            </span>
                            {msg.text}
                          </div>
                        </div>
                      )
                  )}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div
                        className={`p-3 rounded-lg flex items-center gap-2 ${
                          isNight
                            ? "bg-slate-800 text-slate-300"
                            : "bg-white text-slate-700 border"
                        }`}
                      >
                        <Loader2 size={14} className="animate-spin" />{" "}
                        <span className="text-xs animate-pulse">
                          Computing...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask the construct a question..."
                    className={`flex-1 p-3 rounded border outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
                      isNight
                        ? "bg-slate-800 border-slate-600"
                        : "bg-white border-slate-300"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            )}

            {/* --- VIEW: CONTACT --- */}
            {currentView === "contact" && (
              <div className="space-y-6 text-center mt-8">
                <div className="border-b border-current pb-4">
                  <h2 className="text-3xl font-bold text-pink-500">
                    Contact Cave
                  </h2>
                  <p className="opacity-70">Send a raven or an email.</p>
                </div>
                <div className="flex justify-center gap-6 py-8">
                  <SocialLink
                    href="https://github.com/"
                    icon={<Github />}
                    label="GitHub"
                  />
                  <SocialLink
                    href="mailto:your.email@gmail.com"
                    icon={<Mail />}
                    label="Gmail"
                  />
                  <SocialLink
                    href="https://twitter.com/"
                    icon={<Twitter />}
                    label="Twitter"
                  />
                </div>
                <form
                  className="max-w-md mx-auto space-y-4 text-left"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div>
                    <label className="block text-xs uppercase opacity-60 mb-1">
                      Quest Giver Name
                    </label>
                    <input
                      type="text"
                      className={`w-full border p-2 rounded outline-none ${
                        isNight
                          ? "bg-slate-800 border-slate-600 focus:ring-pink-500"
                          : "bg-white border-slate-300 focus:ring-pink-500"
                      }`}
                      placeholder="Enter name..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase opacity-60 mb-1">
                      Mission Details
                    </label>
                    <textarea
                      className={`w-full border p-2 rounded outline-none h-24 ${
                        isNight
                          ? "bg-slate-800 border-slate-600 focus:ring-pink-500"
                          : "bg-white border-slate-300 focus:ring-pink-500"
                      }`}
                      placeholder="How can I help you?"
                    ></textarea>
                  </div>
                  <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded transition-colors pixel-border">
                    SEND MESSAGE
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
const SkillCard = ({ icon, title, skills, isNight, onScan }) => (
  <div
    className={`p-4 rounded border transition-colors ${
      isNight
        ? "bg-slate-800 border-slate-700 hover:border-slate-500"
        : "bg-slate-50 border-slate-200 hover:border-emerald-400"
    }`}
  >
    <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold">
      {icon}
      <span>{title}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <button
          key={skill}
          onClick={() => onScan(skill)}
          className={`text-xs px-2 py-1 rounded cursor-pointer hover:scale-105 transition-transform flex items-center gap-1 group ${
            isNight
              ? "bg-slate-900 text-slate-300 hover:bg-purple-900 hover:text-purple-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-purple-100 hover:border-purple-300"
          }`}
        >
          {skill}
          <Sparkles
            size={8}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400"
          />
        </button>
      ))}
    </div>
  </div>
);

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity group"
  >
    <div className="p-4 rounded-full bg-current text-white/20 group-hover:text-white/40 transition-colors">
      <div className="text-current mix-blend-difference">{icon}</div>
    </div>
    <span className="text-xs">{label}</span>
  </a>
);
