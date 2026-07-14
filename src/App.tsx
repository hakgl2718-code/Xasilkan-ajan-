import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Code, RotateCw, MonitorPlay, Bot, Maximize, X, User as UserIcon, LogOut, MessageSquare, Download, Menu, PanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { signUpWithEmail, signInWithEmail, logout, db, type CustomUser } from './lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, orderBy, getDoc } from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user'|'assistant', content: string}>>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [user, setUser] = useState<CustomUser | null>(() => {
    const stored = localStorage.getItem('xasil_user');
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
        localStorage.setItem('xasil_user', JSON.stringify(newUser));
        setAuthMessage('Hesabınız başarıyla oluşturuldu ve giriş yapıldı!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 1500);
      } else {
        const loggedInUser = await signInWithEmail(authEmail, authPassword);
        setUser(loggedInUser);
        localStorage.setItem('xasil_user', JSON.stringify(loggedInUser));
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
  
  // Extracts HTML block dynamically as it streams from the last assistant message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      const codeMatch = lastMessage.content.match(/```html\s*([\s\S]*?)(?:```|$)/);
      if (codeMatch && codeMatch[1]) {
        setGeneratedCode(codeMatch[1]);
      }
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const currentPrompt = prompt;
    setPrompt('');
    setIsGenerating(true);
    
    setMessages(prev => [
      ...prev,
      { role: 'user', content: currentPrompt },
      { role: 'assistant', content: '' }
    ]);

    try {
      const messagesPayload = [...messages, { role: 'user', content: currentPrompt }];

      const systemInstruction = `Sen 'Xasil Ajanı' adlı uzman bir yapay zeka kodlama asistanısın. Görevin kullanıcının isteklerini analiz edip, tek bir HTML dosyası içinde (CSS ve JS dahil) eksiksiz, çalışan bir web projesi yazmaktır. Önceki konuşma bağlamını (varsa) dikkate al ve aynı proje üzerinde geliştirmeler yapmaya devam et.
    
Lütfen cevabını şu formatta ver:
1. Önce kullanıcının projesi için yapacağın araştırmayı, analizini ve planını kısaca açıkla.
2. Ardından, \`\`\`html ve \`\`\` etiketleri arasına tüm kodu yerleştir.

Kod, bağımsız ve doğrudan tarayıcıda çalışabilir olmalıdır. Gerekirse CDN üzerinden Tailwind CSS veya diğer kütüphaneleri ekleyebilirsin.`;

      const pollinationsMessages = [
        { role: 'system', content: systemInstruction },
        ...messagesPayload.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesPayload
        })
      });

      if (!response.ok) {
        throw new Error(`Model isteği başarısız oldu (Hata Kodu: ${response.status})`);
      }

      if (!response.body) throw new Error('Cevap gövdesi boş');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let finalAssistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          finalAssistantMessage += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = finalAssistantMessage;
            }
            return newMessages;
          });
        }
      }

      // If for some reason finalAssistantMessage remains empty, retry with fallback
      if (!finalAssistantMessage) {
        const fallbackResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesPayload
          })
        });
        if (fallbackResponse.ok) {
          finalAssistantMessage = await fallbackResponse.text();
        }
      }

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = finalAssistantMessage;
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
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content += `\n\n**Bir hata oluştu:** ${error.message || 'Lütfen tekrar deneyin.'}`;
        }
        return newMessages;
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-indigo-500/50 border-t-indigo-400 border-r-indigo-400"
                />
                <Bot className="w-4 h-4 text-indigo-400 z-10" />
              </div>
              <motion.h1 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-lg font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400 truncate"
              >
                Xasil Ajanı
              </motion.h1>
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
                    <button
                      key={chat.id}
                      onClick={() => loadChat(chat.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                        currentChatId === chat.id 
                          ? "bg-white/10 text-white font-medium" 
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      )}
                    >
                      {chat.title}
                    </button>
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
                  <button onClick={() => { setUser(null); localStorage.removeItem('xasil_user'); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg shrink-0">
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
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span className="font-medium text-gray-200 tracking-tight">Xasil Ajanı</span>
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
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex justify-center w-full overflow-hidden p-6 relative">
          
          <div className="w-full max-w-3xl flex flex-col bg-[#0F0F13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl h-full">

          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && !isGenerating && (
              <div className="text-center space-y-4 my-12 text-gray-400 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Terminal className="w-8 h-8 text-indigo-400/50" />
                </div>
                <p className="text-sm">Bir proje fikri verin, Xasil Ajanı sizin için araştırsın, analiz etsin ve kodlasın.</p>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5">Portfolyo sitesi</span>
                  <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5">Hesap makinesi</span>
                  <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5">Pomodoro sayacı</span>
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              const isLast = index === messages.length - 1;
              const reasoningText = isAssistant ? msg.content.replace(/```html[\s\S]*?(?:```|$)/, '').trim() : msg.content;
              
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
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#0F0F13] border border-white/10 shadow-sm mt-1">
                      {isAssistant ? <Bot className="w-4 h-4 text-indigo-400" /> : <UserIcon className="w-4 h-4 text-gray-400" />}
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
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-[#0F0F13] border-t border-white/10 relative">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ne kodlamak istiyorsunuz?"
                disabled={isGenerating}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="absolute right-2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
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
            className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col"
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
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                <span className="text-sm font-medium">Kapat</span>
              </button>
            </div>
            
            <div className="flex-1 bg-white relative">
              {!generatedCode ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
                  <div className="text-center space-y-4">
                    <Code className="w-12 h-12 text-gray-800 mx-auto" />
                    <p className="text-gray-600 text-sm">Önizleme burada görünecektir</p>
                  </div>
                </div>
              ) : (
                <iframe
                  srcDoc={generatedCode}
                  title="Preview"
                  sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                  className="absolute inset-0 w-full h-full border-0 bg-white"
                />
              )}
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
    </div>
  );
}

