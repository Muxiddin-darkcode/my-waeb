/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Smile, 
  MessageCircle, 
  Sparkles, 
  Play, 
  Pause, 
  X, 
  Music, 
  Volume2, 
  VolumeX, 
  ArrowDown, 
  HeartHandshake, 
  Sparkle,
  Bookmark,
  Gift,
  Send,
  RotateCcw,
  Compass,
  Plus,
  Coffee,
  HelpCircle,
  Award
} from 'lucide-react';

// === EDITABLE/REPLACEABLE ASSETS IMPORT ===
// @ts-ignore
import romanticSunset from './assets/images/romantic_sunset_1782226178331.jpg';
// @ts-ignore
import cozyMoments from './assets/images/cozy_moments_1782226197916.jpg';
// @ts-ignore
import starryDream from './assets/images/starry_dream_1782226218490.jpg';
// @ts-ignore
import glowingWarmth from './assets/images/glowing_warmth_1782226238073.jpg';

const SOUND_TRACKS = [
  {
    title: "Sade: Gymnopédie No. 1 (Piano)",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Erik_Satie_-_Gymnop%C3%A9die_No._1.mp3",
    desc: "Sokin va mayin oqimda chalingan, dildan va samimiy suhbatlashish uchun mos ohang."
  },
  {
    title: "Chopin: Nocturne Op. 9 No. 2",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Chopin_Nocturne_Op._9_No._2_in_E_flat.mp3",
    desc: "Yurak torlarini chertuvchi, dunyodagi eng mashhur va tarovatli klassik sevgi kuylari."
  },
  {
    title: "Beethoven: Moonlight Sonata",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Beethoven_Moonlight_Sonata_1st_movement.mp3",
    desc: "Chuqur tuyg'ular, sokinlik va mayin tunda yulduzlar ostidagi sayohat ohangi."
  }
];

const galleryItems = [
  {
    img: romanticSunset,
    title: "Oltin lahzalar",
    desc: "Kunning eng go'zal qismi – osmon biz kabi jimgina suhbatlashganda."
  },
  {
    img: cozyMoments,
    title: "Sokin iliqlik",
    desc: "Oddiy suhbat, mayin nur va so'zsiz tushuniladigan lahzalar."
  },
  {
    img: starryDream,
    title: "Orzular maskani",
    desc: "Uzoq tunda seni eslatuvchi yorug' yulduzlar jilosi."
  },
  {
    img: glowingWarmth,
    title: "Yo'lchi chiroq",
    desc: "Dunyo qanchalik sovuq bo'lmasin, tuyg'ularimiz hamisha issiq."
  },
];

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotation: number;
  drift: number;
}

interface Flower {
  id: string;
  name: string;
  icon: string;
  color: string;
  meaning: string;
  meaningUz: string;
}

