import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, PlusCircle, Trophy, LogOut, TrendingUp, 
  Users, DollarSign, Target, Menu, X, Crown, Activity, Wallet, Hash, Star
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- חיבור ל-Supabase ---
const supabaseUrl = 'https://jfccjqjlqsvwyjdkelxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmY2NqcWpscXN2d3lqZGtlbHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjE0MzQsImV4cCI6MjA4MDU5NzQzNH0.yPFHKxKYMHpfIW5QVG4ubAjzf5rrqWQp-6Gjhf6fvUw';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- טיפוסים ---
interface Sale {
  id: string; user_id: string; created_by: string; sale_date: string;
  client_name: string; client_id: string; // מספר לקוח
  subscription_type: string; customer_type: string;
  amount: number; commission: number; is_split: boolean; partner_name?: string;
}
interface UserProfile {
  id: string; full_name: string; email: string; is_admin: boolean;
  financial_target: number; quantity_target: number;
}

// --- עיצוב (Glassmorphism) ---
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
    orange: "from-orange-500 to-yellow-400"
  };
  return (
    <GlassCard className="group hover:border-slate-600 transition-all duration-300">
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${gradients[color]} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradients[color]} shadow-lg shadow-${color}-500/20 text-white`}>
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
  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-2 text-slate-300 font-medium">
        <span>{label}</span>
        <span className="font-bold text-white">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percent}%` }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full ${color} shadow-lg`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
        <span>התחלה</span>
        <span>יעד: {target?.toLocaleString()}</span>
      </div>
    </div>
  );
};

// --- האפליקציה ---
function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data
  const [sales, setSales] = useState<Sale[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  
  // Form Inputs
  const [amount, setAmount] = useState('');
  const [client, setClient] = useState('');
  const [clientId, setClientId] = useState('');
  const [subType, setSubType] = useState('שנתי');
  const [custType, setCustType] = useState('חדש');
  const [isSplit, setIsSplit] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    }
    const { data: salesData } = await supabase.from('sales').select('*');
    if (salesData) setSales(salesData);
  };

  const handleUpdateName = async (name: string) => {
    if (!myProfile) return;
    await supabase.from('profiles').update({ full_name: name }).eq('id', myProfile.id);
    fetchData();
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    const numAmount = parseFloat(amount);
    
    // חישוב עמלה מדויק: (סכום / 1.18) * אחוז
    const amountNoVat = numAmount / 1.18;
    const rate = custType === 'חדש' ? 0.02 : 0.01; // 2% לחדש, 1% למחדש
    let commission = amountNoVat * rate;
    
    if (isSplit) commission /= 2;
    
    const date = new Date().toISOString();
    
    const toInsert = [{
      user_id: session.user.id, created_by: session.user.id, sale_date: date,
      client_name: client, client_id: clientId,
      subscription_type: subType, customer_type: custType,
      amount: numAmount, commission, is_split: isSplit,
      partner_name: isSplit ? profiles.find(u => u.id === partnerId)?.full_name : null
    }];

    if (isSplit && partnerId) {
      toInsert.push({
        user_id: partnerId, created_by: session.user.id, sale_date: date,
        client_name: client + ` (שותף: ${myProfile?.full_name})`, client_id: clientId,
        subscription_type: subType, customer_type: custType,
        amount: numAmount, commission, is_split: isSplit, partner_name: 'שותף'
      });
    }

    const { error } = await supabase.from('sales').insert(toInsert);
    if (!error) {
      setAmount(''); setClient(''); setClientId(''); setIsSplit(false); setSubType('שנתי'); setCustType('חדש');
      fetchData();
      setActiveTab('dashboard'); 
    } else {
      alert(error.message);
    }
    setFormLoading(false);
  };

  // --- סטטיסטיקה ---
  const currentMonth = new Date().getMonth();
  
  // נתוני נציג
  const mySales = sales.filter(s => s.user_id === session?.user?.id && new Date(s.sale_date).getMonth() === currentMonth);
  const myTotalCommission = mySales.reduce((acc, curr) => acc + curr.commission, 0);
  const myTotalSales = mySales.reduce((acc, curr) => acc + curr.amount, 0);
  const myTotalDeals = mySales.length;

  // נתוני חברה (למנהל)
  const companySales = sales.filter(s => new Date(s.sale_date).getMonth() === currentMonth);
  const companyTotal = companySales.reduce((acc, curr) => acc + curr.amount, 0);
  const companyCommission = companySales.reduce((acc, curr) => acc + curr.commission, 0);

  // גרף 1: מגמת בונוסים (ציר Y = כסף שנכנס לכיס)
  const trendData = Object.entries(mySales.reduce((acc:any, curr) => {
    const d = new Date(curr.sale_date).getDate(); 
    acc[d] = (acc[d] || 0) + curr.commission; // בונוסים!
    return acc;
  }, {})).map(([d, a]) => ({ name: d, amount: a })).sort((a:any,b:any) => parseInt(a.name) - parseInt(b.name));

  // גרף 2: התפלגות עסקאות (לפי כמות)
  const pieData = [
    { name: 'רגיל', value: mySales.filter(s => !s.is_split).length }, 
    { name: 'משותף', value: mySales.filter(s => s.is_split).length }
  ];

  // --- LOGIN ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
        <GlassCard className="w-full max-w-md z-10 !bg-[#1e293b]/60 backdrop-blur-2xl border-slate-700/50 p-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">כמה הרווחתי?</h1>
            <p className="text-slate-400">התחבר למערכת הניהול המתקדמת</p>
          </div>
          <div className="space-y-5">
            <input className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white outline-none" placeholder="אימייל" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white outline-none" type="password" placeholder="סיסמה" value={password} onChange={e=>setPassword(e.target.value)} />
            <div className="flex gap-4 pt-4">
               <button onClick={() => supabase.auth.signInWithPassword({email, password})} className="flex-1 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-500 transition">כניסה</button>
               <button onClick={() => supabase.auth.signUp({email, password})} className="flex-1 bg-slate-800 text-slate-300 border border-slate-700 p-4 rounded-xl font-bold hover:bg-slate-700 transition">הרשמה</button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // --- APP LAYOUT ---
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden selection:bg-blue-500/30" dir="rtl">
      
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#1e293b] border-l border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl text-white tracking-wide">כמה הרווחתי?</h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">מערכת בונוסים</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
              { id: 'add_sale', label: 'הוספת מכירה', icon: PlusCircle },
              { id: 'leaderboard', label: 'טבלת מובילים', icon: Trophy },
              ...(myProfile?.is_admin ? [{ id: 'admin', label: 'פאנל מנהל', icon: Crown }] : [])
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-800">
             <div className="flex items-center gap-3 mb-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                 {myProfile?.full_name?.[0] || 'U'}
               </div>
               <div className="overflow-hidden">
                 <p className="font-bold text-sm truncate text-white">{myProfile?.full_name || 'משתמש'}</p>
                 <p className="text-xs text-slate-500">{myProfile?.is_admin ? 'מנהל מערכת' : 'נציג'}</p>
               </div>
             </div>
             <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 p-2 text-sm"><LogOut size={16} /> יציאה</button>
          </div>
        </div>
      </aside>

      {/* Main Content - Full Width */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0f172a]">
        <header className="lg:hidden bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40">
           <h1 className="font-bold text-lg text-white">כמה הרווחתי?</h1>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300"><Menu size={24}/></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 w-full">
          <div className="w-full mx-auto space-y-8">
            
            {/* Missing Name */}
            {myProfile && (!myProfile.full_name || myProfile.full_name === 'משתמש חדש') && (
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div><h3 className="font-bold text-amber-400 text-lg">שם חסר</h3><p className="text-amber-200/70 text-sm">הזן את שמך המלא</p></div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input id="newName" className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none" placeholder="שם מלא..." />
                    <button onClick={() => handleUpdateName((document.getElementById('newName') as HTMLInputElement).value)} className="bg-amber-500 text-slate-900 px-6 rounded-xl font-bold hover:bg-amber-400 transition">שמור</button>
                  </div>
              </div>
            )}

            {/* === DASHBOARD === */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in w-full">
                <header>
                    <h2 className="text-4xl font-black text-white tracking-tight">לוח בקרה</h2>
                    <p className="text-slate-400 mt-2 text-lg">סיכום חודש {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <StatCard title="בונוס חודשי" value={`₪${myTotalCommission.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}`} icon={Wallet} color="green" subText="הרווח הנקי שלך" />
                  <StatCard title="מחזור מכירות" value={`₪${myTotalSales.toLocaleString()}`} icon={TrendingUp} color="blue" subText="שווי עסקאות (כולל מעמ)" />
                  <StatCard title="עסקאות" value={myTotalDeals} icon={Target} color="purple" subText="יעד: 20 עסקאות" />
                </div>

                <GlassCard className="w-full">
                    <h3 className="font-bold text-white text-lg mb-6">יעדים והתקדמות</h3>
                    <ProgressBar current={myTotalSales} target={myProfile?.financial_target || 100000} label="יעד כספי (מחזור)" color="bg-gradient-to-r from-blue-600 to-cyan-400" />
                    <ProgressBar current={myTotalDeals} target={myProfile?.quantity_target || 20} label="יעד כמותי (עסקאות)" color="bg-gradient-to-r from-purple-600 to-pink-400" />
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                  <GlassCard className="lg:col-span-2 min-h-[450px]">
                    <h3 className="font-bold text-lg mb-6 text-white">מגמת בונוסים (בשקלים)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={trendData}>
                        <defs><linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #475569', color: '#fff'}} />
                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  <GlassCard>
                    <h3 className="font-bold text-lg mb-6 text-white">כמות עסקאות</h3>
                    <div className="h-[300px] flex flex-col items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={pieData} 
                            innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#8b5cf6" />
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none'}}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="text-4xl font-black text-white">{mySales.length}</span>
                        <p className="text-xs text-slate-400 font-medium">עסקאות</p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* === ADMIN === */}
            {activeTab === 'admin' && myProfile?.is_admin && (
              <div className="space-y-8 animate-fade-in w-full">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-10 rounded-3xl border border-blue-700/30 relative overflow-hidden shadow-2xl">
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                     <div>
                       <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-blue-500/30"><Crown size={12} /> ADMIN ZONE</div>
                       <h2 className="text-4xl font-black text-white">דשבורד מנהל</h2>
                     </div>
                     <div className="text-right bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl">
                        <p className="text-sm text-blue-300 font-medium mb-1 uppercase tracking-wider">מחזור חברה כולל</p>
                        <p className="text-5xl font-black text-white tracking-tight">₪{companyTotal.toLocaleString()}</p>
                        <p className="text-sm text-slate-400 mt-2">סך בונוסים לתשלום: ₪{companyCommission.toLocaleString()}</p>
                     </div>
                   </div>
                </div>

                <GlassCard className="overflow-hidden p-0 w-full">
                  <div className="p-6 border-b border-slate-700/50"><h3 className="font-bold text-lg text-white">כל העסקאות והנציגים (חודשי)</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 font-medium uppercase text-xs">
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
                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-5 font-bold text-white">{p.full_name}</td>
                              <td className="p-5 text-center text-slate-500">₪{p.financial_target.toLocaleString()}</td>
                              <td className="p-5 text-center text-slate-500">{p.quantity_target}</td>
                              <td className="p-5 text-center font-bold text-white">{pSales.length}</td>
                              <td className="p-5 text-right font-bold text-blue-400">₪{pTotal.toLocaleString()}</td>
                              <td className="p-5 text-right font-bold text-green-400">₪{pBonus.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</td>
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
                  <h2 className="text-3xl font-black text-white mb-8 text-center tracking-tight">רישום מכירה</h2>
                  <form onSubmit={handleSubmitSale} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">שם הלקוח</label>
                            <input required value={client} onChange={e => setClient(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="שם מלא" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">מספר לקוח (ח.פ/ת.ז)</label>
                            <div className="relative">
                                <input required value={clientId} onChange={e => setClientId(e.target.value)} className="w-full p-4 pl-12 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white font-mono" placeholder="000000" />
                                <Hash className="absolute left-4 top-4 text-slate-500" size={20} />
                            </div>
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">סכום העסקה (כולל מע"מ)</label>
                      <div className="relative">
                        <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 pl-12 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white font-mono text-xl font-bold" placeholder="0.00" />
                        <DollarSign className="absolute left-4 top-4 text-slate-500" size={20} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">סוג לקוח</label>
                            <select value={custType} onChange={e => setCustType(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none">
                                <option value="חדש">לקוח חדש (2%)</option>
                                <option value="מחדש">לקוח מחדש (1%)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">סוג מנוי</label>
                            <select value={subType} onChange={e => setSubType(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none">
                                <option value="שנתי">מנוי שנתי</option>
                                <option value="עונתי">מנוי עונתי</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                      <label className="flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" checked={isSplit} onChange={e => setIsSplit(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded bg-slate-700 border-slate-600" />
                        <span className="font-medium text-slate-300">זו עסקה משותפת (חצי-חצי)</span>
                      </label>
                      <AnimatePresence>
                        {isSplit && (
                          <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} className="overflow-hidden mt-4">
                            <select required value={partnerId} onChange={e => setPartnerId(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none">
                              <option value="">-- בחר שותף --</option>
                              {profiles.filter(u => u.id !== session.user.id).map(u => (
                                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                              ))}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button disabled={formLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl font-bold shadow-lg transition text-lg">
                      {formLoading ? 'מעבד...' : 'בצע רישום מכירה'}
                    </button>
                  </form>
                </GlassCard>
              </div>
            )}

            {/* === LEADERBOARD === */}
            {activeTab === 'leaderboard' && (
               <div className="space-y-8 animate-fade-in w-full">
                 <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden"><h2 className="text-4xl font-black relative z-10">היכל התהילה</h2></div>
                 <div className="grid gap-4">
                    {profiles.map(p => { 
                        const pSales = sales.filter(s => s.user_id === p.id && new Date(s.sale_date).getMonth() === currentMonth); 
                        const totalNoVat = pSales.reduce((a,b) => a + (b.amount / 1.18), 0); // סכום ללא מע"מ לדירוג
                        return { ...p, totalNoVat, count: pSales.length }; 
                    }).sort((a,b) => b.totalNoVat - a.totalNoVat).map((stat, index) => (
                        <GlassCard key={stat.id} className="flex items-center justify-between p-5 hover:border-slate-500 transition-colors">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl text-white ${index === 0 ? 'bg-yellow-500' : 'bg-slate-700'}`}>{index + 1}</div>
                                <div>
                                    <h4 className="font-bold text-xl text-white">{stat.full_name}</h4>
                                    <p className="text-sm text-slate-500">{stat.count} עסקאות</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase">שווי עסקאות (ללא מע"מ)</p>
                                <p className="font-black text-2xl text-emerald-400">₪{stat.totalNoVat.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
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