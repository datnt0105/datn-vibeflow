const{useState}=React;
const D=[{day:"T2",v:3200000,o:4},{day:"T3",v:4100000,o:5},{day:"T4",v:2800000,o:3},{day:"T5",v:5600000,o:7},{day:"T6",v:7200000,o:9},{day:"T7",v:11500000,o:14},{day:"CN",v:9800000,o:12}];
const M=[{m:"T1",v:85e6},{m:"T2",v:72e6},{m:"T3",v:91e6},{m:"T4",v:88e6},{m:"T5",v:105e6},{m:"T6",v:98e6},{m:"T7",v:115e6},{m:"T8",v:125e6},{m:"T9",v:132e6},{m:"T10",v:140e6}];
const C=[{n:"Lê Thị Thanh",s:"Ca Sáng",o:18,r:22450000},{n:"Nguyễn Văn Hùng",s:"Ca Chiều",o:15,r:19800000},{n:"Trần Minh Tú",s:"Ca Tối",o:12,r:16200000},{n:"Phạm Đức Anh",s:"Ca Sáng",o:9,r:11350000}];
const P=[{m:"Tiền mặt",a:28500000,c:22,p:41,cl:"#c6f500"},{m:"QR Bank",a:19200000,c:15,p:28,cl:"#60a5fa"},{m:"Visa/Master",a:12800000,c:10,p:18,cl:"#a78bfa"},{m:"MoMo/ZaloPay",a:8900000,c:7,p:13,cl:"#fb923c"}];
const B=[{b:"HN - Phố Huế",r:32500000,o:26,t:"Nike Dunk Panda"},{b:"HN - Cầu Giấy",r:21800000,o:18,t:"Nike AF1"},{b:"HCM - Quang Trung",r:15100000,o:10,t:"Adidas Samba"}];
const TP=[
{n:"Nike Dunk Low Panda",sk:"NK-DNK-PND-02",sl:14,r:44100000,i:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200&auto=format&fit=crop&q=80"},
{n:"Nike Air Force 1",sk:"NK-AF1-WHT-04",sl:11,r:29150000,i:"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80"},
{n:"Adidas Samba Classic",sk:"AD-SMB-OG-03",sl:9,r:22050000,i:"https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=200&auto=format&fit=crop&q=80"},
{n:"Jordan 1 Shadow",sk:"NK-AJ1-SHD-01",sl:7,r:33950000,i:"https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=200&auto=format&fit=crop&q=80"},
{n:"New Balance 550",sk:"NB-550-WGR-05",sl:5,r:16000000,i:"https://images.unsplash.com/photo-1539185441755-769473a23570?w=200&auto=format&fit=crop&q=80"}];
const TX=[
{id:"POS-1055",t:"15:42",cs:"Lê Thị Thanh",cu:"Trần Văn Minh (VIP)",it:"1x Nike Dunk Panda (41)",to:3150000,pa:"Tiền mặt",st:"done"},
{id:"POS-1054",t:"15:18",cs:"Lê Thị Thanh",cu:"Nguyễn Hải Yến",it:"1x Jordan 1 Shadow (39)",to:4850000,pa:"QR VietQR",st:"done"},
{id:"POS-1053",t:"14:55",cs:"Nguyễn Văn Hùng",cu:"Phạm Đức Long",it:"1x Samba OG (42)",to:2450000,pa:"Visa",st:"done"},
{id:"POS-1052",t:"14:30",cs:"Nguyễn Văn Hùng",cu:"Lê Hoàng Nam",it:"2x Nike AF1 (43,40)",to:5300000,pa:"Tiền mặt",st:"done"},
{id:"POS-1051",t:"13:50",cs:"Trần Minh Tú",cu:"Khách lẻ",it:"1x NB 550 (41)",to:3200000,pa:"MoMo",st:"done"},
{id:"POS-1050",t:"13:15",cs:"Trần Minh Tú",cu:"Vũ Thị Hương",it:"1x Yeezy 350 (42)",to:6800000,pa:"Master",st:"refund"}];
const HR=[{h:"8h",c:2},{h:"9h",c:5},{h:"10h",c:8},{h:"11h",c:12},{h:"12h",c:6},{h:"13h",c:9},{h:"14h",c:14},{h:"15h",c:16},{h:"16h",c:18},{h:"17h",c:22},{h:"18h",c:19},{h:"19h",c:15},{h:"20h",c:10},{h:"21h",c:4}];
function App(){
const[se,setSe]=useState(null);
const[pe,setPe]=useState('7days');
const[ac,setAc]=useState('overview');
React.useEffect(()=>{const s=localStorage.getItem('vibeflow_session');if(s)try{setSe(JSON.parse(s))}catch(e){}},[]);
const tR=D.reduce((s,d)=>s+d.v,0),tO=D.reduce((s,d)=>s+d.o,0),mD=Math.max(...D.map(d=>d.v)),mH=Math.max(...HR.map(h=>h.c)),mM=Math.max(...M.map(m=>m.v));
const f=n=>n.toLocaleString('vi-VN');
return(
<div className="bg-black text-slate-100 min-h-screen flex flex-col selection:bg-[#c6f500] selection:text-black">
<header className="bg-zinc-950 border-b border-zinc-800 h-14 flex items-center justify-between px-4 sm:px-6 z-30">
<div className="flex items-center space-x-3">
<a href="admin.html" className="flex items-center space-x-2 hover:opacity-80 transition">
<svg className="w-7 h-7" viewBox="0 0 40 40" fill="none"><path d="M8 12L15 28L22 12" stroke="#FFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4.5" strokeLinecap="round"/></svg>
<span className="text-xl font-black italic tracking-tight"><span className="text-white">Vibe</span><span className="text-[#c6f500]">Flow</span></span>
</a>
<span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[#c6f500] text-[10px] font-black uppercase">Thống Kê POS</span>
</div>
<div className="flex items-center space-x-3 text-xs">
<span className="hidden sm:flex items-center space-x-2 text-zinc-300"><span className="w-2 h-2 rounded-full bg-[#c6f500] animate-pulse"></span><span>{se?.branch||'160 Phố Huế'}</span></span>
<a href="admin.html" className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 font-bold transition">← Admin</a>
</div>
</header>
<div className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6">
<div className="flex items-center space-x-1 overflow-x-auto py-2">
{[{id:'overview',l:'📊 Tổng Quan'},{id:'cashiers',l:'👥 Thu Ngân'},{id:'payments',l:'💳 Thanh Toán'},{id:'branches',l:'🏪 Chi Nhánh'},{id:'transactions',l:'📋 Giao Dịch'}].map(t=>(
<button key={t.id} onClick={()=>setAc(t.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${ac===t.id?'bg-[#c6f500] text-black shadow':'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>{t.l}</button>
))}
</div>
</div>
<main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
<div>
<h1 className="text-xl font-black uppercase text-white flex items-center space-x-2"><span className="text-[#c6f500]">💵</span><span>Thống Kê Bán Hàng Tại Quầy POS</span></h1>
<p className="text-xs text-zinc-400 mt-0.5">Phân tích doanh thu, nhân viên, thanh toán tại quầy bán hàng trực tiếp.</p>
</div>
<div className="flex items-center gap-2">
{[{id:'today',l:'Hôm nay'},{id:'7days',l:'7 ngày'},{id:'month',l:'Tháng này'},{id:'year',l:'Năm 2026'}].map(p=>(
<button key={p.id} onClick={()=>setPe(p.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${pe===p.id?'bg-[#c6f500] text-black shadow':'bg-zinc-900 text-zinc-400 hover:text-white'}`}>{p.l}</button>
))}
<button onClick={()=>alert("Xuất Excel...")} className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition">📥 Excel</button>
</div>
</div>
{ac==='overview'&&(
<div className="space-y-6">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
<div className="flex justify-between items-center text-xs text-zinc-400"><span>Doanh Thu POS</span><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">+22.5%</span></div>
<div className="text-2xl font-black text-white">{f(tR)}₫</div>
<div className="text-[11px] text-zinc-500">Kỳ trước: 35.800.000₫</div>
</div>
<div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
<div className="flex justify-between items-center text-xs text-zinc-400"><span>Tổng Đơn POS</span><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">+15.2%</span></div>
<div className="text-2xl font-black text-white">{tO} đơn</div>
<div className="text-[11px] text-zinc-500">TB {Math.round(tO/7)} đơn/ngày</div>
</div>
<div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
<div className="flex justify-between items-center text-xs text-zinc-400"><span>Giá Trị TB/Đơn</span><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">+8.1%</span></div>
<div className="text-2xl font-black text-[#c6f500]">{f(Math.round(tR/tO))}₫</div>
<div className="text-[11px] text-zinc-500">Cao hơn Online 12%</div>
</div>
<div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
<div className="flex justify-between items-center text-xs text-zinc-400"><span>Khách Hôm Nay</span><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-400/15 text-blue-400">Live</span></div>
<div className="text-2xl font-black text-white">86 lượt</div>
<div className="text-[11px] text-zinc-500">Tỷ lệ mua: 32%</div>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
<div className="flex justify-between items-center">
<div><h3 className="font-black text-sm uppercase text-white">Doanh Thu POS 7 Ngày</h3><p className="text-[11px] text-zinc-400">Doanh thu bán hàng tại quầy.</p></div>
<span className="text-xs font-bold text-[#c6f500]">Đỉnh: {(mD/1e6).toFixed(1)}M</span>
</div>
<div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-zinc-800 pb-2">
{D.map((it,i)=>(
<div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
<div className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition font-mono mb-1">{(it.v/1e6).toFixed(1)}M</div>
<div style={{height:`${(it.v/mD)*100}%`}} className={`w-full rounded-t-lg transition duration-300 ${it.v===mD?'bg-[#c6f500] shadow-[0_0_15px_rgba(198,245,0,0.5)]':'bg-zinc-800 hover:bg-[#c6f500]/70'}`}></div>
<span className="text-[10px] font-bold text-zinc-400 mt-2">{it.day}</span>
<span className="text-[9px] text-zinc-500">{it.o} đơn</span>
</div>))}
</div>
</div>
<div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
<h3 className="font-black text-sm uppercase text-white">Lưu Lượng Khách/Giờ</h3>
<p className="text-[11px] text-zinc-400">Khung giờ vàng: 16h-18h</p>
<div className="space-y-1.5">{HR.map((h,i)=>(
<div key={i} className="flex items-center gap-2 text-[11px]">
<span className="w-8 text-zinc-500 font-mono text-right">{h.h}</span>
<div className="flex-1 bg-zinc-900 rounded-full h-4 overflow-hidden"><div style={{width:`${(h.c/mH)*100}%`}} className={`h-full rounded-full ${h.c>=18?'bg-[#c6f500]':h.c>=10?'bg-[#c6f500]/60':'bg-zinc-700'}`}></div></div>
<span className={`w-6 font-bold ${h.c>=18?'text-[#c6f500]':'text-zinc-400'}`}>{h.c}</span>
</div>))}</div>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
<h3 className="font-black text-sm uppercase text-white">🏆 Top SP Bán Chạy Tại Quầy</h3>
<div className="space-y-2.5 text-xs">{TP.map((p,i)=>(
<div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900/60 transition">
<div className="flex items-center space-x-3">
<span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${i===0?'bg-[#c6f500] text-black':'bg-zinc-800 text-zinc-300'}`}>{i+1}</span>
<img src={p.i} className="w-10 h-10 rounded-lg object-cover bg-zinc-900" alt={p.n}/>
<div><div className="font-bold text-white">{p.n}</div><div className="text-[10px] text-zinc-500">{p.sk} • {p.sl} đôi</div></div>
</div>
<div className="font-black text-[#c6f500]">{f(p.r)}₫</div>
</div>))}</div>
</div>
<div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
<h3 className="font-black text-sm uppercase text-white">📈 Xu Hướng DT POS Theo Tháng</h3>
<div className="h-40 flex items-end justify-between gap-1.5 pt-4 border-b border-zinc-800 pb-2">{M.map((m,i)=>(
<div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
<div className="text-[9px] text-zinc-400 opacity-0 group-hover:opacity-100 transition font-mono mb-1">{(m.v/1e6).toFixed(0)}M</div>
<div style={{height:`${(m.v/mM)*100}%`}} className={`w-full rounded-t-md transition duration-300 ${m.v===mM?'bg-[#c6f500] shadow-[0_0_10px_rgba(198,245,0,0.4)]':'bg-zinc-700 hover:bg-[#c6f500]/60'}`}></div>
<span className="text-[9px] font-bold text-zinc-500 mt-1">{m.m}</span>
</div>))}</div>
</div>
</div>
</div>)}

{ac==='cashiers'&&(
<div className="space-y-6">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
{C.map((c,i)=>(
<div key={i} className={`bg-zinc-950 border rounded-2xl p-4 space-y-3 ${i===0?'border-[#c6f500]/50':'border-zinc-800'}`}>
<div className="flex items-center space-x-3">
<span className="text-2xl">{i%2===0?'👩‍💼':'👨‍💼'}</span>
<div><div className="font-bold text-white text-sm">{c.n}</div><div className="text-[10px] text-zinc-500">{c.s}</div></div>
{i===0&&<span className="ml-auto px-2 py-0.5 bg-[#c6f500]/15 text-[#c6f500] text-[10px] font-bold rounded">🏆</span>}
</div>
<div className="grid grid-cols-2 gap-2 text-xs">
<div className="bg-zinc-900 rounded-xl p-2 text-center"><div className="text-zinc-500 text-[10px]">Đơn</div><div className="font-black text-white">{c.o}</div></div>
<div className="bg-zinc-900 rounded-xl p-2 text-center"><div className="text-zinc-500 text-[10px]">DT</div><div className="font-black text-[#c6f500]">{(c.r/1e6).toFixed(1)}M</div></div>
</div>
<div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden"><div style={{width:`${(c.r/C[0].r)*100}%`}} className="h-full bg-[#c6f500] rounded-full"></div></div>
</div>))}
</div>
<div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
<h3 className="font-black text-sm uppercase text-white">So Sánh Hiệu Suất</h3>
<div className="space-y-3">{C.map((c,i)=>(
<div key={i} className="flex items-center gap-3 text-xs">
<span className="w-28 font-bold text-white truncate">{c.n}</span>
<div className="flex-1 bg-zinc-900 rounded-full h-6 overflow-hidden">
<div style={{width:`${(c.r/C[0].r)*100}%`}} className={`h-full rounded-full flex items-center justify-end pr-2 ${['bg-[#c6f500]','bg-blue-500','bg-purple-500','bg-orange-500'][i]}`}>
<span className="text-[10px] font-bold text-black">{f(c.r)}₫</span>
</div></div>
<span className="w-14 text-right font-bold text-zinc-400">{c.o} đơn</span>
</div>))}</div>
</div>
</div>)}
{ac==='payments'&&(
<div className="space-y-6">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
{P.map((pm,i)=>(
<div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
<div className="flex justify-between items-center"><span className="text-xs font-bold text-zinc-400">{pm.m}</span><span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{background:`${pm.cl}20`,color:pm.cl}}>{pm.p}%</span></div>
<div className="text-xl font-black text-white">{f(pm.a)}₫</div>
<div className="text-[11px] text-zinc-500">{pm.c} giao dịch</div>
<div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden"><div style={{width:`${pm.p}%`,backgroundColor:pm.cl}} className="h-full rounded-full"></div></div>
</div>))}
</div>
<div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
<h3 className="font-black text-sm uppercase text-white">Tỷ Trọng Thanh Toán</h3>
<div className="flex h-10 rounded-xl overflow-hidden">
{P.map((pm,i)=>(<div key={i} style={{width:`${pm.p}%`,backgroundColor:pm.cl}} className="h-full flex items-center justify-center text-[10px] font-bold text-black hover:opacity-80 transition">{pm.p>=15&&`${pm.p}%`}</div>))}
</div>
<div className="flex flex-wrap gap-4 text-xs">{P.map((pm,i)=>(<div key={i} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{backgroundColor:pm.cl}}></span><span className="text-zinc-300">{pm.m} ({pm.p}%)</span></div>))}</div>
</div>
</div>)}

{ac==='branches'&&(
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
{B.map((b,i)=>(
<div key={i} className={`bg-zinc-950 border rounded-2xl p-5 space-y-4 ${i===0?'border-[#c6f500]/50':'border-zinc-800'}`}>
<div className="flex items-start justify-between">
<div><div className="text-[10px] text-zinc-500 uppercase font-bold">Chi Nhánh #{i+1}</div><div className="font-bold text-white text-sm mt-1">{b.b}</div></div>
{i===0&&<span className="px-2 py-0.5 bg-[#c6f500]/15 text-[#c6f500] text-[10px] font-bold rounded">🏆</span>}
</div>
<div className="grid grid-cols-2 gap-3 text-xs">
<div className="bg-zinc-900 rounded-xl p-3 text-center"><div className="text-zinc-500 text-[10px]">Doanh Thu</div><div className="font-black text-[#c6f500] text-lg">{(b.r/1e6).toFixed(1)}M</div></div>
<div className="bg-zinc-900 rounded-xl p-3 text-center"><div className="text-zinc-500 text-[10px]">Đơn</div><div className="font-black text-white text-lg">{b.o}</div></div>
</div>
<div className="text-xs text-zinc-400">SP chạy nhất: <b className="text-white">{b.t}</b></div>
<div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden"><div style={{width:`${(b.r/B[0].r)*100}%`}} className="h-full bg-[#c6f500] rounded-full"></div></div>
</div>))}
</div>)}
{ac==='transactions'&&(
<div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
<table className="w-full text-xs text-left">
<thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
<tr><th className="p-3">Mã GD</th><th className="p-3">Giờ</th><th className="p-3">Thu Ngân</th><th className="p-3">Khách</th><th className="p-3">SP</th><th className="p-3 text-right">Tổng</th><th className="p-3">TT</th><th className="p-3 text-center">TT</th></tr>
</thead>
<tbody className="divide-y divide-zinc-800/60">
{TX.map((t,i)=>(
<tr key={i} className="hover:bg-zinc-900/40 transition">
<td className="p-3 font-mono font-bold text-[#c6f500]">#{t.id}</td>
<td className="p-3 text-zinc-300">{t.t}</td>
<td className="p-3 text-zinc-300">{t.cs}</td>
<td className="p-3 font-bold text-white">{t.cu}</td>
<td className="p-3 text-zinc-300">{t.it}</td>
<td className="p-3 text-right font-black text-white">{f(t.to)}₫</td>
<td className="p-3 text-zinc-300">{t.pa}</td>
<td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.st==='done'?'bg-[#c6f500]/15 text-[#c6f500]':'bg-red-400/15 text-red-400'}`}>{t.st==='done'?'OK':'Trả'}</span></td>
</tr>))}
</tbody></table></div>)}

</main>
<footer className="border-t border-zinc-900 py-3 text-center text-[11px] text-zinc-500">© 2026 VibeFlow Sneakers • Thống Kê POS</footer>
</div>);}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

