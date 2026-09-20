import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Volume2,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export default function SahayakAssistant({ family, lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: lang === 'gu'
        ? `નમસ્તે! હું 'સહાયક' છું - ગુજરાત કુટુંબ પોર્ટલ AI મદદનીશ. તમારા પરિવાર ID #${family?.familyIdNumber || ''} માટે કઈ સરકારી યોજનાનો લાભ મળી શકે તે પૂછો.`
        : `Namaste! I am 'Sahayak', your Gujarat Kutumb AI Assistant. Ask me anything about schemes, eligibility, or benefits for Family ID #${family?.familyIdNumber || ''}.`
    }
  ]);

  const quickQuestions = [
    {
      label: "દીકરીની સ્કોલરશિપ (Girl Scholarship)",
      query: "મારી દીકરી 11મા સાયન્સમાં છે, શું સહાય મળશે?"
    },
    {
      label: "વિધવા પેન્શન (Widow Pension)",
      query: "ગંગા સ્વરૂપા વિધવા સહાય યોજના માટે શું શરતો છે?"
    },
    {
      label: "આવક ચકાસણી (Income Verification)",
      query: "મારું આવક પ્રમાણપત્ર ક્યારે ચકાસવામાં આવશે?"
    },
    {
      label: "કિસાન સહાય (Farmer Subsidy)",
      query: "ખેતીની જમીન પર કઈ સરકારી સહાય ઉપલબ્ધ છે?"
    }
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    // Append user message
    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInputQuery("");

    // Generate intelligent contextual response based on current family
    setTimeout(() => {
      let botReply = "";
      const q = query.toLowerCase();

      if (q.includes("દીકરી") || q.includes("સાયન્સ") || q.includes("scholarship") || q.includes("સહાય")) {
        const student = family?.members?.find(m => m.gender === 'FEMALE' && (m.educationLevel?.includes('Science') || m.educationLevel?.includes('Class')));
        if (student) {
          botReply = `તમારા પરિવારમાં ${student.fullName} નોંધાયેલ છે. તેઓ 'નમો સરસ્વતી વિજ્ઞાન સાધના યોજના' હેઠળ ₹25,000 અથવા 'નમો લક્ષ્મી યોજના' હેઠળ ₹50,000 સુધીની સહાય માટે પાત્ર છે. તમે 'યોજના પાસબુક' માંથી ૧-ક્લિકમાં અરજી કરી શકો છો.`;
        } else {
          botReply = `ગુજરાત સરકાર દ્વારા ધોરણ ૯ થી ૧૨ ની કન્યાઓ માટે 'નમો લક્ષ્મી' (₹૫૦,૦૦૦) અને ૧૧-૧૨ વિજ્ઞાન પ્રવાહ માટે 'નમો સરસ્વતી' (₹૨૫,૦૦૦) યોજના ઉપલબ્ધ છે.`;
        }
      } else if (q.includes("વિધવા") || q.includes("widow") || q.includes("પેન્શન")) {
        botReply = `ગંગા સ્વરૂપા (વિધવા સહાય) યોજના હેઠળ દર મહિને ₹1,250 સીધા બેંક ખાતામાં જમા થાય છે. વાર્ષિક આવક મર્યાદા ₹1,20,000 છે. જો પરિવારમાં વિધવા બહેન નોંધાયેલ હોય તો આપોઆપ પેન્શન મંજૂર થાય છે.`;
      } else if (q.includes("આવક") || q.includes("income") || q.includes("verification")) {
        if (family?.incomeVerificationStatus === 'VERIFIED') {
          botReply = `તમારા પરિવારની આવક (₹${Number(family.declaredAnnualIncome).toLocaleString('en-IN')}) મામલતદાર કચેરી દ્વારા સફળતાપૂર્વક પ્રમાણિત થયેલ છે! તમે તમામ BPL અને આવક આધારિત યોજનાઓનો લાભ લઈ શકો છો.`;
        } else {
          botReply = `તમારું આવક પ્રમાણપત્ર હાલ તાલુકા વિકાસ અધિકારી (TDO) / મામલતદારની ચકાસણી હેઠળ છે. ચકાસણી પૂર્ણ થતાં જ અટકેલી યોજનાઓ આપોઆપ અનલૉક થઈ જશે.`;
        }
      } else if (q.includes("ખેતી") || q.includes("કિસાન") || q.includes("land") || q.includes("farmer")) {
        if (family?.hasAgriLand) {
          botReply = `તમારા પરિવાર પાસે ${family.landSizeAcres} એકર જમીન નોંધાયેલ છે. તમે 'મુખ્યમંત્રી કિસાન સહાય યોજના' હેઠળ કુદરતી આપત્તિમાં પાક નુકસાન સામે હેક્ટર દીઠ ₹20,000 સુધીની સહાય માટે પાત્ર છો.`;
        } else {
          botReply = `મુખ્યમંત્રી કિસાન સહાય યોજના માટે ખેતીની જમીન હોવી જરૂરી છે. તમારા પરિવાર પ્રોફાઇલમાં જમીન નોંધાયેલ નથી.`;
        }
      } else {
        botReply = `તમારા પ્રશ્ન માટે આભાર. ગુજરાત કુટુંબ પોર્ટલ પર પરિવાર ID #${family?.familyIdNumber} હેઠળ કુલ ${(family?.members || []).length} સભ્યો નોંધાયેલા છે. તમે તમારી 'યોજના પાસબુક' તપાસી શકો છો જ્યાં પાત્ર યોજનાઓ લીલા રંગમાં દર્શાવેલ છે.`;
      }

      setMessages([...newMessages, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#0f2b5c] hover:bg-[#091c3d] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition border-2 border-amber-400 group"
        >
          <Bot className="w-6 h-6 text-amber-300 group-hover:scale-110 transition" />
          <div className="text-left hidden sm:block pr-1">
            <span className="text-[10px] uppercase font-bold text-amber-300 block leading-none">
              AI Sahayak
            </span>
            <span className="text-xs font-bold text-white">
              સહાયક પૂછપરછ
            </span>
          </div>
        </button>
      )}

      {/* Floating Assistant Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white rounded-2xl border-2 border-[#0f2b5c] shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="bg-[#0f2b5c] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-amber-400 flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                  <span>સહાયક (Sahayak AI)</span>
                  <span className="bg-green-500 w-2 h-2 rounded-full inline-block animate-ping" />
                </h4>
                <span className="text-[10px] text-amber-200 block">
                  Gujarat Welfare Multi-Lingual Assistant
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Questions Pills */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 overflow-x-auto flex gap-1.5 scrollbar-none text-[11px]">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 rounded-full font-medium transition"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#f8fafc] text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0f2b5c] text-white rounded-br-none shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="યોજના વિશે પૂછો... / Ask about schemes..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border border-slate-300 rounded-full px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-800"
            />
            <button
              onClick={() => handleSend()}
              className="bg-[#0f2b5c] hover:bg-[#091c3d] text-white p-2 rounded-full transition shadow-xs flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
