import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, CSVData } from './types';
import { parseCSV } from './csvProcessor';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Database,
  Building2,
  Sparkles
} from 'lucide-react';

/* =======================
   RAW CSV DATA
======================= */
const RAW_CSV_DATA = `PASTE CSV KAU DI SINI (SAMA MACAM SEBELUM)`;

/* =======================
   APP
======================= */
const App: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Selamat datang! Saya ialah **AI Analitik Assistant** anda. Saya telah memuatkan data **Kecukupan Penawaran Perumahan (NAPIC)**. Sila tanya apa sahaja soalan tentang unit perumahan, kecukupan daerah, atau perumahan tidak formal di Malaysia!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  /* =======================
     LOAD CSV
  ======================= */
  useEffect(() => {
    const { headers, rows } = parseCSV(RAW_CSV_DATA);
    setCsvData({ headers, rows, fileName: "NAPIC_Housing_Adequacy_2024.csv" });
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* =======================
     SEND MESSAGE
  ======================= */
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !csvData) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      /* ✅ VITE ENV */
      const apiKey = import.meta.env.VITE_API_KEY;

      if (!apiKey) {
        throw new Error("VITE_API_KEY tidak dijumpai");
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `
Anda ialah Agent Analitik Chatbot Pintar untuk data NAPIC.
Data mengandungi Kecukupan Penawaran Perumahan 2024 mengikut daerah & negeri.

Definisi:
- BIL UNIT NAPIC SEMASA: Unit perumahan sedia ada
- Kecukupan_NAPIC: Jurang unit (negatif = kekurangan)
- Tahap_NAPIC: Status penawaran
- Perumahan_tidakformal_semasa: Unit tidak formal

Arahan:
1. Jawab berdasarkan data CSV
2. Beri analisis tepat
3. Guna Bahasa Malaysia profesional & mesra
4. Perbandingan → jadual ringkas atau bullet
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.text || "Tiada jawapan dijana." }
      ]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "❌ Ralat sambungan atau API Key. Sila semak konfigurasi." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     RENDER MESSAGE
  ======================= */
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.trim().startsWith('|')) {
        return (
          <div
            key={i}
            className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre bg-indigo-50/50 p-2 rounded border border-indigo-100 mb-2"
          >
            {line}
          </div>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 text-sm leading-relaxed">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="text-indigo-800">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="bg-indigo-700 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Building2 />
          <div>
            <h1 className="font-black">AI Analitik Chatbot</h1>
            <p className="text-xs opacity-80">NAPIC Housing Data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <Database className="w-4 h-4" /> DATA AKTIF
        </div>
      </header>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50" ref={chatScrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex mb-6 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
              {renderContent(m.content)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Loader2 className="animate-spin" /> Sedang memproses...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Tanya tentang data NAPIC..."
            className="flex-1 border rounded-xl p-3 text-sm resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white px-4 rounded-xl"
          >
            <Send />
          </button>
        </div>

        <div className="mt-3 flex gap-2 text-xs">
          <Sparkles className="w-4 h-4" />
          {["Status Petaling?", "Daerah kritikal?", "Johor Bahru?", "Perumahan tidak formal?"].map(q => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="border px-3 py-1 rounded-full text-indigo-600"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
