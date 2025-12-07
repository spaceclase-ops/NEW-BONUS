import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, PlusCircle, Trophy, LogOut, TrendingUp, 
  Users, DollarSign, Target, Menu, X, Crown, ChevronRight, Activity, Wallet, Star
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- הגדרות חיבור (ישירות בקוד למניעת תקלות) ---
const supabaseUrl = 'https://jfccjqjlqsvwyjdkelxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmY2NqcWpscXN2d3lqZGtlbHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjE0MzQsImV4cCI6MjA4MDU5NzQzNH0.yPFHKxKYMHpfIW5QVG4ubAjzf5rrqWQp-6Gjhf6fvUw';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- טיפוסים ---
interface Sale {
  id: string; user_id: string; created_by: string; sale_date: string;
  client_name: string; subscription_type: string; customer_type: string;
  amount: number; commission: number; is_split: boolean; partner_name?: string;
}
interface UserProfile {
  id: string; full_name: string; email: string; is_admin: boolean;
  financial_target: number; quantity_target: number;
}

// --- קומפוננטות עיצוב (Premium UI) ---
const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`bg-[#1e293b]/70 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl p-6 relative overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

const NeonStatCard = ({ title, value, icon: Icon, color, trend }: any) => {
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
          {trend && (
            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">{trend}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        </div>
      </div>
    </GlassCard>
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
  
  // Form
  const [amount, setAmount] = useState('');
  const [client, setClient] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Auth
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
    const rate = 0.02;
    let commission = (numAmount / 1.18) * rate;
    if (isSplit) commission /= 2;
    
    const date = new Date().toISOString();
    const toInsert = [{
      user_id: session.user.id, created_by: session.user.id, sale_date: date,
      client_name: client, subscription_type: 'שנתי', customer_type: 'חדש',
      amount: numAmount, commission, is_split: isSplit,
      partner_name: isSplit ? profiles.find(u => u.id === partnerId)?.full_name : null
    }];

    if (isSplit && partnerId) {
      toInsert.push({
        user_id: partnerId, created_by: session.user.id, sale_date: date,
        client_name: client + ` (שותף: ${myProfile?.full_name})`, subscription_type: 'שנתי', customer_type: 'חדש',
        amount: numAmount, commission, is_split: isSplit, partner_name: 'שותף'
      });
    }

    const { error } = await supabase.from('sales').insert(toInsert);
    if (!error) {
      setAmount(''); setClient(''); setIsSplit(false); 
      fetchData();
      setActiveTab('dashboard'); 
    } else {
      alert(error.message);
    }
    setFormLoading(false);
  };

  // --- חישובים ---
  const currentMonth = new Date().getMonth();
  const mySales = sales.filter(s => s.user_id === session?.user?.id && new Date(s.sale_date).getMonth() === currentMonth);
  const myTotalCommission = mySales.reduce((acc, curr) => acc + curr.commission, 0);
  const myTotalSales = mySales.reduce((acc, curr) => acc + curr.amount, 0);

  const companySales = sales.filter(s => new Date(s.sale_date).getMonth() === currentMonth);
  const companyTotal = companySales.reduce((acc, curr) => acc + curr.amount, 0);
  const companyCommission = companySales.reduce((acc, curr) => acc + curr.commission, 0);

  const chartData = Object.entries(mySales.reduce((acc:any, curr) => {
    const d = new Date(curr.sale_date).getDate(); 
    acc[d] = (acc[d] || 0) + curr.amount; return acc;
  }, {})).map(([d, a]) => ({ name: d, amount: a })).sort((a:any,b:any) => parseInt(a.name) - parseInt(b.name));

  // --- LOGIN VIEW ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        
        <GlassCard className="w-full max-w-md z-10 !bg-[#1e293b]/60 backdrop-blur-2xl border-slate-700/50 p-8">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20">
              <Activity size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">כמה הרווחתי?</h1>
            <p className="text-slate-400">ניהול בונוסים חכם ומתקדם</p>
          </div>
          <div className="space-y-5">
            <input className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder-slate-500" placeholder="אימייל" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder-slate-500" type="password" placeholder="סיסמה" value={password} onChange={e=>setPassword(e.target.value)} />
            <div className="flex gap-4 pt-4">
               <button onClick={() => supabase.auth.signInWithPassword({email, password})} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-xl font-bold transition shadow-lg shadow-blue-900/30 active:scale-95">כניסה</button>
               <button onClick={() => supabase.auth.signUp({email, password})} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-4 rounded-xl font-bold transition active:scale-95">הרשמה</button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // --- APP VIEW ---
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden selection:bg-blue-500/30" dir="rtl">
      
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#1e293b]/95 backdrop-blur-xl border-l border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity size={24} className="text-white" />
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
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {activeTab === item.id && <div className="absolute right-0 top-3 bottom-3 w-1 bg-blue-500 rounded-l-full shadow-[0_0_10px_#3b82f6]"></div>}
                <item.icon size={22} className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110 text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
                {activeTab === item.id && <ChevronRight size={16} className="mr-auto text-blue-400 opacity-50" />}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-800">
             <div className="flex items-center gap-3 mb-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800/50">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                 {myProfile?.full_name?.[0] || 'U'}
               </div>
               <div className="overflow-hidden">
                 <p className="font-bold text-sm truncate text-white">{myProfile?.full_name || 'משתמש'}</p>
                 <p className="text-xs text-slate-500">{myProfile?.is_admin ? 'מנהל מערכת' : 'נציג מכירות'}</p>
               </div>
             </div>
             <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition text-sm font-medium">
               <LogOut size={18} /> יציאה מהמערכת
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0f172a]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        
        {/* Header Mobile */}
        <header className="lg:hidden bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Activity size={16} className="text-white" />
             </div>
             <h1 className="font-bold text-lg text-white">כמה הרווחתי?</h1>
           </div>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition">
             {sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
           </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 scrollbar-thin scrollbar-thumb-slate-700 relative z-10">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Missing Name Alert */}
            {myProfile && (!myProfile.full_name || myProfile.full_name === 'משתמש חדש') && (
              <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-900/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-full text-amber-400"><Star size={24}/></div>
                    <div>
                      <h3 className="font-bold text-amber-400 text-lg">רגע, אנחנו לא מכירים!</h3>
                      <p className="text-amber-200/70 text-sm">הזן את שמך המלא כדי להופיע בטבלאות</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input id="newName" className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 outline-none transition" placeholder="שם מלא..." />
                    <button onClick={() => handleUpdateName((document.getElementById('newName') as HTMLInputElement).value)} className="bg-amber-500 text-slate-900 px-6 rounded-xl font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">שמור</button>
                  </div>
              </motion.div>
            )}

            {/* === DASHBOARD === */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                <header className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tight">לוח בקרה</h2>
                    <p className="text-slate-400 mt-2 text-lg">סיכום חודש {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <NeonStatCard title="בונוס חודשי" value={`₪${myTotalCommission.toLocaleString()}`} icon={Wallet} color="green" trend="הרווח הנקי שלך" />
                  <NeonStatCard title="מחזור מכירות" value={`₪${myTotalSales.toLocaleString()}`} icon={TrendingUp} color="blue" trend="יעד: 100,000" />
                  <NeonStatCard title="עסקאות שבוצעו" value={mySales.length} icon={Target} color="purple" trend="ממוצע: ₪3,200 לעסקה" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <GlassCard className="lg:col-span-2 min-h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-xl text-white flex items-center gap-3">
                        <Activity size={20} className="text-blue-400"/> מגמת ביצועים
                      </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #475569', color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}} />
                        <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  <GlassCard>
                    <h3 className="font-bold text-xl mb-6 text-white">התפלגות תיק</h3>
                    <div className="h-[300px] flex flex-col items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={[
                              { name: 'רגיל', value: mySales.filter(s => !s.is_split).length },
                              { name: 'משותף', value: mySales.filter(s => s.is_split).length }
                            ]} 
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
              <div className="space-y-8 animate-fade-in">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-10 rounded-3xl border border-blue-700/30 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                     <div>
                       <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                         <Crown size={12} /> ADMIN ACCESS
                       </div>
                       <h2 className="text-4xl font-black text-white">דשבורד ניהולי</h2>
                       <p className="text-blue-200 mt-2 text-lg">שליטה מלאה על ביצועי החברה</p>
                     </div>
                     <div className="text-right bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl">
                        <p className="text-sm text-blue-300 font-medium mb-1 uppercase tracking-wider">מחזור חברה כולל</p>
                        <p className="text-5xl font-black text-white tracking-tight">₪{companyTotal.toLocaleString()}</p>
                        <p className="text-sm text-slate-400 mt-2">בונוסים ששולמו: ₪{companyCommission.toLocaleString()}</p>
                     </div>
                   </div>
                </div>

                <GlassCard className="overflow-hidden p-0">
                  <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                    <h3 className="font-bold text-lg text-white">ביצועי נציגים בזמן אמת</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 font-medium uppercase tracking-wider text-xs">
                        <tr>
                          <th className="p-5 text-right">שם הנציג</th>
                          <th className="p-5 text-center">יעד חודשי</th>
                          <th className="p-5 text-center">עסקאות</th>
                          <th className="p-5 text-right">מחזור</th>
                          <th className="p-5 text-right">עמידה ביעד</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 text-slate-300">
                        {profiles.map(p => {
                          const pSales = sales.filter(s => s.user_id === p.id && new Date(s.sale_date).getMonth() === currentMonth);
                          const pTotal = pSales.reduce((a,b)=>a+b.amount,0);
                          const pPercent = ((pTotal / p.financial_target) * 100).toFixed(1);
                          return (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                              <td className="p-5 font-bold text-white flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm border border-slate-600 shadow-md group-hover:border-blue-500/50 transition-colors">{p.full_name?.[0]}</div>
                                <div>
                                  <div className="font-bold text-base">{p.full_name}</div>
                                  <div className="text-xs text-slate-500 font-normal">{p.email}</div>
                                </div>
                              </td>
                              <td className="p-5 text-center text-slate-500">₪{p.financial_target.toLocaleString()}</td>
                              <td className="p-5 text-center"><span className="bg-slate-800/50 px-3 py-1 rounded-lg font-mono border border-slate-700">{pSales.length}</span></td>
                              <td className="p-5 text-right font-bold text-blue-400 text-base">₪{pTotal.toLocaleString()}</td>
                              <td className="p-5 text-right w-56">
                                <div className="flex items-center gap-3">
                                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div style={{width: `${Math.min(parseFloat(pPercent), 100)}%`}} className={`h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-1000 ${parseFloat(pPercent) >= 100 ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-blue-600 shadow-blue-500/50'}`}></div>
                                  </div>
                                  <span className="text-xs w-10 font-mono font-bold">{pPercent}%</span>
                                </div>
                              </td>
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
              <div className="flex justify-center items-center min-h-[60vh] animate-fade-in">
                <GlassCard className="w-full max-w-xl border-t-4 border-t-blue-500">
                  <h2 className="text-3xl font-black text-white mb-8 text-center tracking-tight">רישום מכירה חדשה</h2>
                  <form onSubmit={handleSubmitSale} className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-400 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">שם הלקוח</label>
                      <input required value={client} onChange={e => setClient(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-white transition placeholder-slate-600" placeholder="לדוגמה: ישראל ישראלי" />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-400 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">סכום העסקה (₪)</label>
                      <div className="relative">
                        <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-white font-mono text-xl font-bold transition placeholder-slate-600" placeholder="0.00" />
                        <DollarSign className="absolute left-4 top-4 text-slate-500" size={20} />
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
               <div className="space-y-8 animate-fade-in">
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
                      const total = pSales.reduce((a,b) => a+b.amount, 0);
                      return { ...p, total, count: pSales.length };
                   }).sort((a,b) => b.total - a.total).map((stat, index) => (
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
                         <p className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">₪{stat.total.toLocaleString()}</p>
                         <p className="text-xs text-slate-500 font-medium mt-1">מחזור כולל</p>
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