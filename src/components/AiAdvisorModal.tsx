import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  BookOpen, 
  ClipboardCheck, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { FullPortfolioState } from '../types';
import { RCPCH_LEARNING_OUTCOMES } from '../data/rcpchCurriculum';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FullPortfolioState;
  initialLoId?: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  state,
  initialLoId,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${state.profile.name || 'Doctor'}! I am your RCPCH Progress+ Clinical & ARCP Portfolio Advisor. How can I help you stage your evidence, align cases with the 11 Learning Outcomes, or refine your reflections today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState(
    initialLoId ? `What are high-yield clinical case ideas and assessment strategies to evidence ${initialLoId} for my ${state.profile.curriculumLevel} ARCP?` : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    const newMsg: Message = {
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build conversation context
      const prompt = `
You are an expert RCPCH Paediatric Training Advisor and Educational Supervisor assisting a UK paediatric trainee.
Trainee Profile:
- Name: ${state.profile.name}
- Grade: ${state.profile.trainingGrade} (${state.profile.curriculumLevel})
- Hospital: ${state.profile.currentHospital}
- Target ARCP: ${state.profile.arcpDate}

Existing staged portfolio evidence:
- Total WPBAs: ${state.wpbas.length} (Types: ${state.wpbas.map(w => w.type).join(', ')})
- Total Reflections: ${state.reflections.length}
- Logged Procedures: ${state.procedureLogs.length}
- PDP Objectives: ${state.pdpGoals.length}

Trainee Question:
"${userText}"

Provide a concise, practical, and highly encouraging response tailored to the UK paediatric Progress+ curriculum, recommending specific WPBAs (Mini-CEX, CbD, DOPS, ACAT), Gibbs reflective structure, or clinical encounter opportunities.`;

      const res = await fetch('/api/gemini/curriculum-tagger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: prompt,
          type: 'Mini-CEX'
        })
      });
      const data = await res.json();

      let reply = '';
      if (data.data?.rationale) {
        reply = `${data.data.rationale}\n\n**Recommended Learning Outcomes:** ${data.data.recommendedTags?.join(', ') || 'LO1, LO4'}`;
      } else {
        reply = `For your ${state.profile.trainingGrade} level, consider presenting this in your next CbD or Mini-CEX. Focus on demonstrating leadership, differential diagnosis, and clear communication with the multidisciplinary team.`;
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Apologies, I encountered an issue connecting to the portfolio engine: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl h-[650px] max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0369a1] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                RCPCH Progress+ AI Educational Advisor
              </h2>
              <p className="text-[11px] text-slate-500">
                Grounded in RCPCH 11 Learning Outcomes & GMC Decision Aids
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === 'user'
                    ? 'bg-[#0369a1] text-white'
                    : 'bg-sky-50 border border-sky-200 text-[#0369a1]'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#0369a1] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div
                  className={`text-[9px] mt-1.5 ${
                    m.role === 'user' ? 'text-sky-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-[#0369a1] bg-white p-3 rounded-xl border border-slate-200 w-fit shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Progress+ curriculum mapping...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask about curriculum evidence, CbD case ideas, Gibbs reflection advice..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 bg-[#0369a1] hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
