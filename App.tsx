import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  MessageSquare,
  Sparkles
} from 'lucide-react';

const RAW_CSV_DATA = `DAERAH,Negeri,Tahun,BIL UNIT NAPIC SEMASA,BIL UNIT NAPIC ALL,Tahun_2,Bil_Isi_Rumah,Bil_t_Kediaman_D,Kecukupan_NAPIC,Tahap_NAPIC,Perumahan_tidakformal_semasa
GOMBAK,SELANGOR,2024,215597,227508,2024,247800,277300,-32203,Kurang Penawaran,61703
HULU LANGAT,SELANGOR,2024,398404,422304,2024,433300,479400,-34896,Kurang Penawaran,80996
HULU SELANGOR,SELANGOR,2024,93367,99947,2024,67400,92700,25967,Lebih Penawaran,-667
KLANG,SELANGOR,2024,224583,248326,2024,291300,331300,-66717,Kurang Penawaran,106717
KUALA LANGAT,SELANGOR,2024,65810,84496,2024,95300,114800,-29490,Kurang Penawaran,48990
KUALA SELANGOR,SELANGOR,2024,70048,81442,2024,92000,104500,-21952,Kurang Penawaran,34452
PETALING,SELANGOR,2024,545828,565381,2024,686700,752200,-140872,Kurang Penawaran,206372
SABAK BERNAM,SELANGOR,2024,11133,12488,2024,29900,35700,-18767,Kurang Penawaran,24567
SEPANG,SELANGOR,2024,102931,133440,2024,129300,169700,-26369,Kurang Penawaran,66769
W.P LABUAN,W.P LABUAN,2024,14039,14608,2024,26700,24300,-12661,Kurang Penawaran,10261
W.P PUTRAJAYA,W.P PUTRAJAYA,2024,20251,24160,2024,34800,44900,-14549,Kurang Penawaran,24649
W.P KUALA LUMPUR,W.P KUALA LUMPUR,2024,561102,680193,2024,647100,713500,-85998,Kurang Penawaran,152398
BATU PAHAT,JOHOR,2024,97943,103927,2024,127600,138500,-29657,Kurang Penawaran,40557
JOHOR BAHRU,JOHOR,2024,499136,544908,2024,522400,751400,-23264,Kurang Penawaran,252264
KLUANG,JOHOR,2024,74568,81636,2024,87000,99700,-12432,Kurang Penawaran,25132
KOTA TINGGI,JOHOR,2024,31729,43222,2024,63800,79400,-32071,Kurang Penawaran,47671
KULAI,JOHOR,2024,77336,80964,2024,88700,92200,-11364,Kurang Penawaran,14864
MERSING,JOHOR,2024,7282,8516,2024,22500,23500,-15218,Kurang Penawaran,16218
MUAR,JOHOR,2024,47043,49042,2024,75300,85700,-28257,Kurang Penawaran,38657
PONTIAN,JOHOR,2024,21118,22325,2024,46200,49800,-25082,Kurang Penawaran,28682
SEGAMAT,JOHOR,2024,47301,48739,2024,55400,68500,-8099,Kurang Penawaran,21199
TANGKAK,JOHOR,2024,24965,26725,2024,41600,46600,-16635,Kurang Penawaran,21635
BARAT DAYA,PULAU PINANG,2024,91660,102840,2024,79500,105700,12160,Lebih Penawaran,14040
SEBERANG PERAI SELATAN,PULAU PINANG,2024,63566,72205,2024,62100,69200,1466,Lebih Penawaran,5634
SEBERANG PERAI TENGAH,PULAU PINANG,2024,125048,132225,2024,113800,136600,11248,Lebih Penawaran,11552
SEBERANG PERAI UTARA,PULAU PINANG,2024,93271,102816,2024,95400,108600,-2129,Kurang Penawaran,15329
TIMUR LAUT,PULAU PINANG,2024,191560,205319,2024,194200,221800,-2640,Kurang Penawaran,30240
BAGAN DATUK,PERAK,2024,5810,6126,2024,21200,18700,-15390,Kurang Penawaran,12890
BATANG PADANG,PERAK,2024,18607,26466,2024,67400,102800,-48793,Kurang Penawaran,84193
HILIR PERAK,PERAK,2024,25464,31251,2024,31200,40500,-5736,Kurang Penawaran,15036
HULU PERAK,PERAK,2024,7998,9077,2024,26800,33600,-18802,Kurang Penawaran,25602
KAMPAR,PERAK,2024,31722,36978,2024,31100,46600,622,Lebih Penawaran,14878
KERIAN,PERAK,2024,20330,22603,2024,42400,54200,-22070,Kurang Penawaran,33870
KINTA,PERAK,2024,255064,287659,2024,274300,315200,-19236,Kurang Penawaran,60136
KUALA KANGSAR,PERAK,2024,26442,29497,2024,55200,60600,-28758,Kurang Penawaran,34158
LARUT MATANG,PERAK,2024,56994,60962,2024,71500,89000,-14506,Kurang Penawaran,32006
MANJUNG,PERAK,2024,64948,77691,2024,67400,102800,-2452,Kurang Penawaran,37852
MUALIM,PERAK,2024,13020,14278,2024,24100,23100,-11080,Kurang Penawaran,10080
PERAK TENGAH,PERAK,2024,13557,17672,2024,32600,39800,-19043,Kurang Penawaran,26243
SELAMA,PERAK,2024,2870,3057,2024,9600,12000,-6730,Kurang Penawaran,9130
JELEBU,NEGERI SEMBILAN,2024,6762,7077,2024,11600,13800,-4838,Kurang Penawaran,7038
JEMPOL,NEGERI SEMBILAN,2024,15367,17797,2024,34500,38500,-19133,Kurang Penawaran,23133
KUALA PILAH,NEGERI SEMBILAN,2024,9611,11084,2024,19800,25000,-10189,Kurang Penawaran,15389
PORT DICKSON,NEGERI SEMBILAN,2024,37466,42935,2024,35900,55200,1566,Kurang Penawaran,17734
REMBAU,NEGERI SEMBILAN,2024,8113,9952,2024,13600,16800,-5487,Kurang Penawaran,8687
SEREMBAN,NEGERI SEMBILAN,2024,215607,247098,2024,214800,252100,807,Lebih Penawaran,36493
TAMPIN,NEGERI SEMBILAN,2024,18283,20962,2024,23000,28000,-4717,Kurang Penawaran,9717
ALOR GAJAH,MELAKA,2024,45970,58183,2024,81800,81400,-35830,Kurang Penawaran,35430
JASIN,MELAKA,2024,29572,48272,2024,42600,58300,-13028,Kurang Penawaran,28728
MELAKA TENGAH,MELAKA,2024,147927,165112,2024,179100,220400,-31173,Kurang Penawaran,72473
BALING,KEDAH,2024,10495,12183,2024,40400,45100,-29905,Kurang Penawaran,34605
BANDAR BAHARU,KEDAH,2024,2521,2793,2024,11800,13300,-9279,Kurang Penawaran,10779
KOTA SETAR,KEDAH,2024,70485,75937,2024,99900,117200,-29415,Kurang Penawaran,46715
KUALA MUDA,KEDAH,2024,137957,146489,2024,143700,180600,-5743,Kurang Penawaran,42643
KUBANG PASU,KEDAH,2024,33733,38124,2024,63600,72900,-29867,Kurang Penawaran,39167
KULIM,KEDAH,2024,72279,82160,2024,88400,101700,-16121,Kurang Penawaran,29421
LANGKAWI,KEDAH,2024,8958,10674,2024,27700,36100,-18742,Kurang Penawaran,27142
PADANG TERAP,KEDAH,2024,2341,2421,2024,16700,19300,-14359,Kurang Penawaran,16959
PENDANG,KEDAH,2024,5335,6119,2024,25200,32100,-19865,Kurang Penawaran,26765
POKOK SENA,KEDAH,2024,4732,5808,2024,12600,15500,-7868,Kurang Penawaran,10768
SIK,KEDAH,2024,1970,2030,2024,18200,20100,-16230,Kurang Penawaran,18130
YAN,KEDAH,2024,5886,6121,2024,17800,18200,-11914,Kurang Penawaran,12314
BENTONG,PAHANG,2024,20360,21152,2024,30900,41500,-10540,Kurang Penawaran,21140
BERA,PAHANG,2024,13906,14284,2024,25500,27700,-11594,Kurang Penawaran,13794
CAMERON HIGHLANDS,PAHANG,2024,9271,12496,2024,10600,18900,-1329,Kurang Penawaran,9629
JERANTUT,PAHANG,2024,13604,16043,2024,23700,29000,-10096,Kurang Penawaran,15396
KUANTAN,PAHANG,2024,137754,164619,2024,169200,173300,-31446,Kurang Penawaran,35546
LIPIS,PAHANG,2024,9372,11615,2024,22800,25600,-13428,Kurang Penawaran,16228
MARAN,PAHANG,2024,19380,22787,2024,26000,31900,-6620,Kurang Penawaran,12520
PEKAN,PAHANG,2024,16749,18646,2024,37100,37200,-20351,Kurang Penawaran,20451
RAUB,PAHANG,2024,18717,20188,2024,24200,26900,-5483,Kurang Penawaran,8183
ROMPIN,PAHANG,2024,17292,20873,2024,28800,36700,-11508,Kurang Penawaran,19408
TEMERLOH,PAHANG,2024,33738,36795,2024,43800,56000,-10062,Kurang Penawaran,22262
BESUT,TERENGGANU ,2024,9558,11061,2024,43100,49200,-33542,Kurang Penawaran,39642
DUNGUN,TERENGGANU ,2024,12299,13679,2024,46600,49100,-34301,Kurang Penawaran,36801
HULU TERENGGANU,TERENGGANU ,2024,3918,5759,2024,18900,24100,-14982,Kurang Penawaran,20182
KEMAMAN,TERENGGANU ,2024,24021,28823,2024,64000,69400,-39979,Kurang Penawaran,45379
KUALA NERUS,TERENGGANU ,2024,18133,19678,2024,35100,37700,-16967,Kurang Penawaran,19567
KUALA TERENGGANU,TERENGGANU ,2024,36328,40145,2024,59200,62300,-22872,Kurang Penawaran,25972
MARANG,TERENGGANU ,2024,13775,18026,2024,32800,40200,-19025,Kurang Penawaran,26425
SETIU,TERENGGANU ,2024,1344,2326,2024,15700,17800,-14356,Kurang Penawaran,16456
BACHOK,KELANTAN,2024,4916,5547,2024,34600,41900,-29684,Kurang Penawaran,36984
GUA MUSANG,KELANTAN,2024,5988,6037,2024,21300,28300,-15312,Kurang Penawaran,22312
JELI,KELANTAN,2024,2251,2661,2024,13200,12500,-10949,Kurang Penawaran,10249
KOTA BHARU,KELANTAN,2024,36541,42087,2024,124200,146300,-87659,Kurang Penawaran,109759
KUALA KRAI,KELANTAN,2024,6644,7403,2024,24700,30900,-18056,Kurang Penawaran,24256
MACHANG,KELANTAN,2024,7927,9063,2024,23900,28600,-15973,Kurang Penawaran,20673
PASIR MAS,KELANTAN,2024,9075,10736,2024,48500,60800,-39425,Kurang Penawaran,51725
PASIR PUTEH,KELANTAN,2024,4419,6118,2024,27900,36800,-23481,Kurang Penawaran,32381
TANAH MERAH,KELANTAN,2024,8223,9347,2024,32700,38200,-24477,Kurang Penawaran,29977
TUMPAT,KELANTAN,2024,7691,8441,2024,37200,46700,-29509,Kurang Penawaran,39009
KANGAR,PERLIS,2024,27978,31148,2024,94900,78600,-66922,Kurang Penawaran,50622
BEAUFORT,SABAH,2024,3096,3565,2024,19000,20200,-15904,Kurang Penawaran,17104
BELURAN,SABAH,2024,808,1002,2024,20900,24700,-20092,Kurang Penawaran,23892
KENINGAU,SABAH,2024,6595,8982,2024,37100,40600,-30505,Kurang Penawaran,34005
KINABATANGAN,SABAH,2024,437,623,2024,34100,34700,-33663,Kurang Penawaran,34263
KOTA BELUD,SABAH,2024,1304,1304,2024,21700,22500,-20396,Kurang Penawaran,21196
KOTA KINABALU,SABAH,2024,69966,86779,2024,133500,129000,-63534,Kurang Penawaran,59034
KOTA MARUDU,SABAH,2024,1943,2389,2024,17000,20000,-15057,Kurang Penawaran,18057
KOTA PENYU,SABAH,2024,40,40,2024,5800,6700,-5760,Kurang Penawaran,6660
KUDAT,SABAH,2024,2904,2974,2024,19700,21700,-16796,Kurang Penawaran,18796
KUNAK,SABAH,2024,1284,1308,2024,12500,14200,-11216,Kurang Penawaran,12916
LAHAD DATU,SABAH,2024,10923,11053,2024,51300,51300,-40377,Kurang Penawaran,40377
NABAWAN,SABAH,2024,60,60,2024,5800,6600,-5740,Kurang Penawaran,6540
PAPAR,SABAH,2024,14298,18976,2024,36500,41100,-22202,Kurang Penawaran,26802
PENAMPANG,SABAH,2024,30944,33611,2024,48500,50200,-17556,Kurang Penawaran,19256
PITAS,SABAH,2024,118,558,2024,9200,10800,-9082,Kurang Penawaran,10682
PUTATAN,SABAH,2024,7846,8708,2024,18300,19400,-10454,Kurang Penawaran,11554
RANAU,SABAH,2024,965,1054,2024,17100,19000,-16135,Kurang Penawaran,18035
SANDAKAN,SABAH,2024,41780,43761,2024,101400,107000,-59620,Kurang Penawaran,65220
SEMPORNA,SABAH,2024,3048,3131,2024,33900,37000,-30852,Kurang Penawaran,33952
SIPITANG,SABAH,2024,327,480,2024,9000,9700,-8673,Kurang Penawaran,9373
TAMBUNAN,SABAH,2024,31,275,2024,7700,7900,-7669,Kurang Penawaran,7869
TAWAU,SABAH,2024,30494,31148,2024,90600,96000,-60106,Kurang Penawaran,65506
TENOM,SABAH,2024,1082,1082,2024,11400,13100,-10318,Kurang Penawaran,12018
TONGOD,SABAH,2024,0,0,2024,11100,11900,-11100,Kurang Penawaran,11900
TUARAN,SABAH,2024,15397,15397,2024,33600,38600,-18203,Kurang Penawaran,23203
BETONG,SARAWAK,2024,2998,3231,2024,20300,28600,-17302,Kurang Penawaran,25602
BINTULU,SARAWAK,2024,22487,24181,2024,63300,70800,-40813,Kurang Penawaran,48313
KAPIT,SARAWAK,2024,1161,1357,2024,20700,30000,-19539,Kurang Penawaran,28839
KUCHING,SARAWAK,2024,124769,136731,2024,173900,234700,-49131,Kurang Penawaran,109931
LIMBANG,SARAWAK,2024,3776,3838,2024,20900,26600,-17124,Kurang Penawaran,22824
MIRI,SARAWAK,2024,47539,49151,2024,92500,126400,-44961,Kurang Penawaran,78861
MUKAH,SARAWAK,2024,2156,2580,2024,34100,42100,-31944,Kurang Penawaran,39944
SAMARAHAN,SARAWAK,2024,31249,35605,2024,70200,77000,-38951,Kurang Penawaran,45751
SARIKEI,SARAWAK,2024,8268,8890,2024,23900,37800,-15632,Kurang Penawaran,29532
SERIAN,SARAWAK,2024,5043,5922,2024,29600,43700,-24557,Kurang Penawaran,38657
SIBU,SARAWAK,2024,40959,42481,2024,87500,119800,-46541,Kurang Penawaran,78841
SRI AMAN,SARAWAK,2024,5905,6022,2024,19500,28400,-13595,Kurang Penawaran,22495`;

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

  useEffect(() => {
    const { headers, rows } = parseCSV(RAW_CSV_DATA);
    setCsvData({ headers, rows, fileName: "NAPIC_Housing_Adequacy_2024.csv" });
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !csvData) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `Anda ialah Agent Analitik Chatbot Pintar untuk data NAPIC.
Data anda mengandungi maklumat Kecukupan Penawaran Perumahan 2024 mengikut daerah dan negeri.
Fakta Utama Data:
- "BIL UNIT NAPIC SEMASA": Unit sedia ada.
- "Kecukupan_NAPIC": Jurang antara unit sedia ada dan keperluan (negatif bermaksud kurang).
- "Tahap_NAPIC": Status (Kurang atau Lebih Penawaran).
- "Perumahan_tidakformal_semasa": Bilangan unit tidak formal.

Tugas anda:
1. Jawab soalan pengguna dengan merujuk data CSV ini.
2. Berikan analisis yang tepat tentang daerah yang disebut.
3. Gunakan Bahasa Malaysia yang profesional dan ramah.
4. Jika ditanya tentang perbandingan, buat jadual ringkas atau senarai poin.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMessage,
        config: { systemInstruction, temperature: 0.2 }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Maaf, ralat berlaku." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Ralat sambungan. Sila cuba lagi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.trim().startsWith('|')) return <div key={i} className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre bg-indigo-50/50 p-2 rounded border border-indigo-100 mb-2">{line}</div>;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return <p key={i} className="mb-2 text-sm leading-relaxed">{parts.map((part, j) => (part.startsWith('**') && part.endsWith('**')) ? <strong key={j} className="text-indigo-800 font-bold">{part.slice(2, -2)}</strong> : part)}</p>;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-gray-900">
      {/* Header Ringkas */}
      <header className="bg-indigo-700 text-white p-4 shadow-md flex justify-between items-center z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl"><Building2 className="w-6 h-6" /></div>
          <div>
            <h1 className="text-lg font-black leading-none tracking-tight">AI Analitik Chatbot</h1>
            <p className="text-[10px] text-indigo-200 mt-1 uppercase font-bold tracking-widest">Pusat Data Perumahan NAPIC</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-indigo-800/50 border border-indigo-400/30 px-3 py-1.5 rounded-full text-[10px] font-bold">
          <Database className="w-3 h-3 text-indigo-200" />
          <span>DATA AKTIF</span>
        </div>
      </header>

      {/* Kontainer Chat Utama */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full border-x border-gray-100 shadow-sm">
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-gray-50/30">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
              <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border-2 ${m.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-gray-100 text-indigo-600'}`}>
                  {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-5 rounded-3xl text-sm shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                  {renderContent(m.content)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center animate-pulse">
                   <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                </div>
                <span className="text-xs text-gray-500 font-bold italic">Sedang memproses data analitik...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bahagian Input Chat */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-3 bg-gray-50 p-4 rounded-3xl border border-gray-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all shadow-sm">
              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                placeholder="Tanya apa sahaja tentang data NAPIC..." 
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-40 min-h-[50px] py-2 text-gray-700 text-sm" 
                disabled={isLoading} 
              />
              <button 
                onClick={handleSendMessage} 
                disabled={isLoading || !input.trim()} 
                className={`p-3.5 rounded-2xl transition-all shrink-0 shadow-md flex items-center justify-center ${isLoading || !input.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Suggestions */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2"><Sparkles className="w-3 h-3" /> Cadangan:</div>
              {["Status di Petaling?", "Daerah paling kritikal?", "Unit Johor Bahru?", "Perumahan tidak formal?"].map(q => (
                <button key={q} onClick={() => setInput(q)} className="bg-white text-indigo-600 border border-indigo-100 px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; } 
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;