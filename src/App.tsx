import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, PlusCircle, Trophy, LogOut, TrendingUp, 
  Users, DollarSign, Target, Menu, X, Crown, Activity, Wallet, Hash, 
  Star, Award, Zap, BarChart3, ArrowUpRight, ArrowDownRight, Sparkles,
  ChevronUp, Calendar, Clock, CheckCircle2, Edit3, Save, ChevronDown,
  Trash2, Search, Filter, History
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, BarChart, Bar, LineChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Supabase Configuration ---
const supabaseUrl = 'https://jfccjqjlqsvwyjdkelxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmY2NqcWpscXN2d3lqZGtlbHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjE0MzQsImV4cCI6MjA4MDU5NzQzNH0.yPFHKxKYMHpfIW5QVG4ubAjzf5rrqWQp-6Gjhf6fvUw';
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_ID = '43b1056f-50fd-40a0-9ccf-f2f4c4a57420';

// --- Types ---
interface Sale {
  id: string; user_id: string; created_by: string; sale_date: string;
  client_name: string; client_id: string; subscription_type: string; customer_type: string;
  amount: number; commission: number; is_split: boolean; partner_name?: string;
}

interface UserProfile {
  id: string; full_name: string; email: string; is_admin: boolean;
  financial_target: number; quantity_target: number;
}

// --- Helpers ---
const getMonthOptions = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }),
      month: date.getMonth(),
      year: date.getFullYear()
    });
  }
  return months;
};

// --- Components ---
const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl p-6 relative overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

const StatCard = ({ title, value, icon: Icon, color, subText }: any) => {
  const gradients: any = {
    blue: "from-blue-600 to-cyan-400",
    purple: "from-purple-600 to-pink-500",
    green: "from-emerald-500 to-teal-400",
    orange: "from-orange-500 to-yellow-400",
    indigo: "from-indigo-600 to-blue-500"
  };
  
  return (
    <GlassCard className="group hover:border-slate-600 transition-all duration-300 hover:scale-[1.02]">
      <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${gradients[color]} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradients[color]} shadow-lg text-white`}>
            <Icon size={26} />
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
          {subText && <p className="text-xs text-slate-500 mt-2">{subText}</p>}
        </div>
      </div>
    </GlassCard>
  );
};

const ProgressBar = ({ current, target, label, color }: any) => {
  const percent = Math.min((current / (target || 1)) * 100, 100);
  const isComplete = percent >= 100;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-2 text-slate-300 font-medium">
        <span className="flex items-center gap-2">
          {label}
          {isComplete && <CheckCircle2 size={14} className="text-emerald-400" />}
        </span>
        <span className={`font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>{percent.toFixed(0)}%</span>
      </div>
      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percent}%` }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full ${color} shadow-lg relative`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
        <span>{current.toLocaleString()}</span>
        <span>יעד: {target?.toLocaleString()}</span>
      </div>
    </div>
  );
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{displayValue.toLocaleString()}</span>;
};

