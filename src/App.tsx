import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, PlusCircle, Trophy, LogOut, TrendingUp, 
  Users, DollarSign, Target, Menu, X, Crown, Activity, Wallet, Hash, Star, Edit2, ArrowUpRight, BarChart3, CheckCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- הגדרות חיבור ל-Supabase ---
const supabaseUrl = 'https://jfccjqjlqsvwyjdkelxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmY2NqcWpscXN2d3lqZGtlbHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjE0MzQsImV4cCI6MjA4MDU5NzQzNH0.yPFHKxKYMHpfIW5QVG4ubAjzf5rrqWQp-6Gjhf6fvUw';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- טיפוסים (Types) ---
interface Sale {
  id: string;
  user_id: string;
  created_by: string;
  sale_date: string;
  client_name: string;
  client_id: string; // מספר לקוח
  subscription_type: string;
  customer_type: string;
  amount: number;
  commission: number;
  is_split: boolean;
  partner_name?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  financial_target: number;
  quantity_target: number;
}

// --- רכיבי עיצוב (Glassmorphism & Neon) ---

const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={`bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl p-6 relative overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

const StatCard = ({ title, value, icon: Icon, color, subText, trend }: any) => {
  const gradients: any = {
    blue: "from-blue-600 to-cyan-400",
    purple: "from-purple-600 to-pink-500",
    green: "from-emerald-500 to-teal-400",
    orange: "from-orange-500 to-yellow-400",
    red: "from-red-500 to-rose-400"
  };
  
  return (
    <GlassCard className="group hover:border-slate-500 transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${gradients[color]} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradients[color]} shadow-lg shadow-${color}-500/20 text-white transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={28} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/50 backdrop-blur-md">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">{trend}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-4xl font-black text-white tracking-tight">{value}</h3>
          {subText && <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">{subText}</p>}
        </div>
      </div>
    </GlassCard>
  );
};

const ProgressBar = ({ current, target, label, color }: any) => {
  const percent = Math.min((current / (target || 1)) * 100, 100);
  return (
    <div className="mt-6">
      <div className="flex justify-between text-sm mb-2 text-slate-300 font-medium items-end">
        <span className="flex items-center gap-2 text-slate-200">
          {label}
          {percent >= 100 && <CheckCircle size={14} className="text-emerald-400" />}
        </span>
        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner relative">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percent}%` }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full ${color} shadow-[0_0_15px_currentColor] relative z-10`}
        />
        <div className="absolute inset-0 bg-white/5 z-0" style={{width: `${percent}%`}}></div>
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
        <span>0</span>
        <span>יעד: {target?.toLocaleString()}</span>
      </div>
    </div>
  );
};

// --- האפליקציה הראשית ---
function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  
  // Data State
  const [sales, setSales] = useState<Sale[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [client, setClient] = useState('');
  const [clientId, setClientId] = useState(''); // שדה מספר לקוח
  const [subType, setSubType] = useState('שנתי');
  const [custType, setCustType] = useState('חדש');
  const [isSplit, setIsSplit] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- אתחול וטעינה ---
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
    // 1. שליפת פרופילים
    const { data: profData } = await supabase.from('profiles').select('*');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (profData) {
      setProfiles(profData);
      const me = profData.find((p: any) => p.id === user?.id);
      setMyProfile(me || null);
    }
    
    // 2. שליפת מכירות
    const { data: salesData } = await supabase.from('sales').select('*');
    if (salesData) setSales(salesData);
  };

  const handleUpdateName = async (name: string) => {
    if (!myProfile) return;
    await supabase.from('profiles').update({ full_name: name }).eq('id', myProfile.id);
    setEditingName(false);
    fetchData();
  };

  // --- לוגיקה עסקית (חישוב בונוס) ---
  const calculateCommission = (amount: number, type: string) => {
    // 1. ניכוי מע"מ (חלוקה ב-1.18)
    const amountNoVat = amount / 1.18;
    
    // 2. קביעת אחוז עמלה
    const rate = type === 'חדש' ? 0.02 : 0.01; // 2% לחדש, 1% למחדש
    
    // 3. חישוב
    return amountNoVat * rate;
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    const numAmount = parseFloat(amount);
    
    // חישוב
    let commission = calculateCommission(numAmount, custType);
    
    // טיפול ב"חצי חצי"
    if (isSplit) commission /= 2;
    
    const date = new Date().toISOString();
    
    // הכנת המידע לשליחה (מערך, כי אולי יש 2 שורות)
    const toInsert = [{
      user_id: session.user.id,
      created_by: session.user.id,
      sale_date: date,
      client_name: client,
      client_id: clientId, // מספר לקוח
      subscription_type: subType,
      customer_type: custType,
      amount: numAmount,
      commission: commission,
      is_split: isSplit,
      partner_name: isSplit ? profiles.find(u => u.id === partnerId)?.full_name : null
    }];

    // אם יש שותף, מוסיפים שורה גם לו
    if (isSplit && partnerId) {
      toInsert.push({
        user_id: partnerId, // ה-ID של השותף
        created_by: session.user.id,
        sale_date: date,
        client_name: client + ` (שותף: ${myProfile?.full_name})`,
        client_id: clientId,
        subscription_type: subType,
        customer_type: custType,
        amount: numAmount,
        commission: commission, // הוא מקבל חצי (אותו סכום כמוני)
        is_split: isSplit,
        partner_name: 'שותף'
      });
    }

    const { error } = await supabase.from('sales').insert(toInsert);
    
    if (!error) {
      // איפוס והצלחה
      setAmount(''); setClient(''); setClientId(''); setIsSplit(false); 
      setSubType('שנתי'); setCustType('חדש');
      fetchData(); 
      setActiveTab('dashboard'); 
    } else {
      alert('שגיאה: ' + error.message);
    }
    setFormLoading(false);
  };

  // --- סטטיסטיקה וחישובים ---
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // סינון מכירות רלוונטיות (חודש נוכחי)
  const currentMonthSales = sales.filter(s => {
    const d = new Date(s.sale_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // נתונים אישיים
  const mySales = currentMonthSales.filter(s => s.user_id === session?.user?.id);
  const myTotalCommission = mySales.reduce((acc, curr) => acc + curr.commission, 0);
  const myTotalSales = mySales.reduce((acc, curr) => acc + curr.amount, 0);
  const myTotalDeals = mySales.length;

  // נתונים לחברה (למנהל בלבד)
  const companyTotal = currentMonthSales.reduce((acc, curr) => acc + curr.amount, 0);
  const companyCommission = currentMonthSales.reduce((acc, curr) => acc + curr.commission, 0);

  // נתונים לגרף מגמה (כסף בכיס = Commission)
  const trendData = Object.entries(mySales.reduce((acc:any, curr) => {
    const d = new Date(curr.sale_date).getDate(); 
    acc[d] = (acc[d] || 0) + curr.commission; // מציג את הבונוס!
    return acc;
  }, {})).map(([d, a]) => ({ name: d, amount: a })).sort((a:any,b:any) => parseInt(a.name) - parseInt(b.name));

  // נתונים לגרף עוגה (כמות עסקאות)
  const pieData = [
    { name: 'רגיל', value: mySales.filter(s => !s.is_split).length }, 
    { name: 'משותף', value: mySales.filter(s => s.is_split).length }
  ];

  // --- מסך כניסה (Login) ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
        {/* רקע עם אפקטים */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        
        <GlassCard className="w-full max-w-md z-10 !bg-[#1e293b]/60 backdrop-blur-2xl border-slate-700/50 p-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 rotate-3 hover:rotate-6 transition-transform">
              <Activity size={40} className="text-white" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">כמה הרווחתי?</h1>
            <p className="text-slate-400 font-medium">מערכת ניהול בונוסים מתקדמת</p>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
                <input className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition placeholder-slate-500" placeholder="אימייל" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <input className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition placeholder-slate-500" type="password" placeholder="סיסמה" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <div className="flex gap-4 pt-4">
               <button onClick={() => supabase.auth.signInWithPassword({email, password})} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-xl font-bold transition shadow-lg shadow-blue-900/30 active:scale-95 text-lg">כניסה</button>
               <button onClick={() => supabase.auth.signUp({email, password})} className="flex-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 p-4 rounded-xl font-bold transition active:scale-95">הרשמה</button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // --- ממשק האפליקציה (Dashboard) ---
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col lg:flex-row overflow-hidden" dir="rtl">
      
      {/* תפריט צד (Sidebar Desktop) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-80 bg-[#1e293b]/95 backdrop-blur-xl border-l border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity size={26} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl text-white tracking-wide">כמה הרווחתי?</h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">גרסת פרו 2.0</p>
            </div>
          </div>

          <nav className="flex-1 space-y-3">
            {[
              { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
              { id: 'add_sale', label: 'הוספת מכירה', icon: PlusCircle },
              { id: 'leaderboard', label: 'טבלת מובילים', icon: Trophy },
              ...(myProfile?.is_admin ? [{ id: 'admin', label: 'פאנל מנהל', icon: Crown }] : [])
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${activeTab === item.id ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
                {activeTab === item.id && <div className="absolute right-0 top-3 bottom-3 w-1.5 bg-blue-500 rounded-l-full shadow-[0_0_15px_#3b82f6]"></div>}
                <item.icon size={22} className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110 text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-bold tracking-wide text-lg">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-slate-800">
             <div className="flex items-center gap-4 mb-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-inner">
                 {myProfile?.full_name?.[0] || 'U'}
               </div>
               <div className="flex-1 overflow-hidden">
                 <div className="flex items-center justify-between">
                    <p className="font-bold text-sm truncate text-white">{myProfile?.full_name || 'משתמש'}</p>
                    <button onClick={() => setEditingName(!editingName)} className="text-slate-500 hover:text-blue-400 bg-slate-800 p-1.5 rounded-lg transition"><Edit2 size={12}/></button>
                 </div>
                 <p className="text-xs text-slate-500 mt-0.5 font-medium">{myProfile?.is_admin ? 'מנהל מערכת' : 'נציג מכירות'}</p>
               </div>
             </div>
             
             <AnimatePresence>
               {editingName && (
                 <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="mb-4 overflow-hidden">
                    <div className="flex gap-2">
                        <input id="quickName" className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-blue-500" placeholder="הקלד שם..." />
                        <button onClick={() => handleUpdateName((document.getElementById('quickName') as HTMLInputElement).value)} className="bg-blue-600 text-white text-xs px-3 rounded-lg font-bold">שמור</button>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition font-medium">
               <LogOut size={20} /> יציאה מהמערכת
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Full Width) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0f172a]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        
        <header className="lg:hidden bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40">
           <div className="flex items-center gap-2"><Activity size={22} className="text-blue-500"/><h1 className="font-bold text-xl text-white">כמה הרווחתי?</h1></div>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300 hover:bg-slate-800 rounded-xl transition"><Menu size={28}/></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-32 w-full">
          <div className="w-full max-w-[1600px] mx-auto space-y-10">
            
            {/* הודעה אם חסר שם */}
            {myProfile && (!myProfile.full_name || myProfile.full_name === 'משתמש חדש') && (
              <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-amber-900/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-full text-amber-400 border border-amber-500/30"><Star size={24}/></div>
                    <div>
                      <h3 className="font-bold text-amber-400 text-lg">רגע אחד! אנחנו לא מכירים</h3>
                      <p className="text-amber-200/70 text-sm">הזן את שמך המלא כדי להופיע בטבלאות</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <input id="newName" className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 outline-none transition w-full md:w-64" placeholder="שם מלא..." />
                    <button onClick={() => handleUpdateName((document.getElementById('newName') as HTMLInputElement).value)} className="bg-amber-500 text-slate-900 px-8 rounded-xl font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">שמור</button>
                  </div>
              </motion.div>
            )}

            {/* === DASHBOARD === */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in w-full">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-5xl font-black text-white tracking-tight">לוח בקרה</h2>
                        <p className="text-slate-400 mt-2 text-xl font-light">סיכום חודש {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    {myProfile?.is_admin && <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-bold border border-blue-500/30">מצב מנהל פעיל</div>}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <StatCard title="בונוס חודשי (נקי)" value={`₪${myTotalCommission.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}`} icon={Wallet} color="green" subText="הרווח הנקי שלך לכיס" trend="+15%" />
                  <StatCard title="מחזור מכירות" value={`₪${myTotalSales.toLocaleString()}`} icon={TrendingUp} color="blue" subText="שווי עסקאות (כולל מעמ)" trend="מגמת עליה" />
                  <StatCard title="כמות עסקאות" value={myTotalDeals} icon={Target} color="purple" subText={`יעד חודשי: ${myProfile?.quantity_target || 30}`} />
                </div>

                <GlassCard className="w-full p-8">
                    <h3 className="font-bold text-white text-xl mb-8 flex items-center gap-2"><Target className="text-pink-500"/> יעדים והתקדמות</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <ProgressBar current={myTotalSales} target={myProfile?.financial_target || 100000} label="יעד כספי (מחזור)" color="bg-gradient-to-r from-blue-600 to-cyan-400" />
                        <ProgressBar current={myTotalDeals} target={myProfile?.quantity_target || 30} label="יעד כמותי (עסקאות)" color="bg-gradient-to-r from-purple-600 to-pink-400" />
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                  <GlassCard className="lg:col-span-2 min-h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-xl text-white flex items-center gap-3">
                        <Activity size={20} className="text-emerald-400"/> מגמת בונוסים (כסף לכיס)
                      </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={trendData}>
                        <defs><linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #475569', color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}} />
                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  <GlassCard>
                    <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2"><PieChart size={20} className="text-purple-400"/> כמות עסקאות</h3>
                    <div className="h-[300px] flex flex-col items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={pieData} 
                            innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#8b5cf6" />
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none'}}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="text-5xl font-black text-white tracking-tighter">{mySales.length}</span>
                        <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">סה"כ</p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                       <div className="flex items-center gap-2 text-sm text-slate-400"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div> רגיל</div>
                       <div className="flex items-center gap-2 text-sm text-slate-400"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#8b5cf6]"></div> משותף</div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* === ADMIN === */}
            {activeTab === 'admin' && myProfile?.is_admin && (
              <div className="space-y-8 animate-fade-in w-full">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-10 rounded-3xl border border-blue-700/30 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                     <div>
                       <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"><Crown size={12} /> ADMIN ZONE</div>
                       <h2 className="text-4xl font-black text-white">דשבורד מנהל</h2>
                       <p className="text-blue-200 mt-2 text-lg">שליטה מלאה על ביצועי החברה</p>
                     </div>
                     <div className="text-right bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm shadow-xl min-w-[250px]">
                        <p className="text-sm text-blue-300 font-medium mb-1 uppercase tracking-wider">מחזור חברה כולל</p>
                        <p className="text-5xl font-black text-white tracking-tight">₪{companyTotal.toLocaleString()}</p>
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-slate-400">סך בונוסים לתשלום: <span className="text-white font-bold">₪{companyCommission.toLocaleString()}</span></p>
                        </div>
                     </div>
                   </div>
                </div>

                <GlassCard className="overflow-hidden p-0 w-full">
                  <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                    <h3 className="font-bold text-xl text-white">ביצועי נציגים בזמן אמת</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 font-medium uppercase tracking-wider text-xs">
                        <tr>
                          <th className="p-5 text-right">שם הנציג</th>
                          <th className="p-5 text-center">יעד כספי</th>
                          <th className="p-5 text-center">יעד כמותי</th>
                          <th className="p-5 text-center">עסקאות בפועל</th>
                          <th className="p-5 text-right">מחזור</th>
                          <th className="p-5 text-right">בונוס</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 text-slate-300">
                        {profiles.map(p => {
                          const pSales = sales.filter(s => s.user_id === p.id && new Date(s.sale_date).getMonth() === currentMonth);
                          const pTotal = pSales.reduce((a,b)=>a+b.amount,0);
                          const pBonus = pSales.reduce((a,b)=>a+b.commission,0);
                          return (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                              <td className="p-5 font-bold text-white flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm border border-slate-600 shadow-md group-hover:border-blue-500/50 transition-colors">{p.full_name?.[0]}</div>
                                <div><div className="font-bold text-base">{p.full_name}</div><div className="text-xs text-slate-500 font-normal">{p.email}</div></div>
                              </td>
                              <td className="p-5 text-center text-slate-500">₪{p.financial_target.toLocaleString()}</td>
                              <td className="p-5 text-center text-slate-500">{p.quantity_target}</td>
                              <td className="p-5 text-center"><span className="bg-slate-800/50 px-3 py-1 rounded-lg font-mono border border-slate-700 text-white font-bold">{pSales.length}</span></td>
                              <td className="p-5 text-right font-bold text-blue-400 text-base">₪{pTotal.toLocaleString()}</td>
                              <td className="p-5 text-right font-bold text-emerald-400 text-base">₪{pBonus.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* === ADD SALE === */}
            {activeTab === 'add_sale' && (
              <div className="flex justify-center items-center min-h-[60vh] animate-fade-in w-full">
                <GlassCard className="w-full max-w-2xl border-t-4 border-t-blue-500">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 text-blue-400"><PlusCircle size={32}/></div>
                    <h2 className="text-3xl font-black text-white tracking-tight">רישום מכירה חדשה</h2>
                    <p className="text-slate-400 mt-2">הזן את פרטי העסקה בטופס למטה</p>
                  </div>
                  
                  <form onSubmit={handleSubmitSale} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">שם הלקוח</label>
                            <input required value={client} onChange={e => setClient(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-white transition placeholder-slate-600" placeholder="לדוגמה: ישראל ישראלי" />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">מספר לקוח (ח.פ/ת.ז)</label>
                            <div className="relative">
                                <input required value={clientId} onChange={e => setClientId(e.target.value)} className="w-full p-4 pl-12 bg-slate-900/50 border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-white font-mono transition placeholder-slate-600" placeholder="000000" />
                                <Hash className="absolute left-4 top-4 text-slate-500" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-slate-400 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">סכום העסקה (כולל מע"מ)</label>
                      <div className="relative">
                        <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 pl-12 bg-slate-900/50 border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-white font-mono text-xl font-bold transition placeholder-slate-600" placeholder="0.00" />
                        <DollarSign className="absolute left-4 top-4 text-slate-500" size={20} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">סוג לקוח</label>
                            <select value={custType} onChange={e => setCustType(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white outline-none focus:border-blue-500 transition">
                                <option value="חדש">לקוח חדש (2%)</option>
                                <option value="מחדש">לקוח מחדש (1%)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">סוג מנוי</label>
                            <select value={subType} onChange={e => setSubType(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white outline-none focus:border-blue-500 transition">
                                <option value="שנתי">מנוי שנתי</option>
                                <option value="עונתי">מנוי עונתי</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                      <label className="flex items-center gap-4 cursor-pointer">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSplit ? 'bg-blue-600 border-blue-600 shadow-[0_0_10px_#3b82f6]' : 'border-slate-600 bg-slate-800'}`}>
                          <input type="checkbox" checked={isSplit} onChange={e => setIsSplit(e.target.checked)} className="hidden" />
                          {isSplit && <Users size={14} className="text-white" />}
                        </div>
                        <span className={`font-medium transition-colors ${isSplit ? 'text-white' : 'text-slate-400'}`}>זו עסקה משותפת (חצי-חצי)</span>
                      </label>
                      <AnimatePresence>
                        {isSplit && (
                          <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="overflow-hidden">
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                              <select required value={partnerId} onChange={e => setPartnerId(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition">
                                <option value="">-- בחר שותף --</option>
                                {profiles.filter(u => u.id !== session.user.id).map(u => (
                                  <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                                ))}
                              </select>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button disabled={formLoading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition transform active:scale-[0.98] flex justify-center items-center gap-3 text-lg">
                      {formLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><PlusCircle size={22} /> בצע רישום מכירה</>}
                    </button>
                  </form>
                </GlassCard>
              </div>
            )}

            {/* === LEADERBOARD === */}
            {activeTab === 'leaderboard' && (
               <div className="space-y-8 animate-fade-in w-full">
                 <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden border border-orange-500/30">
                   <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                   <div className="relative z-10 text-center">
                     <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-full mb-4 shadow-lg border border-white/20">
                        <Trophy className="text-yellow-300 drop-shadow-lg" size={48}/>
                     </div>
                     <h2 className="text-4xl font-black tracking-tight">היכל התהילה</h2>
                     <p className="mt-2 text-orange-100 font-medium text-lg">המובילים של חודש {new Date().toLocaleDateString('he-IL', { month: 'long' })}</p>
                   </div>
                 </div>

                 <div className="grid gap-4">
                   {profiles.map(p => { 
                      const pSales = sales.filter(s => s.user_id === p.id && new Date(s.sale_date).getMonth() === currentMonth); 
                      // חישוב סכום ללא מע"מ
                      const totalNoVat = pSales.reduce((a,b) => a + (b.amount / 1.18), 0); 
                      return { ...p, totalNoVat, count: pSales.length }; 
                   }).sort((a,b) => b.totalNoVat - a.totalNoVat).map((stat, index) => (
                     <GlassCard key={stat.id} className="flex items-center justify-between p-5 hover:border-slate-500 transition-all group hover:scale-[1.01]">
                       <div className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 ${
                           index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-white shadow-amber-500/40' :
                           index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-500 text-white shadow-slate-500/40' :
                           index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-white shadow-orange-500/40' :
                           'bg-slate-800 text-slate-500 border border-slate-700'
                         }`}>
                           {index + 1}
                         </div>
                         <div>
                           <h4 className="font-bold text-xl text-white flex items-center gap-3">
                             {stat.full_name || stat.email}
                             {stat.id === session.user.id && <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider font-bold">אני</span>}
                           </h4>
                           <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
                             <Target size={14}/> {stat.count} עסקאות החודש
                           </p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">₪{stat.totalNoVat.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                         <p className="text-xs text-slate-500 font-medium mt-1">שווי (ללא מע"מ)</p>
                       </div>
                     </GlassCard>
                   ))}
                 </div>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;