export default function App() {
  // Loading & Flow State
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Audio state
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.85);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Celebration system
  const [celebrate, setCelebrate] = useState(false);
  const [celebrationHearts, setCelebrationHearts] = useState<HeartParticle[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Lightbox / Gallery
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeImageTitle, setActiveImageTitle] = useState<string | null>(null);

  // Escaping Button & Gamified Bribing system
  const [escapeCount, setEscapeCount] = useState(0);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [customPrankMessage, setCustomPrankMessage] = useState("Sizni kutmoqda...");
  const [prankGlaowed, setPrankGlowed] = useState(false);

  // --- INTERACTIVE MODULES ---

  // Module A: Flower Bouquet Builder Game (Guldasta Yaratish)
  const flowersList: Flower[] = [
    { id: 'rose', name: 'Qizil Atirgul', icon: '🌹', color: 'text-red-500', meaning: 'Sincere Love', meaningUz: 'Senga bo\'lgan chin kamolotli sevgi va sadoqatim ramzi.' },
    { id: 'tulip', name: 'Oq Lola', icon: '🌷', color: 'text-pink-400', meaning: 'Purity & Dignity', meaningUz: 'Beg\'uborlik, samimiylik va munosabatlarimiz pokligi.' },
    { id: 'orhid', name: 'Sariq Atirgul', icon: '🌻', color: 'text-amber-400', meaning: 'Joy & Brightness', meaningUz: 'Sening sershukuh tabassuming va hayotimga ulashgan yorug\'liging.' },
    { id: 'lavender', name: 'Lavanda', icon: '🪻', color: 'text-purple-400', meaning: 'Peace & Serenity', meaningUz: 'Sen bilan suhbatlardagi sokinlik, xotirjamlik va ruhiy yaqinlik.' },
    { id: 'daisy', name: 'Moychechak', icon: '🌼', color: 'text-yellow-200', meaning: 'Tenderness', meaningUz: 'Nozik va mayin tuyg\'ular, g\'amxo\'rlik va iliqlik.' },
  ];
  const [myBouquet, setMyBouquet] = useState<Flower[]>([]);
  const [isBouquetClaimed, setIsBouquetClaimed] = useState(false);

  // Module B: Romantic Digital Coupons (Sevgi Voucherlari)
  const initialCoupons = [
    { id: 'coffee', title: 'Muzqaymoq & Shirinlik Kuponi 🍦', desc: 'Istalgan vaqtda va istalgan joyda shirinlik sarguzashtiga chiqish kafolati. Rad etish mutlaqo mumkin emas!', claimed: false },
    { id: 'listen', title: 'Shikoyat va Tinglash Voucheri 🎧', desc: '100% diqqat, hamdardlik va sening eng sevimli musiqangni soatlab tinimsiz birga eshitish huquqi.', claimed: false },
    { id: 'gift', title: 'Kutilmagan Maxfiy Sovg\'a Kuponi 🎁', desc: 'Sening yuzingda tabassum uyg\'otadigan, faqat sening didingga mos keladigan mitti sirli sovg\'acha.', claimed: false },
  ];
  const [coupons, setCoupons] = useState(initialCoupons);

  // Module C: Interactive Complement Deck (Flip Compliment Cards)
  const compliments = [
    { text: "Sen gapirayotganingda go'yo dunyo biroz sokinlashadi va men faqat sening ovozingni tinglagim keladi.", icon: "✨" },
    { text: "Sening tarbiyang, muloyimliging va samimiy e'tiboring qalbing qanchalik keng ekanining isbotidir.", icon: "🕊️" },
    { text: "Sening borliging atrofga shunday iliq energiya ulashadiki, har qanday vaziyatda kayfiyatni ko'taradi.", icon: "🌸" },
    { text: "Sening beg'ubor tabassuming eng tushkun dildagi qorong'ulikni ham nurga to'ldirishga qodir.", icon: "💫" },
    { text: "Gohida so'zsiz jimgina yaqin bo'lish ham butun hayot tashvishlarini unutish uchun yetarli.", icon: "🧸" }
  ];
  const [activeComplimentIdx, setActiveComplimentIdx] = useState(0);

  // Module D: Flying Paper Airplane Letter Creator
  const [writtenMessage, setWrittenMessage] = useState("");
  const [isSendingLetter, setIsSendingLetter] = useState(false);
  const [letterFlyAway, setLetterFlyAway] = useState(false);
  const [sentLettersList, setSentLettersList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yurakdan_letters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Background control
  const [rainHearts, setRainHearts] = useState(true);

  // Generate background starry night elements
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1.2,
      duration: Math.random() * 4 + 4,
    }));
  }, []);

  // Loading screen timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20 + 15);
      });
    }, 90);
    return () => clearInterval(interval);
  }, []);

  // Enter Site CTA to unlock autoplay smoothly and play background music
  const handleEnterSite = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Audio play allowed on user gesture. Forcing play state.", err);
          setIsPlaying(true);
        });
    } else {
      setIsPlaying(true);
    }
    setLoading(false);
  };

  // Autoplay music on first user interaction or mount if permitted by browser
  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            removeListeners();
          })
          .catch((err) => {
            console.log("Autoplay waiting for direct user click/touch...", err);
          });
      }
    };

    const removeListeners = () => {
      document.removeEventListener("click", startAudio);
      document.removeEventListener("touchstart", startAudio);
      document.removeEventListener("keydown", startAudio);
      document.removeEventListener("mousedown", startAudio);
    };

    // Try playing immediately with a short delay after load
    const timer = setTimeout(() => {
      startAudio();
    }, 1500);

    // Listens for first touch/click
    document.addEventListener("click", startAudio);
    document.addEventListener("touchstart", startAudio);
    document.addEventListener("keydown", startAudio);
    document.addEventListener("mousedown", startAudio);

    return () => {
      clearTimeout(timer);
      removeListeners();
    };
  }, []);

  // Sync music selections
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = SOUND_TRACKS[selectedTrack].url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [selectedTrack]);

  // Handle vol changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : audioVolume;
    }
  }, [isMuted, audioVolume]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Add flower to the custom virtual bouquet
  const addFlowerToBouquet = (flower: Flower) => {
    if (myBouquet.length >= 8) return; // Limit to 8 beautiful flowers
    setMyBouquet([...myBouquet, { ...flower, id: flower.id + '-' + Date.now() }]);
    
    // Auto play music on interaction to set romantic audio
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Clear virtual bouquet
  const clearBouquet = () => {
    setMyBouquet([]);
    setIsBouquetClaimed(false);
  };

  // Telegram Send helper
  const sendTelegramNotification = async (text: string) => {
    try {
      await fetch("/api/send-to-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });
    } catch (e) {
      console.error("Telegramga yuborishda xato:", e);
    }
  };

  // Claim Coupon handler
  const claimCoupon = (id: string) => {
    const couponItem = coupons.find(c => c.id === id);
    if (couponItem) {
      const msgText = `🎟 <b>Yangi kupon faollashdi!</b>\n\n🎁 <b>Kupon:</b> ${couponItem.title}\n📜 <b>Tavsif:</b> <i>${couponItem.desc}</i>\n\n⏱ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;
      sendTelegramNotification(msgText);
    }

    setCoupons(prev => prev.map(c => c.id === id ? { ...c, claimed: true } : c));
    
    // Tiny celebration burst for cute dopamine hit
    const hearts: HeartParticle[] = [];
    const colors = ["#fda4af", "#ff007f", "#ffffff"];
    for (let i = 0; i < 15; i++) {
      hearts.push({
        id: i,
        x: 40 + Math.random() * 20,
        y: 60 + Math.random() * 10,
        size: Math.random() * 15 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 3 + 1.5,
        delay: 0,
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 30
      });
    }
    setCelebrationHearts(hearts);
    setCelebrate(true);
    setTimeout(() => {
      setCelebrate(false);
      setCelebrationHearts([]);
    }, 3000);
  };

  // Flying letter submitter
  const handleSendLetter = (e: FormEvent) => {
    e.preventDefault();
    const currentMsg = writtenMessage.trim();
    if (!currentMsg) return;

    setIsSendingLetter(true);

    const msgText = `💌 <b>Yangi ochiq maktub kirdi!</b>\n\n📝 <b>Sizga yozilgan matn:</b>\n<i>${currentMsg}</i>\n\n⏱ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;
    sendTelegramNotification(msgText);

    setTimeout(() => {
      setLetterFlyAway(true);
      setTimeout(() => {
        const list = [currentMsg, ...sentLettersList];
        setSentLettersList(list);
        try {
          localStorage.setItem('yurakdan_letters', JSON.stringify(list));
        } catch {}
        setWrittenMessage("");
        setIsSendingLetter(false);
        setLetterFlyAway(false);
      }, 1500);
    }, 800);
  };

  // Claim Bouquet handler with Telegram notification
  const handleClaimBouquet = () => {
    setIsBouquetClaimed(true);
    const flowerNames = myBouquet.map(f => `• ${f.icon} ${f.name} (Ma'nosi: ${f.meaningUz})`).join("\n");
    const msgText = `💐 <b>Sizga yangi virtual guldasta sovg'a qilindi!</b>\n\n🌸 <b>Guldasta tarkibi:</b>\n${flowerNames || "Guldasta bo'sh"}\n\n⏱ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;
    sendTelegramNotification(msgText);
  };

  const clearLetters = () => {
    setSentLettersList([]);
    try {
      localStorage.removeItem('yurakdan_letters');
    } catch {}
  };

  // YES celebration burst
  const handleYesCelebration = () => {
    setCelebrate(true);
    setShowModal(true);

    const msgText = `💖 <b>Muloqot taklifiga ijobiy javob berildi!</b>\n\n💍 <b>Sizning taklifingizga:</b> "Ha, albatta! 💖" deb javob berdi!\n✨ <i>U birga muloqot qilishni va bir-birini yaxshiroq tanishni istaydi!</i>\n\n⏱ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;
    sendTelegramNotification(msgText);

    // Auto-on play to trigger emotional climax
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    // Spawn lovely hearts
    const hearts: HeartParticle[] = [];
    const colors = ["#fda4af", "#f43f5e", "#ec4899", "#ffffff", "#fda4af", "#db2777"];
    for (let i = 0; i < 85; i++) {
      hearts.push({
        id: i,
        x: 10 + Math.random() * 80,
        y: 85 + Math.random() * 15,
        size: Math.random() * 22 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 4.5 + 3,
        delay: Math.random() * 1.5,
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 50
      });
    }
    setCelebrationHearts(hearts);

    setTimeout(() => {
      setCelebrate(false);
      setCelebrationHearts([]);
    }, 7000);
  };

  // Ultimate Escaping Prank logic that increases the Yes button size!
  const handlePrankEscape = () => {
    const randomAngle = Math.random() * 2 * Math.PI;
    const distance = 160 + Math.random() * 140; // Jump further
    const newX = Math.cos(randomAngle) * distance;
    const newY = Math.sin(randomAngle) * distance;

    setBtnOffset({ x: newX, y: newY });
    const currentCount = escapeCount + 1;
    setEscapeCount(currentCount);

    const reactMessages = [
      "Voy! Qochib ketdi 😄",
      "Juda tezkor-a? 😉",
      "Noilojlik girdobi... 😜",
      "Ushlab bo'lmas shabada 💫",
      "Bo'sh kelmang, yana harakat qilib ko'ring! ✨",
      "Balki shunchaki 'Ha' degan ma'quldir? ❤️",
      "Haliyam ushlay olmadingizmi? 🔥",
      "Yaxshisi 'Ha' tugmasini bosa qoling! 😂"
    ];
    const nextMsg = reactMessages[Math.min(currentCount - 1, reactMessages.length - 1)];
    setCustomPrankMessage(nextMsg);
  };

  // Action scroll to a section
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#070306] text-neutral-100 font-sans relative overflow-x-hidden animate-ambient selection:bg-rose-500/20">
      
      {/* Background Star Ambient Layers */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        {/* Slowly drifting cozy ambient light blobs */}
        <motion.div 
          animate={{
            x: [0, 45, -30, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] bg-rose-950/20 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{
            x: [0, -55, 35, 0],
            y: [0, 45, -35, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[35%] left-[-15%] w-[600px] h-[600px] bg-purple-950/20 rounded-full blur-[130px]" 
        />
        <motion.div 
          animate={{
            x: [0, 35, -45, 0],
            y: [0, -45, 55, 0],
            scale: [1, 1.25, 0.8, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[65%] right-[-15%] w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{
            x: [0, -40, 40, 0],
            y: [0, 60, -50, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[5%] left-[-10%] w-[700px] h-[700px] bg-[#1d0718] rounded-full blur-[200px]" 
        />
        
        {/* Shooting Stars */}
        <div className="absolute inset-0 overflow-hidden w-full h-full">
          {Array.from({ length: 4 }).map((_, idx) => (
            <motion.div
              key={`shooting-star-${idx}`}
              className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-rose-300/60 to-white/90 shadow-[0_0_8px_#ffffff]"
              initial={{ 
                x: `${15 + idx * 22}%`, 
                y: `${10 + Math.random() * 15}%`, 
                opacity: 0, 
                width: "0px" 
              }}
              animate={{
                x: [`${15 + idx * 22}%`, `${15 + idx * 22 - 12}%`],
                y: [`${10 + Math.random() * 15}%`, `${10 + Math.random() * 15 + 25}%`],
                width: ["0px", "140px", "0px"],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "loop",
                delay: idx * 5.2 + 2,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              style={{
                transform: "rotate(-38deg)",
                transformOrigin: "left center"
              }}
            />
          ))}
        </div>
        
        {/* Star elements */}
        {backgroundStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-rose-200/25 animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}

        {/* Rain of customizable petal, heart, and sparkle elements */}
        {rainHearts && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none w-full h-full">
            {Array.from({ length: 24 }).map((_, idx) => {
              const types = ["🌸", "✨", "💖", "🌸", "✨", "🤍"];
              const selectedSymbol = types[idx % types.length];
              return (
                <div 
                  key={idx}
                  className="absolute particle text-sm select-none"
                  style={{
                    left: `${idx * 4.1 + Math.random() * 3}%`,
                    top: `${Math.random() * -15}%`,
                    animationDuration: `${Math.random() * 8 + 6}s`,
                    animationDelay: `${idx * 0.35}s`,
                    opacity: selectedSymbol === "✨" || selectedSymbol === "💖" ? 0.25 : 0.18,
                    filter: selectedSymbol === "✨" ? "drop-shadow(0 0 4px rgba(254,240,138,0.7))" : "none"
                  }}
                >
                  {selectedSymbol}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FIXED AUDIO CONTROLLER FLOAT HUB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 pointer-events-auto">
        <button
          onClick={() => setRainHearts(!rainHearts)}
          className={`p-3.5 rounded-full shadow-xl border backdrop-blur-md transition-all duration-300 transform active:scale-90 ${rainHearts ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' : 'bg-neutral-950/40 border-white/10 text-neutral-400'}`}
          title="Gullar yomg'iri"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('music-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-3.5 rounded-full shadow-xl border bg-neutral-950/60 border-white/15 text-rose-400 hover:text-rose-300 transition-all ${isPlaying ? 'animate-spin' : ''}`}
          style={{ animationDuration: '10s' }}
          title="Musiqa asbobi"
        >
          <Music className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden Audio element inside document */}
      <audio 
        ref={audioRef} 
        src={SOUND_TRACKS[selectedTrack].url}
        loop
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
      />

      {/* SECTION A — LOADING SCREEN */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            id="loading-screen"
            className="fixed inset-0 bg-[#0a0408] z-50 flex flex-col items-center justify-center p-6"
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          >
            <div className="relative flex flex-col items-center max-w-xs text-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="mb-8 relative"
              >
                <Heart className="w-16 h-16 text-rose-500 filter drop-shadow-[0_0_20px_rgba(244,63,94,0.7)]" fill="#f43f5e" />
                <div className="absolute inset-0 w-16 h-16 rounded-full bg-rose-500/20 blur-md animate-ping" />
              </motion.div>

              <h2 className="text-sm tracking-[0.25em] uppercase font-mono text-rose-300 mb-2">
                Yurakdagi sirlar...
              </h2>
              <p className="text-xs text-neutral-400 font-light mb-6">
                Hozir siz uchun umuman g'ayrioddiy olam darvozasi ochiladi. Tayyormisiz?
              </p>

              {loadingProgress >= 100 ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.5 },
                    y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
                  }}
                  onClick={handleEnterSite}
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 hover:from-rose-500 hover:to-pink-600 font-sans font-semibold text-xs tracking-wider uppercase text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] cursor-pointer active:scale-95 transition-all mt-3 border border-rose-300/30 flex items-center gap-2 select-none"
                >
                  <span>Sehrli maktubni ochish 💌</span>
                </motion.button>
              ) : (
                <>
                  <div className="w-48 h-[2px] bg-neutral-900 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-600 rounded-full transition-all duration-150 ease-out shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Yuklanish jarayoni: {Math.min(loadingProgress, 100)}%
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION B — HERO FIRST MOMENT */}
      <section id="hero-section" className="min-h-screen relative flex flex-col justify-between items-center px-4 py-8 z-10">
        <div /> 

        <div className="text-center max-w-4xl mx-auto flex flex-col items-center gap-7 mt-12 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/5 text-rose-300 text-xs tracking-wider uppercase font-mono"
          >
            <Sparkle className="w-3.5 h-3.5 animate-spin text-rose-400" style={{ animationDuration: '5s' }} />
            <span>Chiroyli va samimiy o'yinlar bilan</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl sm:text-5.5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-white leading-[1.08] font-light"
          >
            Nozima, senga <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-rose-400 inline-block font-serif font-medium italic">chin qalbimdan</span> aytar gapim...
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-neutral-300 md:text-xl font-sans max-w-2xl mx-auto font-light leading-relaxed px-2"
          >
            Bu sen uchun maxsus tayyorlangan eng shirin va qiziqarli muloqot maktubidir. Bu sahifada sening tabassumingni uyg'otadigan o'yinlar, samimiy dil izhorlari va shirin orzular jamlangan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-6 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              id="hero-cta-btn"
              onClick={() => scrollTo('intro-section')}
              className="group relative px-9 py-4.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium text-sm tracking-wide shadow-[0_4px_30px_rgba(225,29,72,0.4)] hover:shadow-[0_4px_45px_rgba(225,29,72,0.6)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="flex items-center gap-2">
                Sehrni boshlash <span className="transition-transform group-hover:translate-y-1">💌</span>
              </span>
            </button>

            <button 
              onClick={() => scrollTo('interactive-section')}
              className="px-8 py-4.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-400/30 text-rose-300 text-sm font-medium transition-all"
            >
              <span>Guldasta & Sovg'alar 🎁</span>
            </button>
          </motion.div>
        </div>

        {/* Scroll action down */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7, y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          onClick={() => scrollTo('intro-section')}
          className="flex flex-col items-center gap-2 cursor-pointer pt-8 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">Pastga varaqlang</span>
          <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
        </motion.div>
      </section>

      {/* SECTION C — POETIC TEXT SECTION */}
      <section id="intro-section" className="py-24 px-4 max-w-6xl mx-auto relative z-10 scroll-mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-12 xl:col-span-5 relative">
            <span className="text-xs font-mono tracking-widest text-rose-400 uppercase block mb-3">— Sokin haqiqat</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-tight">
              Gohida jimlik so'zlardan baland...
            </h2>
            <div className="h-[2px] w-12 bg-rose-500/40 rounded-full my-6" />
            <p className="text-neutral-400 font-light leading-relaxed mb-6">
              Inson hayot yo'lida behisob chehralarni uchratadi. Lekin qaysidir sokin lahzada shunday bir siymo, shunday bir borliq paydo bo'ladiki, u senga umuman o'zgacha qit'ani, o'zgacha iliqlikni sovg'a qiladi.
            </p>
          </div>

          <div className="lg:col-span-12 xl:col-span-7">
            <div className="glass-panel rounded-3xl p-8 md:p-12 relative shadow-2xl overflow-hidden border border-rose-500/10">
              <span className="text-6xl font-serif text-rose-500/10 absolute top-4 left-4">“</span>
              
              <p className="text-neutral-200 text-lg md:text-xl font-serif italic leading-relaxed relative z-10 pt-4 px-2">
                Ba'zi insonlar hayotimizga jimjitlik bilan kirib kelishadi, lekin qalbimizda o'chmas va chiroyli iz qoldirishadi. Gohida kimnidir yoqtirib qolishni, uning haqida qayg'urishni rejalashtirmaysan — bu shunchaki o'z-o'zidan, juda mayin va chuqur sodir bo'ladi.
              </p>
              
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/5 relative z-10">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Hislar to'lqini</h4>
                  <p className="text-xs text-neutral-400">Hayotning samimiy va chiroyli tasodiflari</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION E - MAIN CONFESSION LETTER */}
      <section id="confession-section" className="py-12 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-10">
            <span className="text-xs font-mono tracking-widest text-rose-400 uppercase">Maktub</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mt-1">Dildan yozilgan iqror</h2>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mt-4 animate-bounce">
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
          </div>

          <div className="glass-panel-heavy rounded-3xl pt-16 pb-8 px-6 sm:p-10 md:p-14 shadow-2xl relative border border-rose-500/10">
            <div className="absolute top-5 right-5 sm:top-8 sm:right-8 border border-rose-500/20 rounded px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[9px] sm:text-[10px] uppercase text-rose-400/65 transform rotate-12 tracking-widest hover:rotate-0 transition-all select-none">
              Faqat Nozima Uchun
            </div>

            <div className="space-y-8 text-neutral-300 font-light leading-relaxed md:text-lg">
              <p>
                Nozima, senga ushbu satrlarni yozishni uzoq o‘yladim. Tuyg‘ulari, ichki kechinmalarini birovga izhor qilish har doim ham oson emas. Lekin baribir dildagi samimiy so'zlarning yashirin qolishini istamadim.
              </p>

              <p>
                Sening hayotim oldida paydo bo'lganing unga o'zgacha bir go'zal rang olib kirdi. Sening har bir tabassuming, yoqimli suhbatlashish tarzing va g'oyat go'zal tabiating meni o'ziga maftun etdi. Hech esingdami? Sening samimiy nigohing va har qanday vaziyatda iliq so‘z topa olishing meni hayratlantirgan. Sening borliging atrofga shunday sokin, ammo nihoyatda yoqimli energiya ulashadiki, uni his qilgan inson yana va yana yoningda bo'lishni xohlaydi.
              </p>

              <p>
                Bu sahifa orqali men senga turmush qurish yoki juda katta va'dalar berish niyatida emasman. Bu maktub bir tomonlama ortiqcha bosim o'tkazishi ham keraksiz. Men shunchaki senga bo'lgan hurmatimni, eng nozik va samimiy tuyg'ularimni o'g'irlab qolmay, borligicha senga taqdim qilgim keldi. Sensiz o'tgan kunlarim qanchalik oddiy bo'lsa, sen bilan o'tadigan sanoqli daqiqalar ham men uchun shunchalik qadrli.
              </p>

              <p>
                Men sening qalbingni yanada chuqurroq, chiroyliroq tanishni, samimiy dunyongning bir parchasi bo'lishni juda xohlayman. Agar senga ham bu yoqimli bo‘lsa, kel, birgalikda chiroyli suhbatlarimizni davom ettiramiz.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-end">
              <span className="text-xs font-mono text-neutral-500">Samimiyat va hurmat ila</span>
              <span className="text-xl font-serif text-rose-300 font-medium italic mt-1 pr-1">Muhiddin</span>
            </div>
          </div>

        </div>
      </section>

      {/* NEW AMAZING INTERACTIVE SECTION SHE WILL ABSOLUTELY LOVE */}
      <section id="interactive-section" className="py-24 px-4 bg-gradient-to-b from-transparent via-rose-950/5 to-transparent relative z-10 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-xs font-mono tracking-widest text-rose-400 uppercase">Interactive Love Mission</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mt-2">Bu yerda zerikish taqiqlanadi!</h2>
            <p className="text-neutral-400 max-w-xl mx-auto font-light mt-3 text-sm">
              Sening qalbingga yo'l ochuvchi bir nechta interaktiv va g'ayrioddiy mitti o'yinlar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* GAME 1: CUSTOM FLOWER BOUQUET BUILDER */}
            <div className="lg:col-span-7 glass-panel rounded-[2rem] p-8 hover:border-rose-500/20 transition-all duration-300 relative flex flex-col justify-between shadow-2xl border border-white/5 min-h-[480px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[70px] pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-rose-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5 text-rose-400 animate-spin" /> Virtual Guldasta Yaratish
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    Sirlar: {myBouquet.length}/8 ta gul
                  </span>
                </div>

                <h3 className="text-2xl font-serif text-white mb-2">Menga atalgan guldasta tuzing</h3>
                <p className="text-neutral-400 text-xs font-light leading-relaxed mb-6">
                  Quyidagi har xil gullarni tanlash va tugmalarni bosish orqali guldastani to'ldiring. Har bir gul senga bo'lgan maxsus dildagi gaplarimni ochib beradi...
                </p>

                {/* Flowers Selector list */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {flowersList.map((flower) => (
                    <button
                      key={flower.id}
                      onClick={() => addFlowerToBouquet(flower)}
                      disabled={isBouquetClaimed || myBouquet.length >= 8}
                      className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/5 active:scale-95 text-xs transition-all disabled:opacity-50 flex items-center gap-2 text-neutral-200"
                    >
                      <span className="text-lg">{flower.icon}</span>
                      <span>{flower.name}</span>
                    </button>
                  ))}
                </div>

                {/* Bouquet / Vase Visualization inside glass frame */}
                <div className="p-6 rounded-2xl bg-black/35 border border-white/5 min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden">
                  
                  {myBouquet.length === 0 ? (
                    <div className="text-center text-neutral-500 space-y-2 py-6">
                      <Plus className="w-8 h-8 text-neutral-600 mx-auto animate-pulse" />
                      <p className="text-xs font-mono tracking-wide uppercase">Guldasta bo'sh. Gullarni qo'shing!</p>
                    </div>
                  ) : (
                    <div className="w-full">
                      {/* Flowers display container */}
                      <div className="flex flex-wrap justify-center gap-4 mb-4 relative z-10">
                        <AnimatePresence>
                          {myBouquet.map((f, i) => (
                            <motion.div
                              key={f.id}
                              initial={{ opacity: 0, scale: 0.5, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col items-center bg-white/5 p-3 rounded-xl border border-white/5 min-w-[100px] text-center"
                              title={f.meaningUz}
                            >
                              <span className="text-2xl mb-1.5 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                                {f.icon}
                              </span>
                              <span className="text-[10px] text-rose-300 font-mono font-semibold block uppercase">
                                {f.name}
                              </span>
                              <p className="text-[9px] text-neutral-400 mt-1 line-clamp-2 md:line-clamp-3 leading-normal max-w-[120px]">
                                {f.meaningUz}
                              </p>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Dynamic Vase representation */}
                      <div className="w-24 h-12 bg-gradient-to-tr from-rose-500/20 to-pink-500/20 rounded-b-2xl border-x border-b border-rose-400/40 mx-auto relative mt-2 flex items-center justify-center">
                        <div className="absolute top-0 w-24 h-[2px] bg-white/30" />
                        <span className="text-[9px] font-mono tracking-widest text-rose-300/80 uppercase">Sehrli Ko'za</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Bouquet Claim logic */}
              <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                {myBouquet.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearBouquet}
                      className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                    >
                      Butunlay Tozalash 🗑️
                    </button>
                    {!isBouquetClaimed && (
                      <button
                        onClick={handleClaimBouquet}
                        className="px-5 py-2.5 rounded-full bg-rose-600/30 border border-rose-500/50 hover:bg-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition-all"
                      >
                        Guldastani qabul qilish 💐
                      </button>
                    )}
                  </div>
                ) : <div />}
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Iliq tuyg'ular tili</span>
              </div>

              {/* Secret pop modal inside builder once bouquet is accepted */}
              <AnimatePresence>
                {isBouquetClaimed && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#0d070b]/98 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center z-20 border border-rose-500/20"
                  >
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                      <HeartHandshake className="w-8 h-8 text-rose-400 animate-pulse" />
                    </div>
                    <h4 className="text-xl font-serif text-white mb-2">Guldastangiz tayyor va qabul qilindi! 😍</h4>
                    <p className="text-neutral-300 font-light text-sm max-w-md leading-relaxed mb-6">
                      Siz tushunib yetgan ushbu go'zal guldasta tuyg'ularimizning samimiyatini ifodalaydi. Biror kun uni senga real hayotda taqdim qilishdan cheksiz xursand bo'laman 🌹
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsBouquetClaimed(false)}
                        className="px-4 py-2 border border-white/10 rounded-lg text-xs hover:bg-white/5 transition-all text-neutral-400"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => {
                          scrollTo('question-section');
                        }}
                        className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-all shadow-md"
                      >
                        Sohilda muloqot qilish 💖
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* GAME 2: THE DIGITAL GIFTS / VALUE OFFER COUPON FLIPS */}
            <div className="lg:col-span-5 flex flex-col gap-6 items-stretch">
              {coupons.map((coupon) => (
                <div 
                  key={coupon.id}
                  className={`glass-panel rounded-3xl p-6 relative border border-white/5 shadow-lg overflow-hidden transition-all duration-300 flex flex-col justify-between ${coupon.claimed ? 'bg-gradient-to-tr from-emerald-950/15 via-transparent to-transparent border-emerald-500/20' : 'hover:border-rose-500/20'}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                        {coupon.claimed ? "Faollashtirilgan ✅" : "Raqamli Kupon"}
                      </span>
                      <Award className={`w-4 h-4 ${coupon.claimed ? 'text-emerald-400 animate-bounce' : 'text-rose-400'}`} />
                    </div>

                    <h4 className="text-lg font-serif text-white mb-1.5">{coupon.title}</h4>
                    <p className="text-neutral-400 text-xs font-light leading-relaxed">
                      {coupon.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-500">Amal qilish muddati: umrbod</span>
                    <button
                      onClick={() => claimCoupon(coupon.id)}
                      disabled={coupon.claimed}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${coupon.claimed ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95'}`}
                    >
                      {coupon.claimed ? "Hujjatlandi 📋" : "Kuponni olish 💌"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* COMPLIMENT DECK CARDS (Swipe compliment text) */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          
          <div className="inline-flex p-3 rounded-full bg-rose-500/10 mb-4 border border-rose-500/20 animate-pulse">
            <Heart className="w-6 h-6 text-rose-400" />
          </div>

          <h3 className="text-2xl md:text-4xl font-serif text-white tracking-tight">Sening ajoyib qirralaring...</h3>
          <p className="text-neutral-400 text-sm font-light mt-2 max-w-md mx-auto">
            Senga buni har doim ham dildan to'lib ayta olmasligim mumkin. Shuning uchun bu yerga samimiy tasvirlarni sarlavha qilib qo'ydim:
          </p>

          <div className="mt-8 relative h-48 md:h-44 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeComplimentIdx}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
                transition={{ duration: 0.3 }}
                className="glass-panel rounded-2xl p-6.5 max-w-lg w-full shadow-xl border border-rose-500/10 relative"
              >
                <div className="text-3xl mb-3">{compliments[activeComplimentIdx].icon}</div>
                <p className="text-neutral-200 text-base md:text-lg font-serif italic italic-text leading-relaxed">
                  “{compliments[activeComplimentIdx].text}”
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            {compliments.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveComplimentIdx(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all ${idx === activeComplimentIdx ? 'bg-rose-500 scale-125' : 'bg-neutral-800'}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* FLYING ENVELOPE RESPONSE LETTER AREA */}
      <section id="response-letter-section" className="py-16 px-4 max-w-4xl mx-auto relative z-10">
        <div className="glass-panel rounded-[2rem] p-8 md:p-12 border border-rose-500/15 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[80px]" />
          
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-mono text-rose-400 uppercase tracking-widest block text-center mb-1">Maktub yozuvchi samoviy darcha</span>
            <h3 className="text-2xl md:text-3xl font-serif text-white tracking-tight text-center mb-6">O'z orzuingiz yoki javobingizni yo'llang</h3>
            
            <p className="text-neutral-400 text-sm font-light leading-relaxed text-center mb-8 max-w-lg mx-auto">
              Agar xohlasangiz, ushbu sahifada o'z yuragingizdagi orzu, fikr yoki menga bo'lgan sirli javobingizni yozib quyishingiz mumkin. Bu maktub koinot bag'riga uchiriladi va sahifangizda qadrli xotira bo'lib qoladi.
            </p>

            <form onSubmit={handleSendLetter} className="space-y-4">
              <div className="relative">
                <textarea 
                  value={writtenMessage}
                  onChange={(e) => setWrittenMessage(e.target.value)}
                  placeholder="Yuragingizdagi eng chiroyli gaplar yoki maktubni shu yerda yozib uchiring... 📝"
                  className="w-full h-32 rounded-2xl bg-neutral-950/50 border border-white/10 hover:border-rose-500/30 focus:border-rose-500/60 p-4 focus:outline-none focus:ring-0 text-white font-light text-sm tracking-wide transition-all placeholder-neutral-500"
                  maxLength={500}
                />
                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-neutral-500">
                  {writtenMessage.length}/500 simvol
                </span>
              </div>

              <div className="flex justify-center">
                <button 
                  type="submit"
                  disabled={isSendingLetter || !writtenMessage.trim()}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-rose-500/25 transition-all flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSendingLetter ? (
                    <>Maktub buklanmoqda...</>
                  ) : (
                    <>Maktubni uchirish <Send className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            </form>

            <AnimatePresence>
              {letterFlyAway && (
                <motion.div 
                  initial={{ opacity: 0, x: -50, y: 50, scale: 0.5, rotate: -25 }}
                  animate={{ opacity: [0, 1, 1, 0], x: 300, y: -300, scale: [0.5, 1, 1, 0.2], rotate: -45 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                  className="absolute left-1/4 top-1/2 text-4xl pointer-events-none z-30"
                >
                  🚀💨 <span className="text-xl">✈️</span>
                </motion.div>
              )}
            </AnimatePresence>

            {sentLettersList.length > 0 && (
              <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-neutral-400">Yuborilgan orzu maktublari ({sentLettersList.length})</span>
                  <button 
                    onClick={clearLetters}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Maktublarni tozalash 🗑️
                  </button>
                </div>
                
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {sentLettersList.map((letter, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-300 leading-relaxed font-light font-mono flex items-start gap-2.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                      <div>
                        <p>{letter}</p>
                        <span className="text-[9px] text-neutral-500 mt-1 block font-light font-sans">Samoviy darchaga uchirildi • Hozirgina</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* SECTION F — PICTURE MEMORIES / GALLERY SECTION */}
      <section id="gallery-section" className="py-24 px-4 bg-black/25 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-xs font-mono tracking-widest text-rose-400 uppercase">Tasavvur lahzalari</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mt-1">Kelajakdagi xotiralarimiz suratlari</h2>
            <p className="text-neutral-400 max-w-xl mx-auto font-light mt-3 text-sm">
              Tasavvurim va orzularimdagi uchrashuvlarimiz, bir lahza bo'lsa ham dunyodan uzoqlashgan sokin kunlarimiz... Kattalashtirish uchun bosing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryItems.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setActiveImage(item.img);
                  setActiveImageTitle(item.title);
                }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg aspect-[3/2] border border-white/5"
              >
                <img 
                  src={item.img} 
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d070b] via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-all duration-300" />
                
                <div className="absolute bottom-0 left-0 p-5 w-full flex flex-col justify-end">
                  <span className="text-[10px] font-mono tracking-wider text-rose-400 uppercase mb-1">Inspiratsiya #{idx+1}</span>
                  <h4 className="text-base font-serif text-white font-medium flex items-center justify-between">
                    {item.title}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-rose-300">kattalashtirish +</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION G — MUSIC AUDIO SETTINGS COMPONENT */}
      <section id="music-section" className="py-20 px-4 max-w-4xl mx-auto relative z-10">
        <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-xl border border-rose-500/15 relative overflow-hidden">
          
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 flex items-center justify-around pointer-events-none px-6">
            {[1, 2, 3, 4, 5, 2, 4, 3, 5, 2, 1].map((val, i) => (
              <div 
                key={i} 
                className="w-[3px] bg-rose-500 rounded-full"
                style={{
                  height: `${val * 16}px`,
                  animation: isPlaying ? `pulse 1.${i}s infinite ease-in-out` : 'none'
                }}
              />
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 relative ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '12s' }}>
              <Music className="w-8 h-8" />
              {isPlaying && (
                <div className="absolute inset-0 rounded-full border border-white/30 animate-ping" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-mono tracking-widest text-rose-400 uppercase">Sevimli Ohanglarimiz</span>
              <h3 className="text-2xl font-serif text-white mt-1">Retro & Akustik Pleyer</h3>
              <p className="text-neutral-400 font-light mt-2 text-sm leading-relaxed max-w-lg">
                Fikr va hislaringiz bilan birga tinglashingiz uchun maxsus 3 xil sokin ohang tayyorladim. Siz o'zingizga yoqqanini pleyerdan bemalol tanlashingiz mumkin:
              </p>

              {/* Tracks Selector buttons layout */}
              <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
                {SOUND_TRACKS.map((track, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedTrack(i);
                      setIsPlaying(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${i === selectedTrack ? 'bg-rose-600 border-rose-500 text-white font-semibold' : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'}`}
                  >
                    {track.title}
                  </button>
                ))}
              </div>

              {/* Progress and core controls */}
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-400">{formatTime(currentTime)}</span>
                  <input 
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="flex-1 h-1 bg-neutral-900 rounded-full appearance-none cursor-pointer accent-rose-500"
                  />
                  <span className="text-xs font-mono text-neutral-400">{formatTime(duration)}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <button 
                      onClick={togglePlayPause}
                      className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs tracking-wider uppercase transition-colors flex items-center gap-2 shadow-md hover:shadow-rose-500/20"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-white" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" /> Play
                        </>
                      )}
                    </button>

                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2.5 rounded-full border border-white/10 hover:bg-white/5 text-neutral-300 transition-colors"
                      title="Mute / Unmute"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Volume Slider controller */}
                  <div className="flex items-center gap-2 justify-center">
                    <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(Number(e.target.value))}
                      className="w-20 h-1 bg-neutral-900 rounded-full appearance-none accent-rose-400"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION H — FINAL QUESTION IMPOSSIBLE-TO-DECLINE QUEST */}
      <section id="question-section" className="py-28 px-4 max-w-4xl mx-auto text-center relative z-10 scroll-mt-24">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-rose-950/15 rounded-full blur-[110px] pointer-events-none" />

        <div className="glass-panel-heavy rounded-[2.5rem] p-10 md:p-16 shadow-2xl relative border border-rose-500/15 overflow-visible">
          
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-xl shadow-rose-600/35">
            <Heart className="w-8 h-8 fill-rose-100 text-rose-500" />
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mt-4">
            Senga bir samimiy savolim bor...
          </h2>
          
          <p className="text-neutral-300 font-light text-base md:text-lg max-w-xl mx-auto mt-6 leading-relaxed">
            Mening samimiy maktubim, orzular va virtual mitti sarguzashtlarimiz senga kichik bo'lsa ham tabassum tuhfa qildi deb umid qilaman. Biz bir-birimizni yaxshiroq tanish uchun muloqotimizni davom ettiramizmi?
          </p>

          {/* Interactive Escaping dialog feedback bubble */}
          <div className="h-6 mt-6">
            <span className="text-xs font-mono text-rose-300 bg-rose-500/10 rounded-full px-4 py-1.5 animate-pulse inline-block">
              {customPrankMessage}
            </span>
          </div>

          {/* DUAL GAMEPLAY SELECTION */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 relative min-h-[160px] px-6">
            
            {/* BUTTON 1: THE YES BUTTON */}
            <motion.button 
              id="yes-btn"
              onClick={handleYesCelebration}
              style={{ minWidth: '170px' }}
              className="relative px-10 py-5 rounded-full bg-gradient-to-r from-emerald-500 via-rose-600 to-rose-600 text-white font-semibold text-lg tracking-wide shadow-2xl active:scale-[0.96] transition-all duration-300 ease-out z-30"
            >
              Ha, albatta! 💖
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
            </motion.button>

            {/* BUTTON 2: THE FUN ESCAPING BUTTON */}
            <div className="relative inline-block transition-transform duration-300 ease-out z-10" style={{ transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)` }}>
              <button 
                id="no-escaping-btn"
                onMouseEnter={handlePrankEscape}
                onMouseMove={handlePrankEscape}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handlePrankEscape();
                }}
                className="px-8 py-4.5 rounded-full bg-neutral-900 border border-white/10 hover:border-rose-500/40 text-neutral-400 font-light text-sm tracking-wide transition-all duration-150 cursor-pointer shadow-md select-none touch-none"
                style={{ whitespace: 'nowrap', userSelect: 'none' }}
              >
                O‘ylab ko‘raman 😊
              </button>
            </div>

          </div>

          <div className="mt-4 text-[10px] text-neutral-500 font-mono">
            * O'ylab ko'rishga urinib ko'ring, har bir harakat kutilmagan javob qaytaradi!
          </div>

        </div>
      </section>

      {/* MASSIVE CELEBRATION SHOWER FLOATING ACCROSS SCREEN */}
      {celebrate && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {celebrationHearts.map((part) => (
            <motion.div
              key={part.id}
              initial={{ 
                x: `${part.x}vw`, 
                y: '100vh', 
                scale: 0.1, 
                opacity: 0, 
                rotate: part.rotation 
              }}
              animate={{ 
                y: '-20vh', 
                x: `${part.x + part.drift}vw`,
                scale: 1.1, 
                opacity: [0, 0.9, 0.9, 0], 
                rotate: part.rotation + 360
              }}
              transition={{ 
                duration: part.duration, 
                delay: part.delay,
                ease: "easeOut"
              }}
              className="absolute text-3xl select-none"
              style={{ color: part.color }}
            >
              ❤️
            </motion.div>
          ))}
        </div>
      )}

      {/* CONFIRMATION ROMANTIC MODAL DIALOG ONCE "HA" CLICKED */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div 
              initial={{ scale: 0.91, opacity: 0, y: 35 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.91, opacity: 0, y: 35 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="glass-panel-heavy rounded-[2rem] p-8 md:p-12 max-w-lg w-full text-center relative z-10 border border-rose-500/30 shadow-[0_10px_60px_rgba(244,63,94,0.4)]"
            >
              
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
                <HeartHandshake className="w-8 h-8 text-rose-400 animate-bounce" />
              </div>

              <h3 className="text-3xl md:text-4xl font-serif text-white tracking-tight">
                Bu meni juda xursand qildi ❤️
              </h3>

              <div className="h-[2px] w-16 bg-rose-500/30 mx-auto my-6" />

              <p className="text-neutral-300 font-light text-base leading-relaxed">
                Rahmat... bu ijobiy javobing menga cheksiz hayotbaxsh kuch va samimiy quvonch tuhfa etdi. Sening bu qaroring men uchun nihoyatda qadrlidir 💖
              </p>

              <p className="text-rose-300 text-sm italic font-serif mt-5">
                “Yuragimda senga atalgan gaplarni baham ko'rish va endi sen bilan ko‘proq suhbatlashish uchun juda chiroyli bahonam bor :)”
              </p>

              <button 
                onClick={() => setShowModal(false)}
                className="mt-8 px-6 py-3 rounded-full bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-rose-300 font-medium text-xs tracking-wider uppercase transition-all duration-300 hover:scale-[1.02]"
              >
                Maktubni yopish 💌
              </button>

              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMAGES VIEW LIGHTBOX */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveImage(null);
                setActiveImageTitle(null);
              }}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full z-10 flex flex-col gap-4"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[75vh]">
                <img 
                  src={activeImage} 
                  alt={activeImageTitle || "Memory"} 
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                />
              </div>

              <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/15">
                <div>
                  <h4 className="text-lg font-serif text-white">{activeImageTitle || "Xotiramiz parchalari"}</h4>
                  <p className="text-xs text-neutral-400 mt-1 font-light">Tuyg'ular bilan ishlangan haqiqiy san'at asari.</p>
                </div>

                <button 
                  onClick={() => {
                    setActiveImage(null);
                    setActiveImageTitle(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs transition-all"
                >
                  Yopish
                </button>
              </div>

              <button 
                onClick={() => {
                  setActiveImage(null);
                  setActiveImageTitle(null);
                }}
                className="absolute -top-12 right-0 bg-white/5 hover:bg-white/10 border border-white/10 text-white p-2 rounded-full transition-colors font-mono text-xs flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Yopish
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER TERMINATION */}
      <footer className="py-20 px-4 max-w-4xl mx-auto text-center border-t border-white/5 relative z-10">
        
        <div className="inline-flex p-3 rounded-full bg-rose-500/5 mb-6 border border-rose-500/10">
          <Heart className="w-5 h-5 text-rose-500" fill="#f43f5e" />
        </div>

        <p className="text-neutral-400 font-serif italic text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          “Bu sahifa shunchaki sovuq kodlardan iborat emas. Bu yerga samimiy tuyg'ular, kichik bir jur’at va bir olam iliqlik joylangan.”
        </p>

        <h4 className="text-rose-300 font-serif font-medium tracking-wide text-lg mt-6">
          — Yurakdan.
        </h4>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent w-40 mx-auto mt-8 rounded-full" />

        <p className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase mt-6">
          Samimiy Rishta • Quyosh va Oy simfoniyasi • {new Date().getFullYear()}
        </p>
      </footer>

    </div>
  );
}
