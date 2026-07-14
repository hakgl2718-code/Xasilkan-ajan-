import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Code, RotateCw, MonitorPlay, Bot, Maximize, X, User as UserIcon, LogOut, MessageSquare, Download, Menu, PanelLeft, Trash2, Settings, Globe, Copy, ExternalLink, Check, Play, Lightbulb, Palette, Bug, Sparkles, Compass, Mic, MicOff, Volume2, VolumeX, Languages, FileVideo, UploadCloud, Loader2, Key, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { signUpWithEmail, signInWithEmail, logout, db, type CustomUser, updateUserProfile } from './lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, orderBy, getDoc, deleteDoc } from 'firebase/firestore';

const safeLocalStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

const getApiUrl = (path: string) => {
  return path;
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

const LOGO_COLORS = [
  { text: 'text-indigo-400', border: 'border-indigo-500/50 border-t-indigo-400 border-r-indigo-400', label: 'İndigo', hex: '#6366f1', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.35)] bg-indigo-500/10' },
  { text: 'text-emerald-400', border: 'border-emerald-500/50 border-t-emerald-400 border-r-emerald-400', label: 'Yeşil', hex: '#10b981', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)] bg-emerald-500/10' },
  { text: 'text-rose-400', border: 'border-rose-500/50 border-t-rose-400 border-r-rose-400', label: 'Kırmızı', hex: '#f43f5e', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)] bg-rose-500/10' },
  { text: 'text-amber-400', border: 'border-amber-500/50 border-t-amber-400 border-r-amber-400', label: 'Turuncu', hex: '#f59e0b', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)] bg-rose-500/10' },
  { text: 'text-purple-400', border: 'border-purple-500/50 border-t-purple-400 border-r-purple-400', label: 'Mor', hex: '#a855f7', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.35)] bg-purple-500/10' }
];

const XasilWolfLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Kulaklar */}
      {/* Sol Kulak Dış */}
      <polygon points="25,5 38,30 15,35" fill="currentColor" fillOpacity="0.1" />
      {/* Sol Kulak İç */}
      <polygon points="25,5 38,30 28,24" fill="currentColor" fillOpacity="0.25" />
      
      {/* Sağ Kulak Dış */}
      <polygon points="75,5 62,30 85,35" fill="currentColor" fillOpacity="0.1" />
      {/* Sağ Kulak İç */}
      <polygon points="75,5 62,30 72,24" fill="currentColor" fillOpacity="0.25" />

      {/* Alın & Merkez Köprü */}
      <polygon points="50,28 38,30 50,42" fill="currentColor" fillOpacity="0.15" />
      <polygon points="50,28 62,30 50,42" fill="currentColor" fillOpacity="0.15" />
      
      {/* Gözler / Burun Köprüsü Altıgeni */}
      <polygon points="50,42 42,58 50,78 58,58" fill="currentColor" fillOpacity="0.2" />

      {/* Dış Yanaklar */}
      <polygon points="15,35 38,30 42,58 10,50" fill="currentColor" fillOpacity="0.08" />
      <polygon points="85,35 62,30 58,58 90,50" fill="currentColor" fillOpacity="0.08" />

      {/* Yanak altı fasetleri */}
      <polygon points="10,50 42,58 35,74" fill="currentColor" fillOpacity="0.12" />
      <polygon points="90,50 58,58 65,74" fill="currentColor" fillOpacity="0.12" />

      {/* Ağız Kenarı Facets */}
      <polygon points="42,58 50,78 42,88 35,74" fill="currentColor" fillOpacity="0.18" />
      <polygon points="58,58 50,78 58,88 65,74" fill="currentColor" fillOpacity="0.18" />

      {/* Burun Ucu */}
      <polygon points="50,78 42,88 50,95 58,88" fill="currentColor" fillOpacity="0.35" />

      {/* Agresif / Keskin Kurt Gözleri (Bozkurt) */}
      <polygon points="34,48 41,46 38,51" fill="currentColor" className="text-amber-400 drop-shadow-[0_0_2px_rgba(245,158,11,0.8)]" />
      <polygon points="66,48 59,46 62,51" fill="currentColor" className="text-amber-400 drop-shadow-[0_0_2px_rgba(245,158,11,0.8)]" />

      {/* Geometrik Bağlantı Çizgileri */}
      <line x1="50" y1="28" x2="50" y2="42" />
      <line x1="50" y1="42" x2="50" y2="78" />
      <line x1="50" y1="78" x2="50" y2="95" />
      <line x1="38" y1="30" x2="42" y2="58" />
      <line x1="62" y1="30" x2="58" y2="58" />
      <line x1="42" y1="58" x2="58" y2="58" />
    </svg>
  );
};

const PRESET_IDEAS = [
  {
    id: 'pomodoro',
    title: 'Pomodoro Verimlilik Takipçisi',
    description: 'Ses efektleri, dinamik dairesel ilerleme halkası, özel odak/mola süreleri ve çalışma geçmişini tutan gelişmiş bir arayüz.',
    iconName: 'Play',
    prompt: 'Kullanıcının odaklanmasını kolaylaştıracak, ses efektleri (alarm, tıkırtı vb.) içeren, özel çalışma/mola sürelerinin ayarlanabildiği, şık bir dairesel ilerleme dairesi barındıran, ve tamamlanan seansların listesini local tarihçede tutan gelişmiş bir Pomodoro Sayacı web uygulaması hazırla. Modern, koyu slate temalı olsun.',
    category: 'Verimlilik'
  },
  {
    id: 'space_invaders',
    title: 'Retro Space Invaders Oyunu',
    description: 'HTML Canvas ile yazılmış, klavye/dokunmatik kontrollü, ses efektleri olan, can barı ve yüksek skor kaydetme özellikli atari oyunu.',
    iconName: 'Sparkles',
    prompt: 'HTML Canvas kullanarak eğlenceli ve akıcı bir Retro Uzay Savaşı (Space Invaders tarzı) oyunu yaz. Oyunda oyuncunun gemisi hareket edebilsin, ateş edebilsin, farklı dalgalarda gelen düşman gemileri olsun, can ve skor tablosu bulunsun. En yüksek skoru localStorage ile kaydet. Ayrıca mobil cihazlar için ekran üzeri yön ve ateş butonları ekle. Ses efektleri üretmek için Web Audio API kullan.',
    category: 'Oyun'
  },
  {
    id: 'bento_portfolio',
    title: 'Bento Grid Tasarımlı Portfolyo',
    description: 'Son trend bento kutusu düzeninde, etkileşimli kartlar, yetenek barları, iletişim formu ve şık karanlık/aydınlık geçişli kişisel site.',
    iconName: 'Compass',
    prompt: 'Son derece prestijli, modern ve göz alıcı bir "Bento Grid" düzeninde Kişisel Portfolyo web sitesi oluştur. Kartların üzerine gelindiğinde derinlik ve ışık efektleri (glassmorphism/glow) olsun. Hakkımda, Yeteneklerim (yüzdelik barlar ve logolarla), Projelerim (filtreleme yapılabilir kartlar), Çalışma Deneyimim ve Çalışan bir İletişim Formu (gönderildiğinde başarı mesajı veren) barındırsın. Akıcı animasyonlar içersin.',
    category: 'Tasarım'
  },
  {
    id: 'budget_tracker',
    title: 'Akıllı Gelir-Gider Analiz Paneli',
    description: 'Gelir ve gider ekleme, kategori bazlı bütçe yönetimi, pasta grafikleri ile bütçe dağılım analizi sunan finans asistanı.',
    iconName: 'Lightbulb',
    prompt: 'Kişisel bütçe yönetimi için harika bir Gelir-Gider Takip ve Analiz uygulaması geliştir. Kullanıcı gelir ve gider kalemlerini kategori, miktar, tarih ve açıklama ile ekleyebilsin. Seçilen aya göre filtreleme yapabilsin. Toplam gelir, toplam gider ve kalan net bütçe kartları olsun. Giderlerin kategorilere göre dağılımını gösteren etkileşimli SVG pasta veya çubuk grafikleri çiz. Verileri tarayıcı hafızasında sakla.',
    category: 'Finans'
  }
];

const THEME_RECOMMENDATIONS = [
  { id: 'midnight', name: 'Gece Yarısı', desc: 'Midnight Indigo', colors: 'from-indigo-950 to-slate-950 border-indigo-500/20', hover: 'hover:border-indigo-500/50 hover:bg-indigo-500/5', prompt: 'Modern, koyu lacivert (Midnight Blue) ve indigo tonlarında, neon mor ışıklı detayları olan şık bir tema kullan.' },
  { id: 'emerald', name: 'Zümrüt Yeşili', desc: 'Emerald Retro', colors: 'from-emerald-950 to-black border-emerald-500/20', hover: 'hover:border-emerald-500/50 hover:bg-emerald-500/5', prompt: 'Gözü yormayan derin zümrüt yeşili tonlarında, retro terminal havası veren yeşil kod teması kullan.' },
  { id: 'rose', name: 'Gül Kurusu', desc: 'Cyberpunk Rose', colors: 'from-rose-950 to-neutral-950 border-rose-500/20', hover: 'hover:border-rose-500/50 hover:bg-rose-500/5', prompt: 'Koyu pembe, gül kurusu ve neon fuşya detaylarla bezeli cyberpunk esintili bir tema kullan.' },
  { id: 'sunset', name: 'Siber Kehribar', desc: 'Sunset Cyber', colors: 'from-amber-950 to-neutral-950 border-amber-500/20', hover: 'hover:border-amber-500/50 hover:bg-amber-500/5', prompt: 'Derin kehribar ve turuncu (Amber/Sunset) tonlarında, neon sarı/turuncu çizgileri olan sıcak bir tema kullan.' }
];

const getIconComponent = (name: string) => {
  switch (name) {
    case 'Play': return Play;
    case 'Sparkles': return Sparkles;
    case 'Compass': return Compass;
    case 'Lightbulb': return Lightbulb;
    default: return Code;
  }
};

const injectConsoleCapture = (code: string) => {
  if (!code) return code;
  const scriptToInject = `
    <script>
      (function() {
        const _log = console.log;
        const _error = console.error;
        const _warn = console.warn;
        const _info = console.info;

        function sendLog(type, args) {
          try {
            const message = args.map(arg => {
              if (typeof arg === 'object') {
                try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
              }
              return String(arg);
            }).join(' ');
            window.parent.postMessage({ type: 'IFRAME_CONSOLE', logType: type, message: message }, '*');
          } catch(e) {
            _error("Console postMessage failed", e);
          }
        }

        console.log = function(...args) {
          _log.apply(console, args);
          sendLog('log', args);
        };
        console.error = function(...args) {
          _error.apply(console, args);
          sendLog('error', args);
        };
        console.warn = function(...args) {
          _warn.apply(console, args);
          sendLog('warn', args);
        };
        console.info = function(...args) {
          _info.apply(console, args);
          sendLog('info', args);
        };

        window.addEventListener('error', function(event) {
          sendLog('error', [event.message + ' at line ' + event.lineno]);
        });
      })();
    </script>
  `;
  
  if (code.includes('<head>')) {
    return code.replace('<head>', '<head>' + scriptToInject);
  } else if (code.includes('<body>')) {
    return code.replace('<body>', '<body>' + scriptToInject);
  } else {
    return scriptToInject + code;
  }
};