const EditTargetsModal = ({ isOpen, onClose, profile, onSave }: { 
  isOpen: boolean; onClose: () => void; profile: UserProfile | null; 
  onSave: (id: string, financial: number, quantity: number) => void;
}) => {
  const [financialTarget, setFinancialTarget] = useState(profile?.financial_target || 100000);
  const [quantityTarget, setQuantityTarget] = useState(profile?.quantity_target || 20);

  useEffect(() => {
    if (profile) {
      setFinancialTarget(profile.financial_target || 100000);
      setQuantityTarget(profile.quantity_target || 20);
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="text-blue-400" size={24} />
          עריכת יעדים - {profile.full_name || profile.email}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">יעד כספי חודשי (₪)</label>
            <input type="number" value={financialTarget} onChange={e => setFinancialTarget(Number(e.target.value))}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">יעד כמותי (עסקאות)</label>
            <input type="number" value={quantityTarget} onChange={e => setQuantityTarget(Number(e.target.value))}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { onSave(profile.id, financialTarget, quantityTarget); onClose(); }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
            <Save size={18} /> שמור
          </button>
          <button onClick={onClose} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition">ביטול</button>
        </div>
      </motion.div>
    </div>
  );
};

const SalesHistoryTable = ({ sales, onDelete, isAdmin }: { sales: Sale[], onDelete: (id: string) => void, isAdmin: boolean }) => {
  if (sales.length === 0) return <div className="text-center p-8 text-slate-500">אין מכירות להצגה בתקופה זו</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/50 text-slate-400 font-medium uppercase text-xs">
          <tr>
            <th className="p-4 text-right">תאריך</th>
            <th className="p-4 text-right">לקוח</th>
            {isAdmin && <th className="p-4 text-right">נציג</th>}
            <th className="p-4 text-right">סוג</th>
            <th className="p-4 text-left">סכום</th>
            <th className="p-4 text-left">בונוס</th>
            <th className="p-4 text-center">פעולות</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50 text-slate-300">
          {sales.map(sale => (
            <tr key={sale.id} className="hover:bg-white/5 transition-colors group">
              <td className="p-4">{new Date(sale.sale_date).toLocaleDateString('he-IL')}</td>
              <td className="p-4 font-bold text-white">
                {sale.client_name}
                {sale.is_split && <span className="block text-[10px] text-purple-400 font-normal">{sale.partner_name ? `שותף: ${sale.partner_name}` : 'עסקה משותפת'}</span>}
              </td>
              {isAdmin && <td className="p-4 text-slate-400">TODO: Get Name</td>} 
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs ${sale.customer_type === 'חדש' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'}`}>
                  {sale.customer_type}
                </span>
              </td>
              <td className="p-4 text-left font-mono">₪{sale.amount.toLocaleString()}</td>
              <td className="p-4 text-left font-mono text-emerald-400 font-bold">₪{Math.round(sale.commission).toLocaleString()}</td>
              <td className="p-4 text-center">
                <button 
                  onClick={() => onDelete(sale.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="מחק עסקה"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  
  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // Sales Form State
  const [amount, setAmount] = useState('');
  const [client, setClient] = useState('');
  const [clientId, setClientId] = useState('');
  const [subType, setSubType] = useState('שנתי');
  const [custType, setCustType] = useState('חדש');
  const [isSplit, setIsSplit] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [selectedSalesRep, setSelectedSalesRep] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Admin History Filter State
  const [historyRepFilter, setHistoryRepFilter] = useState('all');

  const isAdmin = session?.user?.id === ADMIN_ID;
  const salesReps = profiles.filter(p => p.id !== ADMIN_ID);
  const selectedMonthData = monthOptions.find(m => m.value === selectedMonth) || monthOptions[0];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(); else { setSales([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    const { data: profData } = await supabase.from('profiles').select('*');
    const { data: { user } } = await supabase.auth.getUser();
    if (profData) {
      setProfiles(profData);
      const me = profData.find((p: any) => p.id === user?.id);
      setMyProfile(me || null);
      if (me) setTempName(me.full_name || '');
    }
    const { data: salesData } = await supabase.from('sales').select('*');
    if (salesData) setSales(salesData);
  };

  const handleUpdateName = async (name: string) => {
    if (!myProfile || !name.trim()) return;
    await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', myProfile.id);
    setIsEditingName(false);
    fetchData();
  };

  const handleUpdateTargets = async (userId: string, financialTarget: number, quantityTarget: number) => {
    await supabase.from('profiles').update({ financial_target: financialTarget, quantity_target: quantityTarget }).eq('id', userId);
    fetchData();
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק עסקה זו? הפעולה לא ניתנת לביטול.')) return;
    
    const { error } = await supabase.from('sales').delete().eq('id', saleId);
    if (error) {
      alert('שגיאה במחיקת העסקה: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    if (isAdmin && !selectedSalesRep) { alert('יש לבחור איש מכירות'); setFormLoading(false); return; }
    
    const numAmount = parseFloat(amount);
    const amountNoVat = numAmount / 1.18;
    const rate = custType === 'חדש' ? 0.02 : 0.01;
    let commission = amountNoVat * rate;
    if (isSplit) commission /= 2;
    
    const date = new Date().toISOString();
    const targetUserId = isAdmin ? selectedSalesRep : session.user.id;
    const targetUserName = isAdmin ? profiles.find(p => p.id === selectedSalesRep)?.full_name : myProfile?.full_name;
    
    const toInsert: any[] = [{
      user_id: targetUserId, created_by: session.user.id, sale_date: date,
      client_name: client, client_id: clientId, subscription_type: subType, customer_type: custType,
      amount: numAmount, commission, is_split: isSplit,
      partner_name: isSplit ? profiles.find(u => u.id === partnerId)?.full_name : null
    }];

    if (isSplit && partnerId) {
      toInsert.push({
        user_id: partnerId, created_by: session.user.id, sale_date: date,
        client_name: client + ` (שותף: ${targetUserName})`, client_id: clientId,
        subscription_type: subType, customer_type: custType,
        amount: numAmount, commission, is_split: isSplit, partner_name: targetUserName
      });
    }

    const { error } = await supabase.from('sales').insert(toInsert);
    if (!error) {
      setAmount(''); setClient(''); setClientId(''); setIsSplit(false); 
      setSubType('שנתי'); setCustType('חדש'); setSelectedSalesRep(''); setPartnerId('');
      fetchData();
      setActiveTab(isAdmin ? 'admin' : 'dashboard'); 
    } else { alert(error.message); }
    setFormLoading(false);
  };

  // --- Filter Logic ---
  const getFilteredSales = (userId?: string) => {
    return sales.filter(s => {
      const saleDate = new Date(s.sale_date);
      const monthMatch = saleDate.getMonth() === selectedMonthData.month && 
                         saleDate.getFullYear() === selectedMonthData.year;
      
      if (userId) return monthMatch && s.user_id === userId;
      return monthMatch && s.user_id !== ADMIN_ID; // General list excludes admin test sales usually
    });
  };

  const monthSales = getFilteredSales(); 

  const mySales = sales.filter(s => 
    s.user_id === session?.user?.id && 
    new Date(s.sale_date).getMonth() === selectedMonthData.month &&
    new Date(s.sale_date).getFullYear() === selectedMonthData.year
  ).sort((a,b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());

  // Calculations
  const myTotalCommission = mySales.reduce((acc, curr) => acc + curr.commission, 0);
  const myTotalSales = mySales.reduce((acc, curr) => acc + curr.amount, 0);
  const myTotalDeals = mySales.length;

  const companyTotal = monthSales.reduce((acc, curr) => acc + curr.amount, 0);
  const companyTotalNoVat = monthSales.reduce((acc, curr) => acc + (curr.amount / 1.18), 0);
  const companyCommission = monthSales.reduce((acc, curr) => acc + curr.commission, 0);
  const companyDeals = monthSales.length;

  // Chart Data
  const trendData = Object.entries(mySales.reduce((acc: any, curr) => {
    const d = new Date(curr.sale_date).getDate(); 
    acc[d] = (acc[d] || 0) + curr.commission;
    return acc;
  }, {})).map(([d, a]) => ({ name: d, amount: a })).sort((a: any, b: any) => parseInt(a.name) - parseInt(b.name));

  const pieData = [
    { name: 'רגיל', value: mySales.filter(s => !s.is_split).length }, 
    { name: 'משותף', value: mySales.filter(s => s.is_split).length }
  ];

  const repPerformance = salesReps.map(rep => {
    const repSales = monthSales.filter(s => s.user_id === rep.id);
    const total = repSales.reduce((a, b) => a + b.amount, 0);
    const totalNoVat = repSales.reduce((a, b) => a + (b.amount / 1.18), 0);
    const bonus = repSales.reduce((a, b) => a + b.commission, 0);
    const deals = repSales.length;
    const quantityProgress = (deals / (rep.quantity_target || 20)) * 100;
    return { ...rep, total, totalNoVat, bonus, deals, quantityProgress };
  }).sort((a, b) => b.totalNoVat - a.totalNoVat);

  const companyTrendData = Object.entries(monthSales.reduce((acc: any, curr) => {
    const d = new Date(curr.sale_date).getDate();
    acc[d] = (acc[d] || 0) + (curr.amount / 1.18);
    return acc;
  }, {})).map(([d, a]) => ({ name: `${d}`, amount: a })).sort((a: any, b: any) => parseInt(a.name) - parseInt(b.name));

  // Admin History Filter Logic
  const adminHistorySales = sales.filter(s => {
    const saleDate = new Date(s.sale_date);
    const monthMatch = saleDate.getMonth() === selectedMonthData.month && 
                       saleDate.getFullYear() === selectedMonthData.year;
    const repMatch = historyRepFilter === 'all' || s.user_id === historyRepFilter;
    return monthMatch && repMatch && s.user_id !== ADMIN_ID;
  }).sort((a,b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());

  // --- Render ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>
        <GlassCard className="w-full max-w-md z-10 !bg-[#1e293b]/60 backdrop-blur-2xl border-slate-700/50 p-8 mx-4">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <Wallet size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">כמה הרווחתי?</h1>
            <p className="text-slate-400">התחבר למערכת הניהול המתקדמת</p>
          </div>
          <div className="space-y-5">
            <input className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white outline-none focus:border-blue-500" placeholder="אימייל" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white outline-none focus:border-blue-500" type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} />
            <div className="flex gap-4 pt-4">
              <button onClick={() => supabase.auth.signInWithPassword({ email, password })} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-blue-500/25">כניסה</button>
              <button onClick={() => supabase.auth.signUp({ email, password })} className="flex-1 bg-slate-800 text-slate-300 border border-slate-700 p-4 rounded-xl font-bold hover:bg-slate-700 transition">הרשמה</button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden selection:bg-blue-500/30" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      <EditTargetsModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} profile={editingProfile} onSave={handleUpdateTargets} />

      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#1e293b]/95 backdrop-blur-xl border-l border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl flex-shrink-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wallet size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl text-white tracking-wide">כמה הרווחתי?</h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">מערכת בונוסים</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {isAdmin ? (
              <>
                <button onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${activeTab === 'admin' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <Crown size={20} /><span>דשבורד ניהולי</span>
                </button>
                <button onClick={() => { setActiveTab('admin_history'); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${activeTab === 'admin_history' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <History size={20} /><span>היסטוריית מכירות</span>
                </button>
                <button onClick={() => { setActiveTab('add_sale'); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${activeTab === 'add_sale' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <PlusCircle size={20} /><span>הוספת מכירה</span>
                </button>
                <button onClick={() => { setActiveTab('leaderboard'); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${activeTab === 'leaderboard' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <Trophy size={20} /><span>טבלת מובילים</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <LayoutDashboard size={20} /><span>לוח בקרה</span>
                </button>
                <button onClick={() => { setActiveTab('add_sale'); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${activeTab === 'add_sale' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <PlusCircle size={20} /><span>הוספת מכירה</span>
                </button>
                <button onClick={() => { setActiveTab('leaderboard'); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${activeTab === 'leaderboard' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <Trophy size={20} /><span>טבלת מובילים</span>
                </button>
              </>
            )}
          </nav>

          <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${isAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                {isAdmin ? <Crown size={18} /> : (myProfile?.full_name?.[0] || 'U')}
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input value={tempName} onChange={e => setTempName(e.target.value)} className="flex-1 p-1 bg-slate-800 border border-slate-600 rounded text-sm text-white outline-none min-w-0" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdateName(tempName); if (e.key === 'Escape') setIsEditingName(false); }} />
                    <button onClick={() => handleUpdateName(tempName)} className="text-emerald-400 hover:text-emerald-300"><Save size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate text-white">{myProfile?.full_name || 'משתמש'}</p>
                    <button onClick={() => setIsEditingName(true)} className="text-slate-500 hover:text-blue-400 flex-shrink-0"><Edit3 size={12} /></button>
                  </div>
                )}
                <p className="text-xs text-slate-500">{isAdmin ? 'מנהל מערכת' : 'נציג מכירות'}</p>
              </div>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 p-2 text-sm transition-colors">
              <LogOut size={16} /> יציאה
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative w-full">
        <header className="lg:hidden bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-2"><Wallet size={20} className="text-blue-500" /><h1 className="font-bold text-lg text-white">כמה הרווחתי?</h1></div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300"><Menu size={24} /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 w-full">
          <div className="w-full space-y-8">
            
            {activeTab === 'admin_history' && isAdmin && (
               <div className="space-y-6 animate-fade-in">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                     <h2 className="text-3xl font-black text-white flex items-center gap-3">
                       <History className="text-blue-400" /> היסטוריית מכירות
                     </h2>
                     <p className="text-slate-400 mt-1">צפייה וניהול כלל העסקאות בארגון</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
                        <Filter size={16} className="text-slate-400" />
                        <select 
                          value={historyRepFilter} 
                          onChange={(e) => setHistoryRepFilter(e.target.value)}
                          className="bg-transparent text-white outline-none border-none text-sm"
                        >
                          <option value="all" className="bg-slate-900 text-white">כל הנציגים</option>
                          {salesReps.map(rep => (
                            <option key={rep.id} value={rep.id} className="bg-slate-900 text-white">{rep.full_name || rep.email}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
                        <Calendar size={16} className="text-slate-400" />
                        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent text-white outline-none border-none text-sm">
                          {monthOptions.map(m => <option key={m.value} value={m.value} className="bg-slate-900">{m.label}</option>)}
                        </select>
                      </div>
                   </div>
                 </div>

                 <GlassCard className="p-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50 bg-slate-900/30 flex justify-between items-center">
                       <div className="text-sm text-slate-400">נמצאו {adminHistorySales.length} עסקאות</div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 font-medium uppercase text-xs">
                          <tr>
                            <th className="p-4 text-right">תאריך</th>
                            <th className="p-4 text-right">נציג</th>
                            <th className="p-4 text-right">לקוח</th>
                            <th className="p-4 text-right">סוג</th>
                            <th className="p-4 text-left">סכום</th>
                            <th className="p-4 text-left">בונוס</th>
                            <th className="p-4 text-center">פעולות</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 text-slate-300">
                          {adminHistorySales.map(sale => {
                            const repName = profiles.find(p => p.id === sale.user_id)?.full_name || 'לא ידוע';
                            return (
                              <tr key={sale.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">{new Date(sale.sale_date).toLocaleDateString('he-IL')}</td>
                                <td className="p-4 font-bold text-white">{repName}</td>
                                <td className="p-4">
                                  {sale.client_name}
                                  {sale.is_split && <span className="block text-[10px] text-purple-400 font-normal">עסקה משותפת</span>}
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${sale.customer_type === 'חדש' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                    {sale.customer_type}
                                  </span>
                                </td>
                                <td className="p-4 text-left font-mono">₪{sale.amount.toLocaleString()}</td>
                                <td className="p-4 text-left font-mono text-emerald-400 font-bold">₪{Math.round(sale.commission).toLocaleString()}</td>
                                <td className="p-4 text-center">
                                  <button 
                                    onClick={() => handleDeleteSale(sale.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="מחק עסקה"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {adminHistorySales.length === 0 && (
                            <tr><td colSpan={7} className="text-center p-8 text-slate-500">לא נמצאו מכירות תואמות לסינון</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </GlassCard>
               </div>
            )}

            {(activeTab === 'admin' || (isAdmin && activeTab === 'dashboard')) && isAdmin && (
              <div className="space-y-8 animate-fade-in">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900/50 to-indigo-900/50 p-6 lg:p-12 border border-blue-500/20">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-amber-500/30">
                          <Crown size={16} /> מרכז בקרה ניהולי
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black text-white mb-2">שלום, {myProfile?.full_name || 'מנהל'} 👋</h1>
                        <div className="flex items-center gap-3 mt-4">
                          <Calendar size={18} className="text-slate-400" />
                          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 cursor-pointer">
                            {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-white/5 backdrop-blur-sm p-4 lg:p-6 rounded-2xl border border-white/10 text-center min-w-[120px]">
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">עסקאות</p>
                          <p className="text-3xl lg:text-4xl font-black text-white"><AnimatedNumber value={companyDeals} /></p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-4 lg:p-6 rounded-2xl border border-white/10 text-center min-w-[140px]">
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">מחזור (ללא מע"מ)</p>
                          <p className="text-3xl lg:text-4xl font-black text-emerald-400">₪<AnimatedNumber value={Math.round(companyTotalNoVat)} /></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <StatCard title="מחזור כולל (כולל מע״מ)" value={`₪${companyTotal.toLocaleString()}`} icon={TrendingUp} color="blue" subText="סה״כ עסקאות" />
                  <StatCard title="מחזור נטו (ללא מע״מ)" value={`₪${Math.round(companyTotalNoVat).toLocaleString()}`} icon={BarChart3} color="indigo" subText="לפני מע״מ" />
                  <StatCard title="סה״כ בונוסים לתשלום" value={`₪${Math.round(companyCommission).toLocaleString()}`} icon={Wallet} color="green" subText="עמלות לנציגים" />
                  <StatCard title="כמות עסקאות" value={companyDeals} icon={Target} color="purple" subText={`${salesReps.length} נציגים פעילים`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <GlassCard className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                      <h3 className="font-bold text-lg text-white flex items-center gap-2"><Activity size={20} className="text-blue-400" /> מגמת מכירות</h3>
                      <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">{selectedMonthData.label}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={companyTrendData}>
                        <defs><linearGradient id="colorCompany" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #475569', color: '#fff' }} formatter={(value: any) => [`₪${Math.round(value).toLocaleString()}`, 'מחזור']} />
                        <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCompany)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>
                  <GlassCard>
                    <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2"><Users size={20} className="text-purple-400" /> התפלגות לפי נציג</h3>
                    <div className="space-y-4">
                      {repPerformance.slice(0, 5).map((rep, index) => (
                        <div key={rep.id} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-700'}`}>{index + 1}</div>
                          <div className="flex-1 min-w-0"><p className="font-medium text-white truncate">{rep.full_name || 'ללא שם'}</p><p className="text-xs text-slate-500">{rep.deals} עסקאות</p></div>
                          <p className="font-bold text-emerald-400 flex-shrink-0">₪{Math.round(rep.totalNoVat).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="overflow-hidden p-0">
                  <div className="p-4 lg:p-6 border-b border-slate-700/50"><h3 className="font-bold text-lg text-white flex items-center gap-2"><Users size={20} className="text-blue-400" /> ביצועי נציגים - {selectedMonthData.label}</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 font-medium uppercase text-xs">
                        <tr><th className="p-3 lg:p-5 text-right">#</th><th className="p-3 lg:p-5 text-right">שם הנציג</th><th className="p-3 lg:p-5 text-center">עסקאות</th><th className="p-3 lg:p-5 text-center">יעד</th><th className="p-3 lg:p-5 text-center">התקדמות</th><th className="p-3 lg:p-5 text-right">מחזור</th><th className="p-3 lg:p-5 text-right">בונוס</th><th className="p-3 lg:p-5 text-center">פעולות</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 text-slate-300">
                        {repPerformance.map((rep, index) => (
                          <tr key={rep.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 lg:p-5"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-700'}`}>{index + 1}</div></td>
                            <td className="p-3 lg:p-5 font-bold text-white">{rep.full_name || 'ללא שם'}</td>
                            <td className="p-3 lg:p-5 text-center font-bold text-white">{rep.deals}</td>
                            <td className="p-3 lg:p-5 text-center text-slate-500">{rep.quantity_target || 20}</td>
                            <td className="p-3 lg:p-5"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden min-w-[60px]"><div className={`h-full rounded-full ${rep.quantityProgress >= 100 ? 'bg-emerald-500' : rep.quantityProgress >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(rep.quantityProgress, 100)}%` }}></div></div><span className="text-xs font-bold w-10 text-right">{Math.round(rep.quantityProgress)}%</span></div></td>
                            <td className="p-3 lg:p-5 text-right font-bold text-blue-400">₪{Math.round(rep.totalNoVat).toLocaleString()}</td>
                            <td className="p-3 lg:p-5 text-right font-bold text-emerald-400">₪{Math.round(rep.bonus).toLocaleString()}</td>
                            <td className="p-3 lg:p-5 text-center"><button onClick={() => { setEditingProfile(rep); setShowEditModal(true); }} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="עריכת יעדים"><Edit3 size={16} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-900/80 text-white font-bold">
                        <tr><td className="p-3 lg:p-5" colSpan={2}>סה״כ</td><td className="p-3 lg:p-5 text-center">{companyDeals}</td><td className="p-3 lg:p-5"></td><td className="p-3 lg:p-5"></td><td className="p-3 lg:p-5 text-right text-blue-400">₪{Math.round(companyTotalNoVat).toLocaleString()}</td><td className="p-3 lg:p-5 text-right text-emerald-400">₪{Math.round(companyCommission).toLocaleString()}</td><td className="p-3 lg:p-5"></td></tr>
                      </tfoot>
                    </table>
                  </div>
                </GlassCard>
                
                {/* קיצור דרך למעבר להיסטוריית מכירות */}
                <div className="flex justify-center">
                    <button onClick={() => setActiveTab('admin_history')} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-6 py-3 rounded-xl transition">
                        <History size={18} /> עבור להיסטוריית מכירות מלאה
                    </button>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && !isAdmin && (
              <div className="space-y-8 animate-fade-in">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div><h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">לוח בקרה</h2><p className="text-slate-400 mt-2 text-lg">{selectedMonthData.label}</p></div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400" />
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 cursor-pointer">
                      {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <StatCard title="בונוס חודשי" value={`₪${Math.round(myTotalCommission).toLocaleString()}`} icon={Wallet} color="green" subText="הרווח הנקי שלך" />
                  <StatCard title="מחזור מכירות" value={`₪${myTotalSales.toLocaleString()}`} icon={TrendingUp} color="blue" subText="שווי עסקאות (כולל מע״מ)" />
                  <StatCard title="עסקאות" value={myTotalDeals} icon={Target} color="purple" subText={`יעד: ${myProfile?.quantity_target || 20} עסקאות`} />
                </div>
                <GlassCard>
                  <h3 className="font-bold text-white text-lg mb-6">יעדים והתקדמות</h3>
                  <ProgressBar current={myTotalSales} target={myProfile?.financial_target || 100000} label="יעד כספי (מחזור)" color="bg-gradient-to-r from-blue-600 to-cyan-400" />
                  <ProgressBar current={myTotalDeals} target={myProfile?.quantity_target || 20} label="יעד כמותי (עסקאות)" color="bg-gradient-to-r from-purple-600 to-pink-400" />
                </GlassCard>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <GlassCard className="lg:col-span-2">
                    <h3 className="font-bold text-lg mb-6 text-white">מגמת בונוסים (₪)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={trendData}>
                        <defs><linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #475569', color: '#fff' }} />
                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>
                  <GlassCard>
                    <h3 className="font-bold text-lg mb-6 text-white">כמות עסקאות</h3>
                    <div className="h-[300px] flex flex-col items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none"><Cell fill="#3b82f6" /><Cell fill="#8b5cf6" /></Pie><Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }} /></PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"><span className="text-4xl font-black text-white">{mySales.length}</span><p className="text-xs text-slate-400 font-medium">עסקאות</p></div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs text-slate-400">רגיל</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className="text-xs text-slate-400">משותף</span></div></div>
                  </GlassCard>
                </div>
                
                {/* --- תוספת: היסטוריית מכירות אישית --- */}
                <GlassCard className="overflow-hidden p-0">
                  <div className="p-6 border-b border-slate-700/50 bg-slate-900/30">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <History size={20} className="text-blue-400" /> היסטוריית עסקאות - {selectedMonthData.label}
                    </h3>
                  </div>
                  <SalesHistoryTable sales={mySales} onDelete={handleDeleteSale} isAdmin={false} />
                </GlassCard>
              </div>
            )}

            {activeTab === 'add_sale' && (
              <div className="flex justify-center items-start min-h-[60vh] animate-fade-in py-4 lg:py-8">
                <GlassCard className="w-full max-w-2xl border-t-4 border-t-blue-500">
                  <h2 className="text-2xl lg:text-3xl font-black text-white mb-8 text-center tracking-tight flex items-center justify-center gap-3"><PlusCircle className="text-blue-400" /> רישום מכירה חדשה</h2>
                  <form onSubmit={handleSubmitSale} className="space-y-6">
                    {isAdmin && (
                      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-5 rounded-xl">
                        <label className="block text-sm font-bold text-amber-400 mb-3 flex items-center gap-2"><Users size={16} /> בחר איש מכירות *</label>
                        <select required value={selectedSalesRep} onChange={e => setSelectedSalesRep(e.target.value)} className="w-full p-4 bg-slate-900 border border-amber-500/30 rounded-xl text-white outline-none focus:border-amber-500">
                          <option value="">-- בחר נציג --</option>
                          {salesReps.map(rep => <option key={rep.id} value={rep.id}>{rep.full_name || rep.email}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      <div><label className="block text-sm font-medium text-slate-400 mb-2">שם הלקוח</label><input required value={client} onChange={e => setClient(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="שם מלא" /></div>
                      <div><label className="block text-sm font-medium text-slate-400 mb-2">מספר לקוח (ח.פ/ת.ז)</label><div className="relative"><input required value={clientId} onChange={e => setClientId(e.target.value)} className="w-full p-4 pr-12 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white font-mono" placeholder="000000000" /><Hash className="absolute right-4 top-4 text-slate-500" size={20} /></div></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-400 mb-2">סכום העסקה (כולל מע"מ)</label><div className="relative"><input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 pr-12 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white font-mono text-xl font-bold" placeholder="0.00" /><span className="absolute right-4 top-4 text-slate-500 font-bold">₪</span></div></div>
                    <div className="grid grid-cols-2 gap-4 lg:gap-6">
                      <div><label className="block text-sm font-medium text-slate-400 mb-2">סוג לקוח</label><select value={custType} onChange={e => setCustType(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"><option value="חדש">לקוח חדש (2%)</option><option value="מחדש">לקוח מחדש (1%)</option></select></div>
                      <div><label className="block text-sm font-medium text-slate-400 mb-2">סוג מנוי</label><select value={subType} onChange={e => setSubType(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"><option value="שנתי">מנוי שנתי</option><option value="עונתי">מנוי עונתי</option></select></div>
                    </div>
                    <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                      <label className="flex items-center gap-4 cursor-pointer"><input type="checkbox" checked={isSplit} onChange={e => setIsSplit(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded bg-slate-700 border-slate-600" /><span className="font-medium text-slate-300">זו עסקה משותפת (חצי-חצי)</span></label>
                      <AnimatePresence>
                        {isSplit && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4">
                            <select required value={partnerId} onChange={e => setPartnerId(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500">
                              <option value="">-- בחר שותף --</option>
                              {salesReps.filter(u => u.id !== (isAdmin ? selectedSalesRep : session.user.id)).map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button disabled={formLoading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-5 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition text-lg disabled:opacity-50">{formLoading ? 'מעבד...' : 'בצע רישום מכירה'}</button>
                  </form>
                </GlassCard>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-6 lg:space-y-8 animate-fade-in">
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl p-6 lg:p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden"><div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div><div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div></div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4"><Trophy size={40} className="text-yellow-300" /><div><h2 className="text-3xl lg:text-4xl font-black">טבלת מובילים</h2><p className="text-white/70">{selectedMonthData.label}</p></div></div>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none cursor-pointer">
                      {monthOptions.map(m => <option key={m.value} value={m.value} className="text-slate-900">{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4">
                  {repPerformance.map((stat, index) => (
                    <GlassCard key={stat.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 lg:p-5 gap-4 hover:border-slate-500 transition-all duration-300 ${index === 0 ? 'ring-2 ring-amber-500/30 border-amber-500/30' : ''}`}>
                      <div className="flex items-center gap-4 lg:gap-6">
                        <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center font-black text-lg lg:text-xl text-white shadow-lg flex-shrink-0 ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 'bg-slate-700'}`}>
                          {index === 0 ? <Crown size={24} /> : index + 1}
                        </div>
                        <div><h4 className="font-bold text-lg lg:text-xl text-white">{stat.full_name || 'ללא שם'}</h4><p className="text-sm text-slate-500">{stat.deals} עסקאות</p></div>
                      </div>
                      <div className="text-right sm:text-left w-full sm:w-auto"><p className="text-xs text-slate-500 uppercase mb-1">מחזור (ללא מע״מ)</p><p className="font-black text-xl lg:text-2xl text-emerald-400">₪{Math.round(stat.totalNoVat).toLocaleString()}</p></div>
                    </GlassCard>
                  ))}
                  {repPerformance.length === 0 && <div className="text-center py-12 text-slate-500"><Trophy size={48} className="mx-auto mb-4 opacity-50" /><p>אין נתונים לחודש זה</p></div>}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default App;