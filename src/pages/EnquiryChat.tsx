import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMessages, sendMessage } from '../services/firestore';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { ChatMessage, Enquiry, BusinessListing } from '../types';
import Navbar from '../components/Navbar';
import { Send, ArrowLeft, Loader2, ShieldCheck, User } from 'lucide-react';
import { cn } from '../lib/utils';

const EnquiryChat: React.FC = () => {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (!enquiryId || !user) return;

    const loadEnquiry = async () => {
      const enqRef = doc(db, "enquiries", enquiryId);
      const enqSnap = await getDoc(enqRef);
      if (enqSnap.exists()) {
        const enqData = { id: enqSnap.id, ...enqSnap.data() } as Enquiry;
        setEnquiry(enqData);
        
        const bizRef = doc(db, "businesses", enqData.businessId);
        const bizSnap = await getDoc(bizRef);
        if (bizSnap.exists()) {
          setBusiness({ id: bizSnap.id, ...bizSnap.data() } as BusinessListing);
        }
      }
      setLoading(false);
    };

    loadEnquiry();

    const unsubscribe = getMessages(enquiryId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [enquiryId, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !enquiryId || !enquiry || !user) return;

    const receiverId = user.uid === enquiry.acquirerId ? enquiry.ownerId : enquiry.acquirerId;
    const text = inputText;
    setInputText('');
    
    try {
      await sendMessage(enquiryId, text, receiverId);
    } catch (error) {
      console.error(error);
      alert("Failed to transmit message.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-12 h-12 text-royal-blue animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col">
        {/* Header */}
        <header className="bg-white p-8 rounded-t-[40px] border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-royal-blue transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-royal-blue tracking-tight">
                {business?.title || "Asset Negotiation"}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-2">
                <ShieldCheck size={12} className="text-green-500" />
                Secure Protocol Active
              </p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 bg-white border-x border-slate-100 p-8 overflow-y-auto space-y-6">
          {/* Initial Message */}
          <div className="flex justify-center mb-10">
             <div className="max-w-md bg-royal-blue/5 p-6 rounded-3xl text-center border border-royal-blue/10">
                <p className="text-xs font-bold text-royal-blue mb-2 uppercase tracking-widest">Enquiry Initiation</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{enquiry?.message}"</p>
             </div>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex w-full mb-4",
                msg.senderId === user?.uid ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[75%] p-5 rounded-[24px] shadow-sm font-medium text-sm leading-relaxed",
                  msg.senderId === user?.uid 
                    ? "bg-royal-blue text-white rounded-tr-none" 
                    : "bg-[#F9FAFB] text-slate-700 border border-slate-100 rounded-tl-none"
                )}
              >
                {msg.text}
                <div className={cn(
                  "text-[8px] mt-2 font-black uppercase tracking-widest",
                  msg.senderId === user?.uid ? "text-blue-200" : "text-slate-300"
                )}>
                  {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <footer className="bg-white p-8 rounded-b-[40px] border border-slate-100 shadow-xl border-t-0">
          <form onSubmit={handleSend} className="flex gap-4">
            <input 
              type="text"
              placeholder="Enter executive transmission..."
              className="flex-1 bg-[#F9FAFB] border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-royal-blue/30 font-bold text-royal-blue"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="bg-royal-blue text-white p-4 rounded-2xl hover:bg-blue-800 shadow-xl shadow-royal-blue/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={24} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default EnquiryChat;
