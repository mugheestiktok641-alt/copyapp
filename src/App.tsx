import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  PenTool, 
  Settings, 
  Copy, 
  RotateCcw, 
  Sparkles, 
  Check, 
  X,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Tone Options
const TONES = [
  "Professional", 
  "Casual", 
  "Friendly", 
  "Persuasive", 
  "Urgent"
];

// Copy Type Options
const COPY_TYPES = [
  "Facebook Ad", 
  "Instagram Caption", 
  "Email Newsletter", 
  "Product Description", 
  "Sales Page", 
  "WhatsApp Message"
];

export default function App() {
  // Form State
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [copyType, setCopyType] = useState(COPY_TYPES[0]);
  
  // App State
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize custom API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('copygen_api_key');
    if (savedKey) setCustomApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('copygen_api_key', customApiKey);
    setShowSettings(false);
  };

  const handleReset = () => {
    setBusinessName('');
    setDescription('');
    setAudience('');
    setTone(TONES[0]);
    setCopyType(COPY_TYPES[0]);
    setGeneratedCopy('');
    setError(null);
  };

  const handleCopy = () => {
    if (!generatedCopy) return;
    navigator.clipboard.writeText(generatedCopy);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const generateCopy = async () => {
    if (!description || !businessName) {
      setError('Please fill in at least the business name and description.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedCopy('');

    try {
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API Key is missing. Please add it in settings.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        You are a world-class copywriter. Write a high-converting ${copyType} for a business called "${businessName}".
        
        Business Context: ${description}
        Target Audience: ${audience || 'General public'}
        Tone: ${tone}
        
        Additional Instructions:
        - Make it highly engaging and tailored to the chosen copy type.
        - Use emojis if appropriate for the tone/platform.
        - Focus on benefits, not just features.
        - Include a clear call-to-action (CTA).
        - Do not include any meta-commentary, just the final copy.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt.trim(),
      });

      const text = response.text;
      if (text) {
        setGeneratedCopy(text);
      } else {
        throw new Error('The AI failed to generate copy. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please check your API key and connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-8 selection:bg-blue-500/30 flex flex-col">
      {/* Container */}
      <div className="max-w-3xl w-full mx-auto flex flex-col bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden min-h-[600px]">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <PenTool className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              CopyGen <span className="text-blue-500">Pro</span>
            </h1>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors group text-slate-400"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 group-hover:text-white transition-colors" />
          </button>
        </header>

        {/* Main Content Card Scroll Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 space-y-8">
          
          <main className="space-y-8">
            {/* Inputs Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="business-name">
                    Business Name
                  </label>
                  <input 
                    id="business-name"
                    type="text"
                    placeholder="e.g. Lumina Bloom Florals"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-600 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="description">
                    Product Description
                  </label>
                  <textarea 
                    id="description"
                    rows={3}
                    placeholder="What are you selling? Describe the key benefits..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-600 text-sm resize-none"
                  />
                </div>

                {/* Target Audience */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="audience">
                    Target Audience
                  </label>
                  <input 
                    id="audience"
                    type="text"
                    placeholder="e.g. Eco-conscious wedding planners"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-600 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Dropdowns Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Tone
                    </label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none text-sm cursor-pointer"
                    >
                      {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Copy Type
                    </label>
                    <select 
                      value={copyType}
                      onChange={(e) => setCopyType(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none text-sm cursor-pointer"
                    >
                      {COPY_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={generateCopy}
                    disabled={isLoading}
                    className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
                      isLoading 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 active:scale-[0.98]'
                    }`}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Magic Copy</span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleReset}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      Clear All
                    </button>
                    <button 
                      onClick={handleCopy}
                      disabled={!generatedCopy}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {copyFeedback ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copyFeedback ? 'Copied!' : 'Copy Result'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-start gap-3"
              >
                <X className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Output Section */}
            <AnimatePresence>
              {generatedCopy && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col min-h-0 bg-slate-900/80 rounded-2xl border border-slate-700 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Generated Preview</h3>
                    <span className="text-[10px] text-slate-500 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Ready to post
                    </span>
                  </div>
                  <div className="overflow-y-auto pr-2 text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {generatedCopy}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
        
        {/* Footer / API Key Indicator */}
        <footer className="bg-slate-900/40 px-6 py-3 flex items-center justify-between border-t border-slate-700">
          <div className="text-[10px] text-slate-500 font-mono uppercase">
            Engine: Gemini-3-Flash
          </div>
          <div className="text-[10px] flex items-center space-x-2 text-slate-400">
            <span className={`px-2 py-0.5 rounded-full border ${customApiKey || process.env.GEMINI_API_KEY ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'}`}>
              {customApiKey || process.env.GEMINI_API_KEY ? 'API Key Active' : 'API Key Missing'}
            </span>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  API Settings
                </h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              
              <form onSubmit={handleSaveApiKey} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Gemini API Key
                  </label>
                  <input 
                    type="password"
                    placeholder="Enter your API key"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white h-12"
                  />
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Your key is saved locally in your browser. If left empty, it will try to use the system default.
                  </p>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