export default function App() {
  const [prompt, setPrompt] = useState('');
  
  const [activeModel, setActiveModel] = useState<'coding' | 'chat' | 'image' | 'dubbing'>('coding');

  const [messagesBerrak, setMessagesBerrak] = useState<Array<{role: 'user'|'assistant', content: string}>>(() => {
    const stored = safeLocalStorage.getItem('messages_berrak');
    return stored ? JSON.parse(stored) : [];
  });

  const [messagesToprak, setMessagesToprak] = useState<Array<{role: 'user'|'assistant', content: string, imageUrl?: string, styleUsed?: string, enrichedPrompt?: string}>>(() => {
    const stored = safeLocalStorage.getItem('messages_toprak');
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedImageStyle, setSelectedImageStyle] = useState<string>('Sinematik');
  const [isGeneratingBerrak, setIsGeneratingBerrak] = useState(false);
  const [isGeneratingToprak, setIsGeneratingToprak] = useState(false);
  const [berrakThinkingText, setBerrakThinkingText] = useState('Berrak düşünüyor...');

  useEffect(() => {
    safeLocalStorage.setItem('messages_berrak', JSON.stringify(messagesBerrak));
  }, [messagesBerrak]);

  useEffect(() => {
    safeLocalStorage.setItem('messages_toprak', JSON.stringify(messagesToprak));
  }, [messagesToprak]);

  // --- YAPAY ZEKA DESTEKLİ VİDEO ÇEVİRİ VE DUBLAJ SİSTEMİ STATES ---
  const [dubbingFile, setDubbingFile] = useState<File | null>(null);
  const [dubbingFileBase64, setDubbingFileBase64] = useState<string | null>(null);
  const [dubbingTargetLang, setDubbingTargetLang] = useState<string>('tr');
  const [dubbingStep, setDubbingStep] = useState<'idle' | 'transcribing' | 'translating' | 'synthesizing' | 'completed' | 'error'>('idle');
  const [dubbingProgress, setDubbingProgress] = useState<number>(0);
  const [dubbingTranscript, setDubbingTranscript] = useState<string>('');
  const [dubbingTranslation, setDubbingTranslation] = useState<string>('');
  const [dubbingResultAudio, setDubbingResultAudio] = useState<string>('');
  const [dubbingError, setDubbingError] = useState<string>('');
  const [speakerReferenceUrl, setSpeakerReferenceUrl] = useState<string | null>(null);
  const [isDubbingDragActive, setIsDubbingDragActive] = useState<boolean>(false);

  const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null);

  const [isKeyDrawerOpen, setIsKeyDrawerOpen] = useState(false);
  const [tempReplicateToken, setTempReplicateToken] = useState(() => safeLocalStorage.getItem('replicate_api_token') || '');
  const [tempGroqKey, setTempGroqKey] = useState(() => safeLocalStorage.getItem('groq_api_key') || '');
  const [keysSavedStatus, setKeysSavedStatus] = useState(false);

  const [isTrainingDrawerOpen, setIsTrainingDrawerOpen] = useState(false);
  const [tempTrainingInstruction, setTempTrainingInstruction] = useState(() => safeLocalStorage.getItem('user_training_instruction') || '');
  const [trainingSavedStatus, setTrainingSavedStatus] = useState(false);

  const handleSaveKeys = () => {
    safeLocalStorage.setItem('replicate_api_token', tempReplicateToken.trim());
    safeLocalStorage.setItem('groq_api_key', tempGroqKey.trim());
    setKeysSavedStatus(true);
    setTimeout(() => {
      setKeysSavedStatus(false);
      setIsKeyDrawerOpen(false);
    }, 1500);
  };

  const handleSaveTraining = () => {
    safeLocalStorage.setItem('user_training_instruction', tempTrainingInstruction.trim());
    setTrainingSavedStatus(true);
    setTimeout(() => {
      setTrainingSavedStatus(false);
      setIsTrainingDrawerOpen(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (activeModel !== 'chat') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgIndex(null);
    }
  }, [activeModel]);

  const handleBerrakSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      alert("Tarayıcınız ses sentezini desteklemiyor.");
      return;
    }

    if (speakingMsgIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Small delay ensures the speech synthesis engine fully cancels previous speech before enqueuing a new utterance
    setTimeout(() => {
      // Clean text from markdown formatting and some emojis to make it sound perfectly natural
      const cleanedText = text
        .replace(/[*#`_\-]/g, '')
        .replace(/☕/g, ' kahve ')
        .replace(/🌸/g, ' çiçek ')
        .replace(/🍲/g, ' yemek ')
        .replace(/✨/g, ' ')
        .replace(/🤔/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = 'tr-TR';
      
      // Attempt to locate a Turkish voice
      const voices = window.speechSynthesis.getVoices();
      const turkishVoice = voices.find(voice => voice.lang.startsWith('tr'));
      if (turkishVoice) {
        utterance.voice = turkishVoice;
      }

      utterance.onend = () => {
        setSpeakingMsgIndex(prev => prev === index ? null : prev);
      };

      utterance.onerror = (e) => {
        // 'interrupted' or 'canceled' are standard and expected during user interruptions/manual stops
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn("Speech Synthesis non-fatal error status:", e.error);
        }
        setSpeakingMsgIndex(prev => prev === index ? null : prev);
      };

      setSpeakingMsgIndex(index);
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  // --- YAPAY ZEKA DESTEKLİ DUBLAJ SÜRECİ ---
  const startDubbingProcess = async () => {
    if (!dubbingFileBase64) {
      setDubbingError("Lütfen önce bir video veya ses dosyası yükleyin.");
      setDubbingStep("error");
      return;
    }

    try {
      setDubbingError("");
      setDubbingTranscript("");
      setDubbingTranslation("");
      setDubbingResultAudio("");
      setSpeakerReferenceUrl(null);

      const savedReplicateToken = safeLocalStorage.getItem('replicate_api_token') || '';
      const savedGroqToken = safeLocalStorage.getItem('groq_api_key') || '';

      // Aşama 1: Deşifre Etme (Whisper)
      setDubbingStep("transcribing");
      setDubbingProgress(15);

      const transcribeRes = await fetch("/api/dubbing/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          video: dubbingFileBase64,
          replicateToken: savedReplicateToken
        })
      });

      if (!transcribeRes.ok) {
        const errorData = await transcribeRes.json();
        throw new Error(errorData.error || "Deşifre etme (Whisper) işlemi başarısız oldu.");
      }

      const transcribeData = await transcribeRes.json();
      setDubbingTranscript(transcribeData.transcript);
      setSpeakerReferenceUrl(transcribeData.audioUrl);
      setDubbingProgress(45);

      if (!transcribeData.transcript || transcribeData.transcript.trim() === "") {
        throw new Error("Videoda konuşma tespit edilemedi veya ses deşifre edilemedi.");
      }

      // Aşama 2: Çeviri Yapma (Llama 3)
      setDubbingStep("translating");
      setDubbingProgress(60);

      const translateRes = await fetch("/api/dubbing/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: transcribeData.transcript,
          targetLanguage: dubbingTargetLang,
          groqToken: savedGroqToken
        })
      });

      if (!translateRes.ok) {
        const errorData = await translateRes.json();
        throw new Error(errorData.error || "Çeviri (Llama 3) işlemi başarısız oldu.");
      }

      const translateData = await translateRes.json();
      setDubbingTranslation(translateData.translatedText);
      setDubbingProgress(75);

      // Aşama 3: Seslendirme / Dublaj (XTTS-v2)
      setDubbingStep("synthesizing");
      setDubbingProgress(85);

      const synthesizeRes = await fetch("/api/dubbing/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: translateData.translatedText,
          targetLanguage: dubbingTargetLang,
          speakerUrl: transcribeData.audioUrl, // Kendi sesini klonlama!
          replicateToken: savedReplicateToken
        })
      });

      if (!synthesizeRes.ok) {
        const errorData = await synthesizeRes.json();
        throw new Error(errorData.error || "Dublaj / Seslendirme (XTTS-v2) işlemi başarısız oldu.");
      }

      const synthesizeData = await synthesizeRes.json();
      setDubbingResultAudio(synthesizeData.audioUrl);
      setDubbingProgress(100);
      setDubbingStep("completed");

    } catch (err: any) {
      console.error("Dublaj süreci hatası:", err);
      setDubbingError(err.message || "Bilinmeyen bir hata oluştu.");
      setDubbingStep("error");
      setDubbingProgress(0);
    }
  };

  const handleDubbingFileChange = (file: File) => {
    // Max size: 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert("Dosya boyutu 50MB'tan küçük olmalıdır.");
      return;
    }

    setDubbingFile(file);
    setDubbingStep("idle");
    setDubbingError("");
    setDubbingTranscript("");
    setDubbingTranslation("");
    setDubbingResultAudio("");

    // Convert file to base64 Data URI
    const reader = new FileReader();
    reader.onload = (e) => {
      setDubbingFileBase64(e.target?.result as string);
    };
    reader.onerror = () => {
      setDubbingError("Dosya okunurken bir hata oluştu.");
    };
    reader.readAsDataURL(file);
  };
  
  // Voice Command States
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [voiceCommandFeedback, setVoiceCommandFeedback] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user'|'assistant', content: string}>>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [user, setUser] = useState<CustomUser | null>(() => {
    const stored = safeLocalStorage.getItem('xasil_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [chats, setChats] = useState<Array<{id: string, title: string, updatedAt: any}>>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsDisplayName, setSettingsDisplayName] = useState('');
  const [settingsPhotoURL, setSettingsPhotoURL] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Publishing states
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDescription, setPublishDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [publishError, setPublishError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Loading published app states
  const [publishedCode, setPublishedCode] = useState<string | null>(null);
  const [isPublishedLoading, setIsPublishedLoading] = useState(false);
  const [publishedLoadError, setPublishedLoadError] = useState('');
  const [publishedAppTitle, setPublishedAppTitle] = useState('');

  // Developer Console states
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'log' | 'error' | 'warn'>('all');

  // Logo Color State
  const [logoColorIndex, setLogoColorIndex] = useState(0);

  // Suggested themes or smart prompts during code generation
  const [activeThemeRecommendation, setActiveThemeRecommendation] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSettingsDisplayName(user.displayName || '');
      setSettingsPhotoURL(user.photoURL || '');
    }
  }, [user, isSettingsModalOpen]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSettingsError('');
    setSettingsSuccess('');
    setIsSavingSettings(true);

    try {
      const updatedUser = await updateUserProfile(user.uid, settingsDisplayName, settingsPhotoURL);
      setUser(updatedUser);
      safeLocalStorage.setItem('xasil_user', JSON.stringify(updatedUser));
      setSettingsSuccess('Profil ayarlarınız başarıyla güncellendi!');
      setTimeout(() => {
        setIsSettingsModalOpen(false);
        setSettingsSuccess('');
      }, 1500);
    } catch (error: any) {
      setSettingsError(error.message || 'Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    try {
      const blob = new Blob([generatedCode], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Dosya indirme hatası:", error);
    }
  };

  // Listen to message events from the iframe to capture its console output
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'IFRAME_CONSOLE') {
        const newLog: ConsoleLog = {
          type: event.data.logType,
          message: event.data.message,
          timestamp: new Date()
        };
        setConsoleLogs(prev => [...prev, newLog].slice(-200));
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // Reset console logs when code changes
  useEffect(() => {
    setConsoleLogs([]);
  }, [generatedCode]);

  // Color changing logo cycle - changes logo index color every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoColorIndex(prev => (prev + 1) % LOGO_COLORS.length);
    }, 120000); // 120000 ms = 2 minutes
    return () => clearInterval(interval);
  }, []);

  // Check for published app URL parameter on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const publishId = params.get('p');
    if (publishId) {
      setIsPublishedLoading(true);
      setPublishedLoadError('');
      getDoc(doc(db, 'published', publishId))
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPublishedCode(data.code || '');
            setPublishedAppTitle(data.title || 'Yayınlanan Uygulama');
          } else {
            setPublishedLoadError('Yayınlanan uygulama bulunamadı veya silinmiş.');
          }
        })
        .catch((err) => {
          console.error("Error loading published app:", err);
          setPublishedLoadError('Uygulama yüklenirken bir sorun oluştu.');
        })
        .finally(() => {
          setIsPublishedLoading(false);
        });
    }
  }, []);

  // Handle publishing app to firestore
  const handlePublishApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedCode) return;
    setIsPublishing(true);
    setPublishError('');
    setPublishedUrl('');
    setIsCopied(false);

    try {
      const docRef = await addDoc(collection(db, 'published'), {
        code: generatedCode,
        title: publishTitle.trim() || 'Süper Web Uygulaması',
        description: publishDescription.trim() || 'XASIL AI ile üretilmiş canlı web uygulaması.',
        userId: user?.uid || 'anonymous',
        userDisplayName: user?.displayName || 'Anonim Geliştirici',
        createdAt: serverTimestamp(),
      });

      const finalUrl = `${window.location.origin}/?p=${docRef.id}`;
      setPublishedUrl(finalUrl);
    } catch (error: any) {
      console.error("Error publishing app:", error);
      setPublishError(error.message || 'Yayınlama sırasında bir hata oluştu.');
    } finally {
      setIsPublishing(false);
    }
  };
  
  // Listen for user changes to fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      if (user) {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));
        try {
          const snapshot = await getDocs(q);
          const loadedChats = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || 'Yeni Sohbet',
            updatedAt: doc.data().updatedAt
          }));
          setChats(loadedChats);
          
          if (loadedChats.length === 0) {
            startNewChat();
          }
        } catch (error) {
          console.error("Error loading chats:", error);
        }
      } else {
        setChats([]);
        setMessages([]);
        setGeneratedCode('');
        setCurrentChatId(null);
      }
    };

    fetchChats();
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setIsAuthenticating(true);

    try {
      if (authMode === 'signup') {
        if (!authDisplayName.trim()) throw new Error('Kullanıcı adı gerekli.');
        const newUser = await signUpWithEmail(authEmail, authPassword, authDisplayName);
        setUser(newUser);
        safeLocalStorage.setItem('xasil_user', JSON.stringify(newUser));
        setAuthMessage('Hesabınız başarıyla oluşturuldu ve giriş yapıldı!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 1500);
      } else {
        const loggedInUser = await signInWithEmail(authEmail, authPassword);
        setUser(loggedInUser);
        safeLocalStorage.setItem('xasil_user', JSON.stringify(loggedInUser));
        setIsAuthModalOpen(false);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Bir hata oluştu.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setGeneratedCode('');
    setMessagesBerrak([]);
    setMessagesToprak([]);
    safeLocalStorage.removeItem('messages_berrak');
    safeLocalStorage.removeItem('messages_toprak');
  };

  const loadChat = async (chatId: string) => {
    if (!user) return;
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists() && chatSnap.data().userId === user.uid) {
        setMessages(chatSnap.data().messages || []);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'chats', chatId));
      setChats(prev => {
        const updated = prev.filter(c => c.id !== chatId);
        if (currentChatId === chatId) {
          startNewChat();
        }
        return updated;
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };
  
  // Extracts HTML block dynamically from the latest assistant message containing HTML
  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg && msg.role === 'assistant' && msg.content) {
        const codeMatch = msg.content.match(/```html\s*([\s\S]*?)(?:```|$)/);
        if (codeMatch && codeMatch[1]) {
          setGeneratedCode(codeMatch[1]);
          return;
        }
      }
    }
    if (messages.length === 0) {
      setGeneratedCode('');
    }
  }, [messages]);

  const getDynamicSuggestions = () => {
    const codeLower = (generatedCode || '').toLowerCase();
    const promptLower = (prompt || '').toLowerCase();
    const allMessagesText = messages.map(m => m.content || '').join(' ').toLowerCase();

    if (codeLower.includes('pomodoro') || allMessagesText.includes('pomodoro') || allMessagesText.includes('sayacı')) {
      return [
        { text: "Sesli bildirim efektleri ekle", prompt: "Pomodoro sayacına odaklanma veya mola bittiğinde çalacak tatlı bir zil sesi efekti ekle (Web Audio API kullanarak)." },
        { text: "Dairesel ilerleme dairesi tasarla", prompt: "Pomodoro sayacına kalan süreyi şık bir şekilde gösteren dairesel bir SVG geri sayım halkası (radial progress ring) ekle." },
        { text: "Özelleştirilebilir çalışma süreleri", prompt: "Pomodoro ayarlarına çalışma, kısa mola ve uzun mola sürelerini kullanıcının dilediği gibi ayarlayabileceği şık bir modal veya form ekle." }
      ];
    }
    if (codeLower.includes('oyun') || codeLower.includes('game') || allMessagesText.includes('oyun') || allMessagesText.includes('game')) {
      return [
        { text: "Arka plan ses efekti ve müzik ekle", prompt: "Oyuna ateş etme, düşman vurulma ve kaybetme durumları için dinamik ses efektleri ekle (Web Audio API kullanarak)." },
        { text: "Mobil uyumlu dokunmatik joystick/butonlar", prompt: "Oyunun mobil cihazlarda da rahatça oynanabilmesi için ekranın altına dokunmatik yön butonları ve ateş butonu ekle." },
        { text: "Zorluk dereceleri ve seviyeler", prompt: "Oyuna her dalga geçildiğinde hızlanan veya düşman sayısı artan yeni seviyeler (Level 1, Level 2...) ve zorluk seçimi ekle." }
      ];
    }
    if (codeLower.includes('hesap') || codeLower.includes('calc') || allMessagesText.includes('hesap') || allMessagesText.includes('calc')) {
      return [
        { text: "Hesaplama geçmişi paneli", prompt: "Hesap makinesine yapılan eski hesaplamaları listeleyen ve tıklanınca o sonucu tekrar ekrana getiren şık bir Geçmiş (History) paneli ekle." },
        { text: "Bilimsel fonksiyonlar ekle", prompt: "Hesap makinesini bilimsel moda geçirecek bir buton ekle ve sin, cos, tan, kök alma, üs alma gibi bilimsel fonksiyonları ekle." },
        { text: "Klavye kısayol destekleri", prompt: "Hesap makinesine klavyeden gelen sayıları ve (+, -, *, /, Enter, Backspace) tuşlarını dinleyerek işlem yapma desteği ekle." }
      ];
    }
    if (codeLower.includes('bento') || codeLower.includes('portfolyo') || allMessagesText.includes('bento') || allMessagesText.includes('portfolyo')) {
      return [
        { text: "Etkileşimli glow (parlama) efektleri", prompt: "Bento grid kartlarına fare imlecinin hareketini takip eden şık neon parlama (radial glow / hover) efektleri ekle." },
        { text: "Karanlık/Aydınlık tema seçici", prompt: "Portfolyo sitesinin sağ üst köşesine tüm bento kartlarını etkileyen şık, animasyonlu bir Karanlık / Aydınlık tema geçiş butonu ekle." },
        { text: "Filtrelenebilir proje kartları", prompt: "Portfolyo projeler bölümünün üzerine 'Hepsi', 'Tasarım', 'Kodlama' gibi kategori butonları ekleyerek projeleri anında filtreleme özelliği ekle." }
      ];
    }
    return [
      { text: "Karanlık / Aydınlık Tema Geçişi", prompt: "Uygulamaya göz alıcı geçiş animasyonuna sahip bir Karanlık ve Aydınlık tema geçiş butonu ekle." },
      { text: "Local Veri Kaydetme Özelliği", prompt: "Uygulamadaki tüm kullanıcı verilerini ve tercihleri localStorage ile tarayıcı hafızasına kaydet, sayfa yenilense de gitmesin." },
      { text: "Mobil Uyumlu Responsive Tasarım", prompt: "Uygulamanın mobil cihazlarda harika görünmesi için menüleri hamburger menüye dönüştür ve grid düzenini tek sütun yap." }
    ];
  };

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messagesBerrak, messagesToprak, activeModel]);

  const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim() || isGenerating) return;

    const currentPrompt = activePrompt;
    setPrompt('');
    setIsGenerating(true);
    
    setMessages(prev => [
      ...prev,
      { role: 'user', content: currentPrompt },
      { role: 'assistant', content: '' }
    ]);

    try {
      const messagesPayload = [...messages, { role: 'user', content: currentPrompt }];

      const systemInstruction = `Sen 'Xasil Ajanı' adlı uzman, vizyoner ve son derece mantıklı bir yapay zeka yazılım mimarı ve kıdemli kodlama asistanısın.

Görevin:
Kullanıcının taleplerini derinlemesine analiz etmek, fikir üretip mantık yürütmek ve bunları tek bir HTML dosyası (tüm CSS ve JS dahil) içinde eksiksiz ve doğrudan çalışabilir bir web projesi olarak sunmaktır.

ÇALIŞMA VE ANALİZ METODOLOJİSİ:
1. Acele etme! Kod yazmaya başlamadan önce mutlaka derin bir mantık yürütme, kullanıcı analiz adımı gerçekleştir ve yaratıcı fikirler üret.
2. Fikir Üretimi ve Tasarım: Sadece düz bir kod yazmak yerine, projeyi daha işlevsel, modern ve kullanıcı dostu hale getirecek akıllı fikirler ve yaratıcı çözümler geliştir.
3. Mevcut Kodun Analizi (Varsa): Eğer sana bir mevcut kod sağlandıysa, bu kodu çok detaylı incele. Mevcut state yönetimini, fonksiyonları ve CSS yapısını bozmadan yeni özellikleri bu kodun içine pürüzsüz bir şekilde nasıl entegre edeceğini adım adım planla.
4. Doğrulama ve Güvenlik: Uygulamanın tarayıcıda sıfır hata ile çalışacağından, responsive olacağından ve state yönetiminin tutarlı olacağından emin ol.

YANIT FORMATI:
Lütfen cevabını kesinlikle aşağıdaki sıra ve formatta ver:

### 🧠 ANALİZ, FİKİR ÜRETİMİ VE YOL HARİTASI
Kodlamaya başlamadan önce kullanıcıya nelerin üretileceğini şeffaf bir şekilde gösteren, aşağıdaki gibi son derece yapılandırılmış bölümleri sun:

1. **Gereksinim Analizi ve Mantıksal Planlama (Tablo):**
| Aşama / İstek | Çözüm Yaklaşımı | Mantıksal Akış / State Yönetimi |
| :--- | :--- | :--- |
| ... | ... | ... |

2. **Yaratıcı Fikirler ve Katma Değerli Özellikler (Onay Kutulu Liste):**
- [ ] **[Özellik Adı]:** [Neden gerekli ve projeye nasıl bir değer katacak?]
- [ ] **[Tasarım & UI Kararı]:** [Kullanıcı deneyimini iyileştirecek modern arayüz ve animasyon fikirleri.]

3. **Mevcut Projeye Entegrasyon ve Etki Analizi (Eğer mevcut kod varsa):**
- Mevcut kodda hangi kısımların güncelleneceğini, hangi yeni state değişkenlerinin ve fonksiyonların ekleneceğini detaylıca açıkla.

### 💻 KOD UPDATE / ÜRETİMİ
Ardından, tek bir \`\`\`html ve \`\`\` etiketleri arasına projenin güncellenmiş/yeni kodunun tamamını eksiksiz yerleştir.

ÖNEMLİ KURALLAR:
- Kodun tamamı bağımsız ve doğrudan tarayıcıda çalışabilir olmalıdır. Gerekirse CDN üzerinden Tailwind CSS, Lucide Icons, FontAwesome, Recharts veya diğer kütüphaneleri ekleyebilirsin.
- Eğer sana mevcut bir kaynak kod sağlandıysa, SIFIRDAN yeni bir tasarım veya proje oluşturma! Mevcut işlevleri, tasarımı, kütüphaneleri, stilleri, kullanıcı verilerini ve renk şemasını koru. Yeni talepleri bu kodun üzerine inşa et ve güncellenmiş kodun tamamını ver.`;

      const response = await fetch(getApiUrl('/api/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesPayload,
          currentCode: generatedCode,
          groqToken: safeLocalStorage.getItem('groq_api_key') || '',
          userTrainingInstruction: safeLocalStorage.getItem('user_training_instruction') || ''
        })
      });

      if (!response.ok) {
        throw new Error(`Model isteği başarısız oldu (Hata Kodu: ${response.status})`);
      }

      const text = await response.text();
      
      let finalAssistantMessage = text;

      if (!finalAssistantMessage) {
        // Fallback or error
        throw new Error('Geçerli bir mesaj alınamadı');
      }

      setMessages(prev => {
        if (prev.length === 0) return prev;
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        const lastMsg = newMessages[lastIdx];
        if (lastMsg && lastMsg.role === 'assistant') {
          newMessages[lastIdx] = {
            ...lastMsg,
            content: finalAssistantMessage
          };
        }
        return newMessages;
      });

      // Clear generation state

      setMessages(prev => {
        if (prev.length === 0) return prev;
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        const lastMsg = newMessages[lastIdx];
        if (lastMsg && lastMsg.role === 'assistant') {
          newMessages[lastIdx] = {
            ...lastMsg,
            content: finalAssistantMessage
          };
        }
        return newMessages;
      });

      // Save to Firestore
      if (user) {
        const newMessagesPayload = [...messagesPayload, { role: 'assistant', content: finalAssistantMessage }];
        if (currentChatId) {
          await updateDoc(doc(db, 'chats', currentChatId), {
            messages: newMessagesPayload,
            updatedAt: serverTimestamp()
          });
        } else {
          const title = currentPrompt.length > 30 ? currentPrompt.substring(0, 30) + '...' : currentPrompt;
          const newChatRef = await addDoc(collection(db, 'chats'), {
            userId: user.uid,
            title,
            messages: newMessagesPayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          setCurrentChatId(newChatRef.id);
        }
      }

    } catch (error: any) {
      console.error('Error generating:', error);
      setMessages(prev => {
        if (prev.length === 0) return prev;
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        const lastMsg = newMessages[lastIdx];
        if (lastMsg && lastMsg.role === 'assistant') {
          newMessages[lastIdx] = {
            ...lastMsg,
            content: lastMsg.content + `\n\n**Bir hata oluştu:** ${error.message || 'Lütfen tekrar deneyin.'}`
          };
        }
        return newMessages;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModelSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    if (activeModel === 'coding') {
      handleSubmit(e, customPrompt);
      return;
    }

    const currentPrompt = activePrompt;
    setPrompt('');

    if (activeModel === 'chat') {
      if (isGeneratingBerrak) return;
      setIsGeneratingBerrak(true);
      setBerrakThinkingText('Berrak düşünüyor...');
      
      // Add user message and empty assistant message
      setMessagesBerrak(prev => [
        ...prev,
        { role: 'user', content: currentPrompt },
        { role: 'assistant', content: '' }
      ]);

      // Start a timer for dynamic thinking text
      let seconds = 0;
      const interval = setInterval(() => {
        seconds += 1;
        if (seconds >= 12) {
          setBerrakThinkingText('Berrak çayından bir yudum aldı, düşünüp taşınıyor... ☕');
        } else if (seconds >= 8) {
          setBerrakThinkingText('Berrak hâlâ düşünüyor, azıcık daha sabret canım... 💭');
        } else if (seconds >= 4) {
          setBerrakThinkingText('Berrak derin derin düşünüyor... 🤔');
        } else {
          setBerrakThinkingText('Berrak düşünüyor... ✨');
        }
      }, 1000);

      try {
        const messagesPayload = [...messagesBerrak, { role: 'user', content: currentPrompt }];
        const response = await fetch(getApiUrl('/api/chat/berrak'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesPayload,
            groqToken: safeLocalStorage.getItem('groq_api_key') || '',
            userTrainingInstruction: safeLocalStorage.getItem('user_training_instruction') || ''
          })
        });

        clearInterval(interval);

        if (!response.ok) {
          throw new Error(`Berrak model isteği başarısız oldu (Hata Kodu: ${response.status})`);
        }

        const text = await response.text();
        
        let finalResponse = text;
        
        if (!finalResponse) {
          throw new Error('Geçerli bir mesaj alınamadı');
        }

        setMessagesBerrak(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            role: 'assistant',
            content: finalResponse
          };
          return updated;
        });
      } catch (err: any) {
        clearInterval(interval);
        console.error('Berrak error:', err);
        setMessagesBerrak(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            role: 'assistant',
            content: `Ay kuzum valla bir şeyler ters gitti, kafam karıştı. Şu hatayı aldım: ${err.message || 'Hata oluştu'}. Tekrar sorsana be şekerim.`
          };
          return updated;
        });
      } finally {
        setIsGeneratingBerrak(false);
      }
    }

    else if (activeModel === 'image') {
      if (isGeneratingToprak) return;
      setIsGeneratingToprak(true);

      // Add user prompt to Toprak history
      setMessagesToprak(prev => [
        ...prev,
        { role: 'user', content: currentPrompt }
      ]);

      try {
        const response = await fetch(getApiUrl('/api/chat/toprak'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: currentPrompt,
            style: selectedImageStyle,
            groqToken: safeLocalStorage.getItem('groq_api_key') || '',
            replicateToken: safeLocalStorage.getItem('replicate_api_token') || '',
            userTrainingInstruction: safeLocalStorage.getItem('user_training_instruction') || ''
          })
        });

        if (!response.ok) {
          throw new Error(`Toprak model isteği başarısız oldu (Hata Kodu: ${response.status})`);
        }

        const data = await response.json();
        setMessagesToprak(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.turkishMessage || 'İşte senin için tasarladığım görsel:',
            imageUrl: data.imageUrl,
            styleUsed: data.styleUsed,
            enrichedPrompt: data.enrichedPrompt
          }
        ]);
      } catch (err: any) {
        console.error('Toprak error:', err);
        setMessagesToprak(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Hoppala! Görsel tasarlanırken bir hata oluştu: ${err.message || 'Lütfen tekrar dene.'}`
          }
        ]);
      } finally {
        setIsGeneratingToprak(false);
      }
    }
  };

  const handleVoiceCommand = (rawCommand: string) => {
    const command = rawCommand.toLowerCase().trim();
    console.log("Sesli komut algılandı:", command);

    // 1. Yeni Sohbet / Temizle
    if (
      command.includes('yeni sohbet') || 
      command.includes('sohbeti temizle') || 
      command === 'temizle' || 
      command === 'sil'
    ) {
      startNewChat();
      setVoiceCommandFeedback('Yeni sohbet başarıyla başlatıldı!');
      return;
    }

    // 2. Önizlemeyi Aç / Çalıştır / Önizle
    if (
      command.includes('önizlemeyi aç') || 
      command === 'çalıştır' || 
      command === 'önizle'
    ) {
      if (generatedCode) {
        setIsPreviewOpen(true);
        setVoiceCommandFeedback('Önizleme ekranı açıldı!');
      } else {
        setVoiceCommandFeedback('Henüz kodlanmış bir proje bulunmuyor.');
      }
      return;
    }

    // 3. Önizlemeyi Kapat / Kapat
    if (
      command.includes('önizlemeyi kapat') || 
      command === 'kapat'
    ) {
      setIsPreviewOpen(false);
      setVoiceCommandFeedback('Önizleme ekranı kapatıldı!');
      return;
    }

    // 4. Konsolu Aç
    if (
      command.includes('konsolu aç') || 
      command === 'konsol aç'
    ) {
      setIsConsoleOpen(true);
      setVoiceCommandFeedback('Geliştirici konsolu açıldı!');
      return;
    }

    // 5. Konsolu Kapat
    if (
      command.includes('konsolu kapat') || 
      command === 'konsol kapat'
    ) {
      setIsConsoleOpen(false);
      setVoiceCommandFeedback('Geliştirici konsolu kapatıldı!');
      return;
    }

    // 6. Kod İndir
    if (
      command.includes('kod indir') || 
      command.includes('kodu indir') || 
      command.includes('dosya indir')
    ) {
      if (generatedCode) {
        handleDownloadCode();
        setVoiceCommandFeedback('Kod dosyası indiriliyor...');
      } else {
        setVoiceCommandFeedback('İndirilecek bir kod bulunmuyor.');
      }
      return;
    }

    // 7. Tema komutları
    if (command.startsWith('tema') || command.includes('teması')) {
      let matchedTheme = null;
      if (command.includes('gece') || command.includes('indigo') || command.includes('lacivert')) {
        matchedTheme = THEME_RECOMMENDATIONS.find(t => t.id === 'midnight');
      } else if (command.includes('yeşil') || command.includes('zümrüt')) {
        matchedTheme = THEME_RECOMMENDATIONS.find(t => t.id === 'emerald');
      } else if (command.includes('gül') || command.includes('rose') || command.includes('pembe')) {
        matchedTheme = THEME_RECOMMENDATIONS.find(t => t.id === 'rose');
      } else if (command.includes('kehribar') || command.includes('sunset') || command.includes('turuncu') || command.includes('siber')) {
        matchedTheme = THEME_RECOMMENDATIONS.find(t => t.id === 'sunset');
      }

      if (matchedTheme) {
        setActiveThemeRecommendation(matchedTheme.id);
        handleSubmit(undefined, matchedTheme.prompt);
        setVoiceCommandFeedback(`"${matchedTheme.name}" teması uygulanıyor...`);
        return;
      }
    }

    // 8. Kodlama Başlat (e.g. "kodla [proje_adi]" or "oluştur [proje_adi]" or "yaz [proje_adi]")
    if (
      command.startsWith('kodla') || 
      command.startsWith('oluştur') || 
      command.startsWith('yaz')
    ) {
      const pr = command
        .replace(/^kodla\s*/, '')
        .replace(/^oluştur\s*/, '')
        .replace(/^yaz\s*/, '')
        .trim();
      
      if (pr) {
        setPrompt(pr);
        handleSubmit(undefined, pr);
        setVoiceCommandFeedback(`"${pr}" kodlaması başlatılıyor...`);
        return;
      }
    }

    // 9. Varsayılan Geri Bildirim
    setVoiceCommandFeedback(`Algılanan Komut: "${command}"`);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'tr-TR';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setVoiceCommandFeedback('Sesli asistan aktif! Dinliyorum...');
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setSpeechTranscript(currentText);

        if (finalTranscript) {
          handleVoiceCommand(finalTranscript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Mikrofon erişimine izin verilmedi.');
        } else if (event.error === 'no-speech') {
          // Sessizlik oldu, hata vermeye gerek yok
        } else {
          setVoiceError(`Ses tanıma hatası: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [generatedCode]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError('Tarayıcınız ses tanımayı desteklemiyor veya izin verilmedi.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechTranscript('');
      setVoiceCommandFeedback('Mikrofon açılıyor...');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  if (publishedCode !== null || isPublishedLoading || publishedLoadError) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col text-white font-sans selection:bg-indigo-500/30 selection:text-white">
        {/* Simple top bar for the published app */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0F0F13]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Bot className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-100">{publishedAppTitle}</h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider">XASIL AI Tarafından Canlı Yayınlandı</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href={window.location.origin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-500/15"
            >
              <Bot className="w-3.5 h-3.5" />
              Sen de Uygulama Yap
            </a>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 bg-white relative">
          {isPublishedLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A]">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full mb-4" 
              />
              <p className="text-gray-400 text-sm font-medium">Uygulama yükleniyor...</p>
            </div>
          ) : publishedLoadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A] px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-200 mb-1">Yükleme Başarısız</h2>
              <p className="text-gray-500 text-sm max-w-md">{publishedLoadError}</p>
              <a
                href={window.location.origin}
                className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                Ana Sayfaya Dön
              </a>
            </div>
          ) : (
            <iframe
              srcDoc={publishedCode}
              title={publishedAppTitle}
              sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
              className="absolute inset-0 w-full h-full border-0 bg-white"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0A] text-gray-100 flex overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-white/10 bg-[#0F0F13] flex flex-col flex-shrink-0 whitespace-nowrap overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 select-none">
              <div 
                onClick={() => setLogoColorIndex(prev => (prev + 1) % LOGO_COLORS.length)}
                className="relative flex items-center justify-center w-8 h-8 shrink-0 cursor-pointer group"
                title="Logonun rengini değiştirmek için tıklayın!"
              >
                <motion.div
                  animate={{ 
                    y: [0, -2, 0],
                    opacity: [0.9, 1, 0.9],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className={cn("absolute inset-0 rounded-full border-2 transition-colors duration-500", LOGO_COLORS[logoColorIndex].border)} />
                  <XasilWolfLogo className={cn("w-4.5 h-4.5 z-10 transition-colors duration-500", LOGO_COLORS[logoColorIndex].text)} />
                </motion.div>
              </div>
              <h1 
                className="text-lg font-semibold tracking-tight text-white transition-colors duration-500"
                style={{ color: LOGO_COLORS[logoColorIndex].hex }}
              >
                Xasil Ajanı
              </h1>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Yeni Sohbet
              </button>

              <div className="space-y-1 mt-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase px-2 mb-2 tracking-wider">Sohbet Geçmişi</h3>
                {!user ? (
                  <div className="text-xs text-gray-500 px-2 whitespace-normal">Geçmişi görmek için giriş yapın.</div>
                ) : chats.length === 0 ? (
                  <div className="text-xs text-gray-500 px-2 whitespace-normal">Henüz sohbet yok.</div>
                ) : (
                  chats.map(chat => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group relative flex items-center justify-between rounded-lg text-sm transition-colors",
                        currentChatId === chat.id 
                          ? "bg-white/10 text-white font-medium" 
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      )}
                    >
                      <button
                        onClick={() => loadChat(chat.id)}
                        className="flex-1 text-left px-3 py-2 pr-10 truncate"
                        title={chat.title}
                      >
                        {chat.title}
                      </button>
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="absolute right-2 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/10 opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                        title="Sohbeti Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              {user ? (
                <div className="flex items-center gap-3 w-full">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{user.displayName || 'Kullanıcı'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg shrink-0"
                    title="Ayarlar"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setUser(null); safeLocalStorage.removeItem('xasil_user'); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg shrink-0" title="Çıkış Yap">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); setIsAuthModalOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Giriş Yap / Üye Ol
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="border-b border-white/10 bg-[#0F0F13] px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <PanelLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
             {!isSidebarOpen && (
              <div 
                onClick={() => setLogoColorIndex(prev => (prev + 1) % LOGO_COLORS.length)}
                className="flex items-center gap-2 cursor-pointer select-none"
                title="Rengi değiştirmek için tıkla!"
              >
                <motion.div
                  animate={{ 
                    y: [0, -2, 0],
                    opacity: [0.9, 1, 0.9],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                  }}
                  className="flex items-center justify-center"
                >
                  <XasilWolfLogo className={cn("w-5 h-5 transition-colors duration-500", LOGO_COLORS[logoColorIndex].text)} />
                </motion.div>
                <span className="font-medium text-gray-200 tracking-tight transition-colors duration-500" style={{ color: LOGO_COLORS[logoColorIndex].hex }}>Xasil Ajanı</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
              >
                <Download className="w-4 h-4" />
                Uygulamayı İndir
              </button>
            )}
            <button
              onClick={() => setIsPreviewOpen(true)}
              disabled={!generatedCode && !isGenerating}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                generatedCode || isGenerating
                  ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30"
                  : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
              )}
            >
              <MonitorPlay className="w-4 h-4" />
              Tam Ekran Önizleme
            </button>

            {generatedCode && (
              <button
                onClick={handleDownloadCode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 shadow-sm"
                title="Mevcut Kodları İndir (.html)"
              >
                <Download className="w-4 h-4" />
                Kod İndir
              </button>
            )}
            
            {user ? (
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-8 h-8 rounded-full border border-white/10 shrink-0 hover:ring-2 hover:ring-indigo-500/40 transition-all overflow-hidden bg-white/5 flex items-center justify-center"
                title="Profil Ayarları"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); setIsAuthModalOpen(true); }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shrink-0 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                title="Giriş Yap"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex justify-center w-full overflow-hidden p-6 relative">
          
          <div className="w-full max-w-3xl flex flex-col bg-[#0F0F13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl h-full">

            {/* Model Selection Tabs */}
            <div className="flex overflow-x-auto scrollbar-none border-b border-white/10 bg-[#121218]/50 p-1.5 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModel('coding')}
                className={cn(
                  "flex-1 shrink-0 min-w-[130px] md:min-w-0 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer",
                  activeModel === 'coding'
                    ? "bg-[#1F1F2E] text-indigo-400 shadow-md border border-indigo-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Kodlama Modeli</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModel('chat')}
                className={cn(
                  "flex-1 shrink-0 min-w-[150px] md:min-w-0 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer",
                  activeModel === 'chat'
                    ? "bg-[#251A22] text-[#FF79B0] shadow-md border border-[#FF79B0]/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Berrak Asistan (Sohbet)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModel('image')}
                className={cn(
                  "flex-1 shrink-0 min-w-[140px] md:min-w-0 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer",
                  activeModel === 'image'
                    ? "bg-[#162329] text-[#00D2FF] shadow-md border border-[#00D2FF]/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Toprak Görsel (Sanat)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModel('dubbing')}
                className={cn(
                  "flex-1 shrink-0 min-w-[160px] md:min-w-0 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer",
                  activeModel === 'dubbing'
                    ? "bg-[#15291F] text-[#10B981] shadow-md border border-[#10B981]/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Video Çeviri & Dublaj</span>
              </button>
            </div>
          
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeModel === 'coding' ? (
                <>
                  {messages.length === 0 && !isGenerating && (
                    <div className="space-y-8 py-4 px-2">
                      <div className="text-center space-y-3 flex flex-col items-center">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500", LOGO_COLORS[logoColorIndex].glow)}>
                          <motion.div
                            animate={{ 
                              y: [0, -3, 0],
                              opacity: [0.9, 1, 0.9],
                              scale: [1, 1.06, 1]
                            }}
                            transition={{ 
                              y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                              opacity: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                              scale: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
                            }}
                            className="flex items-center justify-center"
                          >
                            <XasilWolfLogo className={cn("w-9 h-9 transition-colors duration-500", LOGO_COLORS[logoColorIndex].text)} />
                          </motion.div>
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-white">Xasil Ajanı ile Kodlamaya Başlayın</h2>
                        <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                          Hayalinizdeki web projesini tarif edin veya aşağıda özenle hazırlanmış popüler proje fikirlerinden birini seçerek anında canlıya geçirin!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PRESET_IDEAS.map((idea) => {
                          const IconComponent = getIconComponent(idea.iconName);
                          return (
                            <motion.div
                              key={idea.id}
                              whileHover={{ scale: 1.01, y: -2 }}
                              className="bg-[#14141B] border border-white/5 rounded-xl p-5 hover:border-indigo-500/20 hover:bg-[#181824] transition-all flex flex-col justify-between group cursor-pointer"
                              onClick={() => handleSubmit(undefined, idea.prompt)}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                                    {idea.category}
                                  </span>
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">{idea.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{idea.description}</p>
                              </div>
                              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 group-hover:text-indigo-400 transition-colors">
                                <span className="font-medium">Hemen Başlat</span>
                                <span className="text-lg leading-none">→</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/20 to-purple-950/20 border border-indigo-500/10 flex items-center gap-3">
                        <XasilWolfLogo className="w-5 h-5 text-indigo-400 shrink-0" />
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          <span className="font-semibold text-indigo-400">İpucu:</span> Karar veremediyseniz sadece ne istediğinizi yazın! Ajanımız, kütüphaneleri otomatik seçer ve eksiksiz kodlar.
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, index) => {
                    if (!msg) return null;
                    const isAssistant = msg.role === 'assistant';
                    const isLast = index === messages.length - 1;
                    const content = msg.content || '';
                    const reasoningText = isAssistant ? content.replace(/```html[\s\S]*?(?:```|$)/, '').trim() : content;
                    
                    if (!reasoningText && isAssistant && isLast && isGenerating) {
                       return (
                          <div key={index} className="flex items-center gap-2 text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2">
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            Analiz ve Kodlama Sürüyor...
                          </div>
                       );
                    }

                    if (!reasoningText) return null;

                    return (
                      <div key={index} className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}>
                        <div className={cn(
                          "flex gap-3 max-w-[85%]",
                          isAssistant ? "" : "flex-row-reverse"
                        )}>
                          <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#0F0F13] border border-white/10 shadow-sm mt-1 overflow-hidden">
                            {isAssistant ? (
                              <XasilWolfLogo className={cn("w-4.5 h-4.5 transition-colors duration-500", LOGO_COLORS[logoColorIndex].text)} />
                            ) : user?.photoURL ? (
                              <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <UserIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className={cn(
                            "rounded-2xl px-5 py-3.5",
                            isAssistant 
                              ? "bg-[#1A1A24] border border-white/5 text-gray-200" 
                              : "bg-indigo-600 text-white"
                          )}>
                            {isAssistant ? (
                              <div className="prose prose-invert prose-sm max-w-none">
                                <Markdown>{reasoningText}</Markdown>
                              </div>
                            ) : (
                              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            )}

                            {isAssistant && content.includes('```html') && (
                              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium mr-2">
                                  <Code className="w-3.5 h-3.5" />
                                  <span>Web Projesi Hazır</span>
                                </div>
                                <button
                                  onClick={() => {
                                    const match = content.match(/```html\s*([\s\S]*?)(?:```|$)/);
                                    if (match && match[1]) {
                                      setGeneratedCode(match[1]);
                                      setIsPreviewOpen(true);
                                    }
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all cursor-pointer"
                                >
                                  <MonitorPlay className="w-3.5 h-3.5" />
                                  Önizlemeyi Aç
                                </button>
                                <button
                                  onClick={() => {
                                    const match = content.match(/```html\s*([\s\S]*?)(?:```|$)/);
                                    if (match && match[1]) {
                                      const blob = new Blob([match[1]], { type: 'text/html;charset=utf-8' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = 'index.html';
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                    }
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Kodu İndir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {!isGenerating && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                    <div className="flex items-center gap-2 text-xs font-medium text-green-400 uppercase tracking-wider mb-2 ml-11 mt-4">
                       İşlem Tamamlandı
                    </div>
                  )}
                </>
              ) : activeModel === 'chat' ? (
                <>
                  {messagesBerrak.length === 0 && !isGeneratingBerrak && (
                    <div className="space-y-8 py-4 px-2">
                      <div className="text-center space-y-3 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#FF79B0]/10 flex items-center justify-center text-[#FF79B0] shadow-[0_0_15px_rgba(255,121,176,0.25)]">
                          <MessageSquare className="w-7 h-7 animate-pulse" />
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-white">Berrak ile Tatlı Tatlı Sohbet Edin</h2>
                        <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                          Selam canım, ben Berrak! Çayını kahveni al gel, dertleşelim, memleketi konuşalım, her konudan tatlı tatlı sohbet edelim. Tam bir Türk kadınıyım; her sokağı, her lezzeti, güncel-geçmiş her mevzuyu bilirim ayol!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: "Yemek Tarifleri ve Sırlar 🍲", desc: "Berrak abladan enfes yöresel yemeklerin incelikleri ve mutfak sırları.", prompt: "Abla be, canım fena Gaziantep kebabı / ev yemeği çekti. Bana şöyle tadı damağımda kalacak enfes bir tarif verir misin?" },
                          { title: "Bana hayat tavsiyesi ver 🌸", desc: "İlişkiler, iş hayatı ve hayata dair samimi abla tavsiyeleri.", prompt: "Abla, kafam çok karışık bugünlerde. Hayata dair bana şöyle bilgece, içten bir abla tavsiyesi versene." },
                          { title: "Memleket hasreti dertleşmesi ☕", desc: "Dertleşmek isteyenlere tam bir mahalle ablası sıcaklığı.", prompt: "Abla valla çok yoruldum bugün, gel biraz dertleşelim, memleketten konuşalım." },
                          { title: "Eski İstanbul / Mahalle Kültürü 🏛️", desc: "Köklü geçmişimiz, geleneklerimiz ve sıcak sokaklar üzerine sohbet.", prompt: "Abla, o eski güzel mahallelerimizi, komşulukları bana kendi tatlı dilinle anlatsana." }
                        ].map((idea, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.01, y: -2 }}
                            className="bg-[#14141B] border border-white/5 rounded-xl p-5 hover:border-[#FF79B0]/20 hover:bg-[#181824] transition-all flex flex-col justify-between group cursor-pointer"
                            onClick={() => handleModelSubmit(undefined, idea.prompt)}
                          >
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">{idea.title}</h3>
                              <p className="text-xs text-gray-400 leading-relaxed">{idea.desc}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 group-hover:text-[#FF79B0] transition-colors">
                              <span className="font-medium">Sohbeti Başlat</span>
                              <span className="text-lg leading-none">→</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {messagesBerrak.map((msg, index) => {
                    if (!msg) return null;
                    const isAssistant = msg.role === 'assistant';
                    const isLast = index === messagesBerrak.length - 1;
                    const content = msg.content || '';

                    if (!content && isAssistant && isLast && isGeneratingBerrak) {
                      return (
                        <div key={index} className="flex gap-3 max-w-[85%]">
                          <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#0F0F13] border border-[#FF79B0]/20 shadow-sm mt-1 text-[#FF79B0]">
                            <MessageSquare className="w-4 h-4 animate-bounce" />
                          </div>
                          <div className="rounded-2xl px-5 py-3.5 bg-[#1A1A24] border border-white/5 text-gray-300">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#FF79B0] uppercase tracking-wider">
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              {berrakThinkingText}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (!content) return null;

                    return (
                      <div key={index} className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}>
                        <div className={cn(
                          "flex gap-3 max-w-[85%]",
                          isAssistant ? "" : "flex-row-reverse"
                        )}>
                          <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#0F0F13] border border-[#FF79B0]/20 shadow-sm mt-1 text-[#FF79B0] overflow-hidden">
                            {isAssistant ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : user?.photoURL ? (
                              <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <UserIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className={cn(
                            "rounded-2xl px-5 py-3.5 text-sm",
                            isAssistant 
                              ? "bg-[#1A1A24] border border-white/5 text-gray-200" 
                              : "bg-[#FF79B0]/80 text-white"
                          )}>
                            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                              {content}
                            </div>
                            {isAssistant && (
                              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-4">
                                <button
                                  type="button"
                                  onClick={() => handleBerrakSpeak(content, index)}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                                    speakingMsgIndex === index
                                      ? "bg-[#FF79B0]/20 text-[#FF79B0] border-[#FF79B0]/30 hover:bg-[#FF79B0]/30"
                                      : "bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:text-white"
                                  )}
                                >
                                  {speakingMsgIndex === index ? (
                                    <>
                                      <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                                      <span>Sustur</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5" />
                                      <span>Seslendir 🔊</span>
                                    </>
                                  )}
                                </button>
                                <span className="text-[10px] text-gray-500 font-mono select-none">Berrak Ses Sentezi</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {!isGeneratingBerrak && messagesBerrak.length > 0 && messagesBerrak[messagesBerrak.length - 1].role === 'assistant' && (
                    <div className="flex items-center gap-2 text-xs font-medium text-[#FF79B0]/80 uppercase tracking-wider mb-2 ml-11 mt-4">
                       Berrak ile sohbet tamamlandı 🌸
                    </div>
                  )}
                </>
              ) : activeModel === 'image' ? (
                <>
                  {messagesToprak.length === 0 && !isGeneratingToprak && (
                    <div className="space-y-8 py-4 px-2">
                      <div className="text-center space-y-3 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#00D2FF]/10 flex items-center justify-center text-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.25)]">
                          <Palette className="w-7 h-7" />
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-white">Toprak ile Görsel Şölen Yaratın</h2>
                        <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                          Selamlar! Ben Toprak. Hayallerindeki o eşsiz sahneyi bana Türkçe tarif et, tarzını seç, gerisini bana bırak. Enfes, sinematik, anime veya Pixar tarzı şaheserler üreteyim senin için!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: "Zümrüt Gözlü Cyberpunk Kedi 🐱", style: "Neon", prompt: "Siberpunk bir şehrin tepesinde oturan, neon mavi gözlü, sibernetik detayları olan görkemli bir kedi." },
                          { title: "Ghibli Tarzı Bulutlarda Uçan Gemi ⛵", style: "Anime", prompt: "Gökyüzünde, devasa pamuksu bulutların arasında yelken açan altın kaplama nostaljik bir uçan gemi." },
                          { title: "Kuzey Işıkları Altında Dağ Evi 🏔️", style: "Realistic Cinematic", prompt: "Karlar altındaki dağlık bir vadide, içinin sıcak sarı ışığı dışarı sızan ahşap bir dağ kulübesi, gökyüzünde yeşil kuzey ışıkları." },
                          { title: "Pixar Tarzı Yavru Ejderha 🐉", style: "3D Pixar", prompt: "Kocaman meraklı gözleriyle patates kızartması yemeye çalışan, tatlı, minik, yeşil bir yavru ejderha." }
                        ].map((idea, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.01, y: -2 }}
                            className="bg-[#14141B] border border-white/5 rounded-xl p-5 hover:border-[#00D2FF]/20 hover:bg-[#181824] transition-all flex flex-col justify-between group cursor-pointer"
                            onClick={() => {
                              setSelectedImageStyle(idea.style);
                              handleModelSubmit(undefined, idea.prompt);
                            }}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#00D2FF] bg-[#00D2FF]/10 px-2.5 py-1 rounded-full">
                                  {idea.style}
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">{idea.title}</h3>
                              <p className="text-xs text-gray-400 leading-relaxed">Toprak sizin için bu muhteşem eseri tasarlasın.</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 group-hover:text-[#00D2FF] transition-colors">
                              <span className="font-medium">Hemen Tasarla</span>
                              <span className="text-lg leading-none">→</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {messagesToprak.map((msg, index) => {
                    if (!msg) return null;
                    const isAssistant = msg.role === 'assistant';

                    return (
                      <div key={index} className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}>
                        <div className={cn(
                          "flex gap-3 w-full max-w-[90%]",
                          isAssistant ? "" : "flex-row-reverse"
                        )}>
                          <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#0F0F13] border border-[#00D2FF]/20 shadow-sm mt-1 text-[#00D2FF] overflow-hidden">
                            {isAssistant ? (
                              <Palette className="w-4 h-4" />
                            ) : user?.photoURL ? (
                              <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <UserIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className={cn(
                            "rounded-2xl px-5 py-4 text-sm w-full space-y-4",
                            isAssistant 
                              ? "bg-[#1A1A24] border border-white/5 text-gray-200" 
                              : "bg-[#00D2FF]/20 text-white border border-[#00D2FF]/20"
                          )}>
                            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                              {msg.content}
                            </div>

                            {isAssistant && msg.imageUrl && (
                              <div className="space-y-3">
                                <div className="relative group overflow-hidden rounded-xl border border-white/10 aspect-square w-full bg-black/40">
                                  <img 
                                    src={msg.imageUrl} 
                                    alt={msg.content} 
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                  />
                                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                    <a 
                                      href={msg.imageUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-2 bg-black/70 hover:bg-black text-white rounded-lg border border-white/10 backdrop-blur transition-all"
                                      title="Yeni Sekmede Aç"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>

                                {msg.enrichedPrompt && (
                                  <div className="p-3 bg-black/30 border border-white/5 rounded-lg text-xs space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-[#00D2FF] font-semibold">Tasarım Detayları (Prompt):</p>
                                    <p className="text-gray-400 font-mono italic leading-relaxed">"{msg.enrichedPrompt}"</p>
                                    <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                                      <span>Tarz: {msg.styleUsed || 'Cinematic'}</span>
                                      <span>Model: Toprak Visual AI</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isGeneratingToprak && (
                    <div className="flex gap-3 max-w-[85%] mt-4">
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#0F0F13] border border-[#00D2FF]/20 shadow-sm mt-1 text-[#00D2FF]">
                        <Palette className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="rounded-2xl px-5 py-4 bg-[#14141B] border border-[#00D2FF]/20 text-gray-300 w-full space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider">
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          Görsel üretiliyor, lütfen biraz bekleyin...
                        </div>
                        <p className="text-xs text-gray-400">Toprak hayal gücünü harekete geçiriyor ve sahneyi piksellere döküyor... 🎨</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6 py-2 px-1 text-gray-200">
                  <div className="text-center space-y-3 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] border border-emerald-500/20">
                      <Languages className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-white">Yapay Zeka Video Çeviri & Dublaj</h2>
                    <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                      Videolarınızı saniyeler içinde sesinizi de klonlayarak başka bir dile çevirin! Replicate API (Whisper & XTTS-v2) ve Llama 3 kullanarak sunucuyu yormadan tamamen otomatik çalışır.
                    </p>

                    {/* API Key Drawer Toggle Button */}
                    <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsKeyDrawerOpen(!isKeyDrawerOpen)}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border cursor-pointer",
                          isKeyDrawerOpen 
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
                            : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{isKeyDrawerOpen ? 'Anahtar Çekmecesini Kapat' : 'Özel API Anahtarlarını Ayarla (Replicate & Groq)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsTrainingDrawerOpen(!isTrainingDrawerOpen)}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border cursor-pointer",
                          isTrainingDrawerOpen 
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]" 
                            : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>{isTrainingDrawerOpen ? 'Eğitim Çekmecesini Kapat' : 'Yapay Zeka Modellerini Eğit (Hafıza)'}</span>
                      </button>
                    </div>

                    {/* Model Training Drawer Box */}
                    <AnimatePresence>
                      {isTrainingDrawerOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, y: -10 }}
                          animate={{ height: "auto", opacity: 1, y: 0 }}
                          exit={{ height: 0, opacity: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="w-full max-w-2xl overflow-hidden mt-2 text-left"
                        >
                          <div className="p-5 rounded-xl border border-white/10 bg-[#121218] space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Model Eğitim Merkezi (Hafıza)</h3>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">Öğrenmeye Açık</span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              Modellerin bağlamları daha iyi çözmesi, kelime mantığını oturtması ve sizin dilinizden anlaması için buraya özel kurallar ve direktifler yazabilirsiniz. Buraya yazdığınız notlar kalıcı hafızaya kazınır ve Xasil, Berrak ile Toprak'ın her yanıtında dikkate alınır.
                            </p>
                            <div className="space-y-1.5">
                              <textarea
                                value={tempTrainingInstruction}
                                onChange={(e) => setTempTrainingInstruction(e.target.value)}
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono resize-none leading-relaxed"
                                placeholder="Örn: Kullanıcı 'merhaba' dediğinde resmi olma. Her cevabından önce kullanıcının ne demek istediğini derinlemesine düşün, kelimeleri birleştirip mantığını çöz. Bana her zaman 'Dostum' diye hitap et..."
                              />
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                              <span className="text-[10px] text-gray-500">
                                {trainingSavedStatus ? (
                                  <span className="text-purple-400 font-medium flex items-center gap-1 animate-pulse">
                                    <Check className="w-3.5 h-3.5" /> Eğitim notları hafızaya kazındı!
                                  </span>
                                ) : (
                                  "Boş bırakılırsa modeller standart bağlamlarını kullanır."
                                )}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTempTrainingInstruction(safeLocalStorage.getItem('user_training_instruction') || '');
                                    setIsTrainingDrawerOpen(false);
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                                >
                                  İptal
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveTraining}
                                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                >
                                  <Brain className="w-3.5 h-3.5" /> Hafızaya Kaydet
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* API Key Drawer Box */}
                    <AnimatePresence>
                      {isKeyDrawerOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, y: -10 }}
                          animate={{ height: "auto", opacity: 1, y: 0 }}
                          exit={{ height: 0, opacity: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="w-full max-w-xl overflow-hidden mt-2 text-left"
                        >
                          <div className="p-5 rounded-xl border border-white/10 bg-[#121218] space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Yapay Zeka Anahtar Çekmecesi</h3>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Aktif</span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              Video Çeviri & Dublaj ve diğer yapay zeka modelleri için kendi API anahtarlarınızı kullanabilirsiniz. Girilen anahtarlar tarayıcınızda (localStorage) güvenli bir şekilde saklanır ve sunucuya sadece istek yaparken iletilir.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Replicate API Token (r8_...)</label>
                                <input
                                  type="password"
                                  value={tempReplicateToken}
                                  onChange={(e) => setTempReplicateToken(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                                  placeholder="Örn: r8_abc123..."
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Groq API Key (gsk_...)</label>
                                <input
                                  type="password"
                                  value={tempGroqKey}
                                  onChange={(e) => setTempGroqKey(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                                  placeholder="Örn: gsk_xyz789..."
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                              <span className="text-[10px] text-gray-500">
                                {keysSavedStatus ? (
                                  <span className="text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                                    <Check className="w-3.5 h-3.5" /> Anahtarlar başarıyla uygulandı ve kaydedildi!
                                  </span>
                                ) : (
                                  "Boş bırakılırsa sistemdeki varsayılan anahtarlar kullanılır."
                                )}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTempReplicateToken(safeLocalStorage.getItem('replicate_api_token') || '');
                                    setTempGroqKey(safeLocalStorage.getItem('groq_api_key') || '');
                                    setIsKeyDrawerOpen(false);
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                                >
                                  İptal
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveKeys}
                                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                >
                                  <Check className="w-3.5 h-3.5" /> Uygula ve Kaydet
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sürükle Bırak / Yükleme Alanı */}
                  <div className="space-y-4">
                    {!dubbingFile ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDubbingDragActive(true); }}
                        onDragLeave={() => setIsDubbingDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDubbingDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleDubbingFileChange(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "video/*,audio/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleDubbingFileChange(file);
                          };
                          input.click();
                        }}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group",
                          isDubbingDragActive
                            ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                            : "border-white/10 bg-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
                        )}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/10 transition-all text-gray-400 group-hover:text-emerald-400">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-200">Video veya ses dosyanızı sürükleyin</p>
                          <p className="text-xs text-gray-500 mt-1">veya seçmek için tıklayın (Maks. 10 dakika / 50MB)</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-400">MP4</span>
                          <span className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-400">MOV</span>
                          <span className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-400">MP3</span>
                          <span className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-400">WAV</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                            <FileVideo className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-200 truncate">{dubbingFile.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{(dubbingFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDubbingFile(null);
                            setDubbingFileBase64(null);
                            setDubbingStep("idle");
                            setDubbingTranscript("");
                            setDubbingTranslation("");
                            setDubbingResultAudio("");
                          }}
                          disabled={dubbingStep !== 'idle' && dubbingStep !== 'completed' && dubbingStep !== 'error'}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Değiştir
                        </button>
                      </div>
                    )}

                    {/* Hedef Dil Seçeneği */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-medium">Hedef Dil Seçimi</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'tr', label: 'Türkçe 🇹🇷' },
                            { id: 'en', label: 'İngilizce 🇬🇧' },
                            { id: 'de', label: 'Almanca 🇩🇪' }
                          ].map((lang) => (
                            <button
                              key={lang.id}
                              type="button"
                              onClick={() => setDubbingTargetLang(lang.id)}
                              disabled={dubbingStep !== 'idle' && dubbingStep !== 'completed' && dubbingStep !== 'error'}
                              className={cn(
                                "py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                                dubbingTargetLang === lang.id
                                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10"
                                  : "bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10"
                              )}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={startDubbingProcess}
                          disabled={!dubbingFileBase64 || (dubbingStep !== 'idle' && dubbingStep !== 'completed' && dubbingStep !== 'error')}
                          className={cn(
                            "w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border cursor-pointer",
                            dubbingFileBase64 && (dubbingStep === 'idle' || dubbingStep === 'completed' || dubbingStep === 'error')
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/15 border-transparent"
                              : "bg-white/5 border-transparent text-gray-500 cursor-not-allowed"
                          )}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Dublajı Başlat</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Süreç / Yükleme Animasyonu */}
                  {dubbingStep !== "idle" && (
                    <div className="p-5 rounded-xl border border-white/10 bg-[#0F0F13] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {dubbingStep !== "completed" && dubbingStep !== "error" ? (
                            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                          ) : dubbingStep === "completed" ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-xs font-semibold text-gray-200">
                            {dubbingStep === "transcribing" && "Aşama 1/3: Sesi Deşifre Ediliyor (OpenAI Whisper)..."}
                            {dubbingStep === "translating" && "Aşama 2/3: Konuşma Çevriliyor (Llama 3)..."}
                            {dubbingStep === "synthesizing" && "Aşama 3/3: Kendi Ses Tonunla Dublaj Hazırlanıyor (XTTS-v2)..."}
                            {dubbingStep === "completed" && "Dublaj Başarıyla Tamamlandı! 🎉"}
                            {dubbingStep === "error" && "Süreç Sırasında Hata Oluştu"}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">{dubbingProgress}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dubbingProgress}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        />
                      </div>

                      <p className="text-[11px] text-gray-400 leading-relaxed italic">
                        {dubbingStep === "transcribing" && "Videonun ses dosyası çıkarılıyor ve Replicate üzerinden yazıya aktarılıyor. Bu işlem yaklaşık 15-25 saniye sürer."}
                        {dubbingStep === "translating" && "Çıkarılan metin Groq Llama-3 modeliyle, doğallığı ve konuşma akışını koruyarak hedef dile çevriliyor."}
                        {dubbingStep === "synthesizing" && "Çevrilen metin, videodaki orijinal konuşma sesin klonlanarak yapay zeka tarafından seslendiriliyor."}
                        {dubbingStep === "completed" && "Klonlanan sesinle oluşturulan yeni dublaj hazır! Aşağıdaki panelden dinleyebilir ve indirebilirsin."}
                        {dubbingStep === "error" && `Hata Detayı: ${dubbingError}`}
                      </p>
                    </div>
                  )}

                  {/* Sonuç Panel */}
                  {(dubbingTranscript || dubbingTranslation || dubbingResultAudio) && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">İşlem Detayları & Sonuçlar</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Deşifre */}
                        {dubbingTranscript && (
                          <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Orijinal Deşifre (Yazı)</p>
                            <div className="text-xs text-gray-300 leading-relaxed max-h-36 overflow-y-auto font-sans bg-white/[0.02] p-3 rounded-lg border border-white/5">
                              {dubbingTranscript}
                            </div>
                          </div>
                        )}

                        {/* Çeviri */}
                        {dubbingTranslation && (
                          <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Çevrilen Konuşma</p>
                            <div className="text-xs text-emerald-100/90 leading-relaxed max-h-36 overflow-y-auto font-sans bg-white/[0.02] p-3 rounded-lg border border-emerald-500/5">
                              {dubbingTranslation}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sonuç Ses Çalar */}
                      {dubbingResultAudio && (
                        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3 shadow-lg shadow-emerald-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Volume2 className="w-4.5 h-4.5 text-emerald-400" />
                              <span className="text-xs font-bold text-gray-200">Oluşturulan Dublaj Sesi (Ses Klonlu)</span>
                            </div>
                            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                              XTTS-v2 Hazır
                            </span>
                          </div>

                          <audio
                            src={dubbingResultAudio}
                            controls
                            className="w-full h-10 accent-emerald-500 bg-white/5 rounded-lg overflow-hidden border border-white/5 mt-1"
                          />

                          <div className="flex justify-end gap-2 pt-1">
                            <a
                              href={dubbingResultAudio}
                              download="dublaj_sesi.wav"
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Sesi İndir
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

          <div className="p-4 bg-[#0F0F13] border-t border-white/10 relative space-y-3">
            {messages.length > 0 && !isGenerating && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 animate-pulse" />
                  <span>Ajanın Proje Geliştirme Önerileri</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getDynamicSuggestions().map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(suggestion.prompt)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-indigo-300 transition-all text-left flex items-center gap-1.5 font-medium shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Real-time Voice Assistant Dashboard */}
            <AnimatePresence>
              {(isListening || voiceCommandFeedback || voiceError) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center relative w-2 h-2">
                        {isListening && <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />}
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", isListening ? "bg-red-500" : "bg-gray-500")} />
                      </div>
                      <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                        {isListening ? "Sesli Asistan Dinliyor..." : "Sesli Asistan Durduruldu"}
                      </span>
                    </div>
                    {isListening && (
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-indigo-500 rounded-full animate-[pulse_1s_infinite_100ms]" />
                        <span className="w-1 h-4.5 bg-indigo-400 rounded-full animate-[pulse_1s_infinite_300ms]" />
                        <span className="w-1 h-2.5 bg-indigo-500 rounded-full animate-[pulse_1s_infinite_200ms]" />
                        <span className="w-1 h-5 bg-indigo-400 rounded-full animate-[pulse_1s_infinite_400ms]" />
                        <span className="w-1 h-3 bg-indigo-500 rounded-full animate-[pulse_1s_infinite_150ms]" />
                      </div>
                    )}
                  </div>

                  {/* Real-time speech display */}
                  {speechTranscript && (
                    <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-0.5">Algılanan Ses</p>
                      <p className="text-xs font-mono text-indigo-300 italic">"{speechTranscript}"</p>
                    </div>
                  )}

                  {/* Command result feedback */}
                  {voiceCommandFeedback && (
                    <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5 pl-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>{voiceCommandFeedback}</span>
                    </p>
                  )}

                  {/* Errors */}
                  {voiceError && (
                    <p className="text-xs text-red-400 font-medium flex items-center gap-1.5 pl-0.5">
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span>{voiceError}</span>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Polished Voice Commands Cheat-Sheet */}
            <AnimatePresence>
              {showVoiceHelp && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="bg-[#16161F]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3 overflow-hidden text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      <Terminal className="w-4 h-4" />
                      <span>Sesli Komut Kılavuzu</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVoiceHelp(false)}
                      className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <p className="font-semibold text-gray-200">🗣️ "kodla [istek]" veya "oluştur [istek]"</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Yapay zeka asistanına anında geliştirme talimatı verir.</p>
                        <p className="text-[10px] text-indigo-400 font-mono mt-0.5">Örn: "kodla şık bir kronometre"</p>
                      </div>

                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <p className="font-semibold text-gray-200">🧹 "yeni sohbet", "temizle" veya "sil"</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Mevcut sohbet geçmişini temizler ve yeni bir sayfa açar.</p>
                      </div>

                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <p className="font-semibold text-gray-200">💾 "kod indir" veya "kodu indir"</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Geliştirilen tek parça HTML projesini bilgisayarınıza indirir.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <p className="font-semibold text-gray-200">👁️ "önizle", "önizlemeyi aç" veya "çalıştır"</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Kodlanan uygulamanın tam ekran önizleme modunu açar.</p>
                      </div>

                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <p className="font-semibold text-gray-200">❌ "kapat" veya "önizlemeyi kapat"</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Tam ekran önizleme modundan çıkarak sohbet ekranına döner.</p>
                      </div>

                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <p className="font-semibold text-gray-200">🎨 "tema [tema_adı]"</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Ajanın önerilen tasarım temalarından birini hemen uygular.</p>
                        <p className="text-[10px] text-indigo-400 font-mono mt-0.5">Örn: "tema siber kehribar" veya "tema gece yarısı"</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {activeModel === 'image' && (
              <div className="flex flex-col gap-2 pb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00D2FF] uppercase tracking-wider">
                  <Palette className="w-3.5 h-3.5 animate-pulse" />
                  <span>Toprak Görsel Tarzı Seçin</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'Sinematik', label: 'Sinematik 🎬' },
                    { id: 'Animasyon', label: 'Animasyon 🦄' },
                    { id: '3D Pixar', label: '3D Pixar 🧸' },
                    { id: 'Neon', label: 'Neon ⚡' },
                    { id: 'Anime', label: 'Anime 🌸' },
                    { id: 'Hikaye', label: 'Hikaye 📚' },
                    { id: 'Gerçekçi Sinematik', label: 'Gerçekçi 📷' },
                    { id: 'Sanat', label: 'Sanat 🎨' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedImageStyle(style.id)}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium",
                        selectedImageStyle === style.id
                          ? "bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/30 shadow-sm"
                          : "bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeModel !== 'dubbing' && (
              <form onSubmit={handleModelSubmit} className="relative flex items-center w-full gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      isListening 
                        ? "Sesiniz dinleniyor... Komutlarınızı bekliyorum." 
                        : activeModel === 'coding'
                          ? "Ne kodlamak istiyorsunuz?"
                          : activeModel === 'chat'
                            ? "Berrak ablayla tatlı tatlı sohbet edin..."
                            : "Toprak için hayalinizdeki görseli tarif edin..."
                    }
                    disabled={isGenerating || isGeneratingBerrak || isGeneratingToprak}
                    className={cn(
                      "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 pr-20 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all disabled:opacity-50",
                      activeModel === 'coding'
                        ? "focus:border-indigo-500/50 focus:ring-indigo-500/50"
                        : activeModel === 'chat'
                          ? "focus:border-[#FF79B0]/50 focus:ring-[#FF79B0]/50"
                          : "focus:border-[#00D2FF]/50 focus:ring-[#00D2FF]/50"
                    )}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {/* Microphone Toggle Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={cn(
                        "p-2 rounded-lg transition-all relative flex items-center justify-center cursor-pointer",
                        isListening 
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      )}
                      title="Sesli Komut Ver"
                    >
                      {isListening ? (
                        <>
                          <span className="absolute inset-0 rounded-lg bg-red-500/20 animate-ping" />
                          <Mic className="w-4 h-4" />
                        </>
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="submit"
                      disabled={!prompt.trim() || isGenerating || isGeneratingBerrak || isGeneratingToprak}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Help button for speech commands */}
                <button
                  type="button"
                  onClick={() => setShowVoiceHelp(!showVoiceHelp)}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all cursor-pointer",
                    showVoiceHelp
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 animate-pulse"
                      : "bg-[#16161E] border-white/5 text-gray-400 hover:text-white hover:bg-[#1C1C26]"
                  )}
                  title="Sesli Komut Kılavuzunu Göster/Gizle"
                >
                  <Terminal className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>

    {/* Full Screen Preview Modal */}
    <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col font-sans selection:bg-indigo-500/30 text-white"
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0F0F13]">
              <div className="flex items-center gap-3">
                <MonitorPlay className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-gray-200">Canlı Önizleme</span>
                {isGenerating && (
                  <span className="ml-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {generatedCode && (
                  <button
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                    className={cn(
                      "px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold border cursor-pointer relative",
                      isConsoleOpen
                        ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                        : "bg-white/5 text-gray-400 hover:text-white border-transparent hover:bg-white/10"
                    )}
                    title="Geliştirici Konsolunu Aç/Kapat"
                  >
                    <Bug className="w-4 h-4" />
                    Geliştirici Konsolu
                    {consoleLogs.filter(l => l.type === 'error').length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                        {consoleLogs.filter(l => l.type === 'error').length}
                      </span>
                    )}
                  </button>
                )}
                {generatedCode && (
                  <button
                    onClick={handleDownloadCode}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm shadow-indigo-500/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Kod İndir
                  </button>
                )}
                {generatedCode && (
                  <button
                    onClick={() => {
                      const chatTitle = chats.find(c => c.id === currentChatId)?.title || 'Web Uygulaması';
                      setPublishTitle(chatTitle);
                      setPublishDescription('XASIL AI ile üretilmiş canlı web uygulaması.');
                      setPublishedUrl('');
                      setPublishError('');
                      setIsPublishModalOpen(true);
                      setIsCopied(false);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all flex items-center gap-2 text-xs font-semibold shadow-sm shadow-emerald-500/20 cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    Canlı Yayınla / Paylaş
                  </button>
                )}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                  <span className="text-sm font-medium">Kapat</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden relative">
              {/* Left/Middle: Iframe */}
              <div className="flex-1 bg-white relative flex flex-col h-full">

                {!generatedCode ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
                    <div className="text-center space-y-4">
                      <Code className="w-12 h-12 text-gray-800 mx-auto" />
                      <p className="text-gray-600 text-sm">Önizleme burada görünecektir</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    srcDoc={injectConsoleCapture(generatedCode)}
                    title="Preview"
                    sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                    className="absolute inset-0 w-full h-full border-0 bg-white"
                  />
                )}
              </div>

              {/* Right: Developer Console Sidebar */}
              <AnimatePresence>
                {isConsoleOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 450, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-l border-white/10 bg-[#0F0F13] flex flex-col h-full overflow-hidden shrink-0"
                  >
                    {/* Console Header */}
                    <div className="px-5 py-3 border-b border-white/10 bg-[#0A0A0A] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bug className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Konsol Çıktıları</span>
                        <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                          {consoleLogs.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const formatted = consoleLogs.map(l => `[${l.timestamp.toLocaleTimeString()}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
                            navigator.clipboard.writeText(formatted);
                          }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                          title="Tüm logları kopyala"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConsoleLogs([])}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                          title="Konsolu temizle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="px-4 py-2 border-b border-white/5 bg-[#0F0F13] flex items-center gap-1">
                      {(['all', 'log', 'warn', 'error'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setConsoleFilter(tab)}
                          className={cn(
                            "text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                            consoleFilter === tab
                              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                              : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                          )}
                        >
                          {tab === 'all' ? 'Hepsi' : tab === 'log' ? 'Bilgi' : tab === 'warn' ? 'Uyarı' : 'Hata'}
                        </button>
                      ))}
                    </div>

                    {/* Logs Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] bg-black/30 scrollbar-thin">
                      {consoleLogs.filter(log => consoleFilter === 'all' || log.type === consoleFilter).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2 py-12">
                          <Terminal className="w-8 h-8 opacity-20" />
                          <p>Aktif log veya çalışma hatası bulunmuyor</p>
                        </div>
                      ) : (
                        consoleLogs
                          .filter(log => consoleFilter === 'all' || log.type === consoleFilter)
                          .map((log, logIdx) => (
                            <div
                              key={logIdx}
                              className={cn(
                                "p-2.5 rounded-lg border leading-relaxed whitespace-pre-wrap transition-colors break-words",
                                log.type === 'error'
                                  ? "bg-red-500/5 border-red-500/10 text-red-400 hover:bg-red-500/10"
                                  : log.type === 'warn'
                                    ? "bg-amber-500/5 border-amber-500/10 text-amber-400 hover:bg-amber-500/10"
                                    : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
                              )}
                            >
                              <div className="flex items-center justify-between mb-1 opacity-50 text-[9px] select-none">
                                <span className="font-semibold uppercase tracking-wider">{log.type}</span>
                                <span>{log.timestamp.toLocaleTimeString()}</span>
                              </div>
                              <div>{log.message}</div>
                            </div>
                          ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F13] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0A0A]">
                <h2 className="text-lg font-medium text-white">
                  {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </h2>
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {authError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                    {authError}
                  </div>
                )}
                {authMessage && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">
                    {authMessage}
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Kullanıcı Adı</label>
                      <input
                        type="text"
                        required
                        value={authDisplayName}
                        onChange={(e) => setAuthDisplayName(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        placeholder="Örn: Ahmet Yılmaz"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">E-posta Adresi (@gmail.com)</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      placeholder="hesabiniz@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Şifre</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      placeholder="En az 6 karakter"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isAuthenticating ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                  {authMode === 'login' ? (
                    <>
                      Hesabınız yok mu?{' '}
                      <button onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthMessage(''); }} className="text-indigo-400 hover:text-indigo-300 font-medium">
                        Kayıt Ol
                      </button>
                    </>
                  ) : (
                    <>
                      Zaten hesabınız var mı?{' '}
                      <button onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); }} className="text-indigo-400 hover:text-indigo-300 font-medium">
                        Giriş Yap
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F13] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0A0A]">
                <div className="flex items-center gap-2.5">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-medium text-white">Profil Ayarları</h2>
                </div>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {settingsError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 animate-in fade-in duration-150">
                    {settingsError}
                  </div>
                )}
                {settingsSuccess && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400 animate-in fade-in duration-150">
                    {settingsSuccess}
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Avatar Preview & Quick selection */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Profil Resmi</label>
                    <div className="flex items-center gap-4 bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                      <div className="relative shrink-0">
                        {settingsPhotoURL ? (
                          <img
                            src={settingsPhotoURL}
                            alt="Profile Preview"
                            className="w-16 h-16 rounded-full border border-indigo-500/30 object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-200">Görsel Seçimi</p>
                        <p className="text-xs text-gray-500">Aşağıdaki hazır avatarlardan birine dokunabilir veya kendi resim linkinizi yapıştırabilirsiniz.</p>
                      </div>
                    </div>

                    {/* Quick Avatars Grid */}
                    <div className="space-y-1.5">
                      <span className="text-xs text-gray-400">Önerilen Avatarlar:</span>
                      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {[
                          { name: 'Siber Kedi', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: 'Uzay Gezgini', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: 'Yazılımcı Kadın', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: 'Modern Tasarımcı', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: 'Tekno Genç', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: 'Soyut Neon', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80' }
                        ].map((avatar) => (
                          <button
                            key={avatar.name}
                            type="button"
                            onClick={() => setSettingsPhotoURL(avatar.url)}
                            className={clsx(
                              "relative w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 transition-all hover:scale-105 active:scale-95",
                              settingsPhotoURL === avatar.url ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-transparent hover:border-white/30"
                            )}
                            title={avatar.name}
                          >
                            <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom URL Input */}
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Veya özel profil resmi adresi (URL):</span>
                      <input
                        type="url"
                        value={settingsPhotoURL}
                        onChange={(e) => setSettingsPhotoURL(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                        placeholder="https://example.com/resim.png"
                      />
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Kullanıcı Adı</label>
                      <input
                        type="text"
                        required
                        value={settingsDisplayName}
                        onChange={(e) => setSettingsDisplayName(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        placeholder="Örn: Ahmet Yılmaz"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">E-posta Adresi (Değiştirilemez)</label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsSettingsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Kapat
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingSettings ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        'Kaydet'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Live Modal */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F13] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0A0A]">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-medium text-white">Canlı Yayınla ve Paylaş</h2>
                </div>
                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {publishError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 animate-in fade-in duration-150">
                    {publishError}
                  </div>
                )}

                {!publishedUrl ? (
                  <form onSubmit={handlePublishApp} className="space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Hazırlanan web uygulamasını buluta yayınlayarak herkese açık, gerçek ve canlı bir bağlantı (URL) edinebilirsiniz. Bu bağlantıyı arkadaşlarınızla paylaşabilirsiniz!
                    </p>
                    
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Uygulama Başlığı</label>
                      <input
                        type="text"
                        required
                        value={publishTitle}
                        onChange={(e) => setPublishTitle(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                        placeholder="Örn: Benim Harika Hesap Makinem"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Açıklama (Opsiyonel)</label>
                      <textarea
                        value={publishDescription}
                        onChange={(e) => setPublishDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                        placeholder="Örn: Bu uygulama XASIL AI ile kodlanmıştır."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsPublishModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={isPublishing}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isPublishing ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            <span>Yayınlanıyor...</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4 animate-spin-slow" />
                            <span>Şimdi Canlı Yayınla</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Check className="w-7 h-7 text-emerald-400 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Tebrikler! Uygulamanız Canlıda!</h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Web uygulamanız başarıyla yayınlandı. Aşağıdaki link ile canlı uygulamaya dilediğiniz her cihazdan erişebilirsiniz.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-xl p-3 select-all">
                        <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-gray-300 truncate text-left flex-1 font-mono">{publishedUrl}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(publishedUrl);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-2"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Kopyalandı!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Bağlantıyı Kopyala</span>
                            </>
                          )}
                        </button>
                        
                        <a
                          href={publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-xs font-semibold flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Yeni Sekmede Aç</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setIsPublishModalOpen(false)}
                        className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-4"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

