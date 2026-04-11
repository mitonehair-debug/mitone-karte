import { useState, useRef, useEffect, useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore, collection, doc,
  getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8BgfKcTykKPzNiBPUtxlDmTbkLtAFQ7o",
  authDomain: "mitone93.firebaseapp.com",
  projectId: "mitone93",
  storageBucket: "mitone93.firebasestorage.app",
  messagingSenderId: "281631776792",
  appId: "1:281631776792:web:74a0ff50cfa416c81fa36d",
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const STAFF_PASSWORD = "6900";
const AUTO_LOCK_MS = 10 * 60 * 1000;

const TAGS = ["カット","カラー（基本）","デザインカラー","パーマ","ストレート・縮毛矯正","トリートメント","ヘッドスパ","カウンセリングのみ","その他"];
const VISIT_SOURCES = ["ご紹介","SNS（Instagram・TikTok等）","ホットペッパービューティー","ネット検索（Google等）","通りがかり・近所","チラシ・看板","その他"];
const DRAW_COLORS = [{color:"#1a1a1a",label:"黒"},{color:"#c0392b",label:"赤"},{color:"#2980b9",label:"青"}];
const BRUSH_SIZES = [{size:2,label:"細"},{size:5,label:"中"},{size:10,label:"太"}];

const GOLD="#c9a96e",GOLD_LIGHT="#f5ede0",GOLD_DARK="#8a6a40",PRIMARY="#1a1a1a",SUB="#888",BORDER="#e5ddd3",DANGER="#c0392b",ORANGE="#d4600a",GREEN="#2e7d52",BG="#f8f6f3";
const eForm={name:"",kana:"",phone:"",email:"",birthYear:"",birthMonth:"",birthDay:"",address:"",memo:"",source:""};
const eVisit={date:"",tags:[],staff:"",memo:"",photo:null,drawing:null,purchases:[]};
const eCheckin={name:"",kana:"",phone:"",email:"",birthYear:"",birthMonth:"",birthDay:"",address:"",allergy:"",source:""};

function daysSince(d){if(!d)return null;return Math.floor((new Date()-new Date(d))/86400000);}
function lastVisit(c){if(!c.visits||!c.visits.length)return null;return c.visits.map(v=>v.date).sort().reverse()[0];}
function isValid(f){return f.name.trim()&&f.kana.trim()&&f.phone.trim();}
function formatBirthday(y,m,d){if(!y&&!m&&!d)return "";return [y,m&&String(m).padStart(2,"0"),d&&String(d).padStart(2,"0")].filter(Boolean).join("/");}

const YEARS = Array.from({length:100},(_,i)=>String(new Date().getFullYear()-i));
const MONTHS = Array.from({length:12},(_,i)=>String(i+1));
const DAYS = Array.from({length:31},(_,i)=>String(i+1));

function drawDiagram(ctx,W,H){ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);const cx=W*0.22,cy=H*0.5,rx=W*0.11,ry=H*0.32;ctx.strokeStyle="#aaa";ctx.lineWidth=1.6;ctx.lineCap="round";ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();}

function HeadCanvas({savedData,onSave,readOnly}){
  const canvasRef=useRef();const drawing=useRef(false);const lastPos=useRef(null);
  const [penColor,setPenColor]=useState("#c0392b");const [penSize,setPenSize]=useState(5);const [eraser,setEraser]=useState(false);
  const W=400,H=220;
  function init(){const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");drawDiagram(ctx,W,H);if(savedData){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0);img.src=savedData;}}
  useEffect(()=>{init();},[]);
  function getXY(e){const c=canvasRef.current,r=c.getBoundingClientRect();const sx=W/r.width,sy=H/r.height;const s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sx,y:(s.clientY-r.top)*sy};}
  function onStart(e){if(readOnly)return;e.preventDefault();drawing.current=true;lastPos.current=getXY(e);}
  function onMove(e){if(!drawing.current||readOnly)return;e.preventDefault();const ctx=canvasRef.current.getContext("2d"),pos=getXY(e);ctx.beginPath();ctx.strokeStyle=eraser?"#fff":penColor;ctx.lineWidth=eraser?penSize*3:penSize;ctx.lineCap="round";ctx.lineJoin="round";ctx.moveTo(lastPos.current.x,lastPos.current.y);ctx.lineTo(pos.x,pos.y);ctx.stroke();lastPos.current=pos;}
  function onEnd(){if(!drawing.current)return;drawing.current=false;if(onSave)onSave(canvasRef.current.toDataURL());}
  function onClear(){drawDiagram(canvasRef.current.getContext("2d"),W,H);if(onSave)onSave(null);}
  if(readOnly)return savedData?<img src={savedData} alt="施術図" style={{width:"100%",borderRadius:8,border:`1px solid ${BORDER}`}}/>:null;
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10,flexWrap:"wrap"}}>
        {DRAW_COLORS.map(c=><button key={c.color} onClick={()=>{setPenColor(c.color);setEraser(false);}} style={{width:28,height:28,borderRadius:"50%",background:c.color,cursor:"pointer",flexShrink:0,border:penColor===c.color&&!eraser?`3px solid ${GOLD}`:"2px solid #ddd"}}/>)}
        <div style={{width:1,height:24,background:BORDER,margin:"0 2px"}}/>
        {BRUSH_SIZES.map(b=><button key={b.size} onClick={()=>{setPenSize(b.size);setEraser(false);}} style={{padding:"3px 9px",borderRadius:7,fontSize:11,cursor:"pointer",border:"1.5px solid",borderColor:penSize===b.size&&!eraser?GOLD:BORDER,background:penSize===b.size&&!eraser?GOLD_LIGHT:"#fff",color:penSize===b.size&&!eraser?GOLD_DARK:SUB}}>{b.label}</button>)}
        <div style={{width:1,height:24,background:BORDER,margin:"0 2px"}}/>
        <button onClick={()=>setEraser(v=>!v)} style={{padding:"3px 9px",borderRadius:7,fontSize:11,cursor:"pointer",background:eraser?GOLD:GOLD_LIGHT,color:eraser?"#fff":PRIMARY,border:`1.5px solid ${eraser?GOLD_DARK:GOLD}`}}>消しゴム</button>
        <button onClick={onClear} style={{padding:"3px 9px",borderRadius:7,fontSize:11,cursor:"pointer",background:"#fdecea",color:DANGER,border:`1.5px solid ${DANGER}`}}>クリア</button>
      </div>
      <div style={{border:`1.5px solid ${BORDER}`,borderRadius:10,overflow:"hidden",touchAction:"none",background:"#fff"}}>
        <canvas ref={canvasRef} width={W} height={H} style={{width:"100%",height:"auto",display:"block",cursor:eraser?"cell":"crosshair"}}
          onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
          onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}/>
      </div>
      <div style={{fontSize:10,color:SUB,marginTop:4,textAlign:"center"}}>Apple Pencilまたは指で自由に書き込めます</div>
    </div>
  );
}

function BirthdaySelect({year,month,day,onChange,dark=false}){
  const sel={padding:"10px 6px",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",border:dark?"1px solid rgba(201,169,110,0.25)":`1.5px solid ${BORDER}`,background:dark?"rgba(255,255,255,0.08)":"#fafaf8",color:dark?"#f0e8d8":PRIMARY,cursor:"pointer"};
  return(
    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
      <select value={year} onChange={e=>onChange("year",e.target.value)} style={{...sel,width:90}}><option value="">年</option>{YEARS.map(y=><option key={y} value={y}>{y}</option>)}</select>
      <span style={{color:dark?"rgba(201,169,110,0.6)":SUB,fontSize:13}}>年</span>
      <select value={month} onChange={e=>onChange("month",e.target.value)} style={{...sel,width:66}}><option value="">月</option>{MONTHS.map(m=><option key={m} value={m}>{m}</option>)}</select>
      <span style={{color:dark?"rgba(201,169,110,0.6)":SUB,fontSize:13}}>月</span>
      <select value={day} onChange={e=>onChange("day",e.target.value)} style={{...sel,width:66}}><option value="">日</option>{DAYS.map(d=><option key={d} value={d}>{d}</option>)}</select>
      <span style={{color:dark?"rgba(201,169,110,0.6)":SUB,fontSize:13}}>日</span>
    </div>
  );
}

export default function App(){
  const [loggedIn,setLoggedIn]=useState(false);
  const [pwInput,setPwInput]=useState("");
  const [pwError,setPwError]=useState(false);
  const [customers,setCustomers]=useState([]);
  const [trash,setTrash]=useState([]);
  const [loading,setLoading]=useState(true);
  const [pending,setPending]=useState([]);
  const [view,setView]=useState("list");
  const [selId,setSelId]=useState(null);
  const [search,setSearch]=useState("");
  const [cForm,setCForm]=useState(eForm);
  const [editingCustomer,setEditingCustomer]=useState(false);
  const [vForm,setVForm]=useState(eVisit);
  const [editVid,setEditVid]=useState(null);
  const [ciForm,setCiForm]=useState(eCheckin);
  const [alertM,setAlertM]=useState(5);
  const [toast,setToast]=useState(null);
  const [ciTouched,setCiTouched]=useState(false);
  const [vTouched,setVTouched]=useState(false);
  const photoRef=useRef();
  const lockTimer=useRef(null);

  const sel=customers.find(c=>c.id===selId);
  const filtered=customers.filter(c=>c.name.includes(search)||(c.kana||"").includes(search)||(c.phone||"").includes(search));
  const alertDays=alertM*30;
  const lost=customers.filter(c=>{const l=lastVisit(c);return l&&daysSince(l)>=alertDays;});

  const resetTimer=useCallback(()=>{
    if(lockTimer.current)clearTimeout(lockTimer.current);
    lockTimer.current=setTimeout(()=>{setLoggedIn(false);setPwInput("");},AUTO_LOCK_MS);
  },[]);

  useEffect(()=>{
    if(!loggedIn)return;
    resetTimer();
    const events=["click","touchstart","keydown","mousemove"];
    events.forEach(e=>window.addEventListener(e,resetTimer));
    return()=>{if(lockTimer.current)clearTimeout(lockTimer.current);events.forEach(e=>window.removeEventListener(e,resetTimer));};
  },[loggedIn,resetTimer]);

  useEffect(()=>{
    if(!loggedIn)return;
    loadCustomers();
    const interval=setInterval(()=>loadPending(),30000);
    return()=>clearInterval(interval);
  },[loggedIn]);

  async function loadCustomers(){
    setLoading(true);
    try{
      const q=query(collection(db,"customers"),orderBy("createdAt","desc"));
      const snap=await getDocs(q);
      setCustomers(snap.docs.map(d=>({id:d.id,...d.data()})));
      const tq=query(collection(db,"trash"),orderBy("deletedAt","desc"));
      const tsnap=await getDocs(tq);
      setTrash(tsnap.docs.map(d=>({id:d.id,...d.data()})));
      await loadPending();
    }catch(e){showToast("読み込みエラー","error");}
    setLoading(false);
  }

  async function loadPending(){
    try{
      const pq=query(collection(db,"pending"),orderBy("createdAt","desc"));
      const psnap=await getDocs(pq);
      setPending(psnap.docs.map(d=>({...d.data(),_docId:d.id})));
    }catch(e){console.error("pending読み込みエラー",e);}
  }

  function showToast(msg,type="ok"){setToast({msg,type});setTimeout(()=>setToast(null),2800);}
  function handleLogin(){if(pwInput===STAFF_PASSWORD){setLoggedIn(true);setPwError(false);}else{setPwError(true);}}

  async function addCustomer(){
    if(!cForm.name||!cForm.kana||!cForm.phone)return;
    try{const ref=await addDoc(collection(db,"customers"),{...cForm,visits:[],purchases:[],createdAt:serverTimestamp()});setCustomers([{...cForm,id:ref.id,visits:[],purchases:[]},...customers]);setCForm(eForm);setView("list");showToast("登録しました");}
    catch(e){showToast("登録に失敗しました","error");}
  }

  async function updateCustomer(){
    try{await updateDoc(doc(db,"customers",selId),cForm);setCustomers(customers.map(c=>c.id===selId?{...c,...cForm}:c));setEditingCustomer(false);showToast("更新しました");}
    catch(e){showToast("更新に失敗しました","error");}
  }

  async function approve(idx){
    const c=pending[idx];
    try{
      const data={name:c.name,kana:c.kana,phone:c.phone,email:c.email,birthYear:c.birthYear||"",birthMonth:c.birthMonth||"",birthDay:c.birthDay||"",address:c.address||"",memo:c.allergy||"",source:c.source||"",visits:[],purchases:[],createdAt:serverTimestamp()};
      const ref=await addDoc(collection(db,"customers"),data);
      if(c._docId)await deleteDoc(doc(db,"pending",c._docId));
      setCustomers([{...data,id:ref.id},...customers]);setPending(pending.filter((_,i)=>i!==idx));showToast("カルテに登録しました");
    }catch(e){showToast("登録に失敗しました","error");}
  }

  async function delCustomer(id){
    if(!window.confirm("このお客様をゴミ箱に移しますか？"))return;
    const customer=customers.find(c=>c.id===id);
    try{
      await addDoc(collection(db,"trash"),{...customer,originalId:id,deletedAt:serverTimestamp()});
      await deleteDoc(doc(db,"customers",id));
      setCustomers(customers.filter(c=>c.id!==id));setTrash([{...customer,originalId:id},...trash]);setView("list");showToast("ゴミ箱に移しました");
    }catch(e){showToast("削除に失敗しました","error");}
  }

  async function restoreCustomer(t){
    if(!window.confirm(`「${t.name}」を復元しますか？`))return;
    try{
      const{id:tid,originalId,deletedAt,...data}=t;
      const ref=await addDoc(collection(db,"customers"),{...data,createdAt:serverTimestamp()});
      await deleteDoc(doc(db,"trash",tid));
      setCustomers([{...data,id:ref.id},...customers]);setTrash(trash.filter(x=>x.id!==tid));showToast("復元しました");
    }catch(e){showToast("復元に失敗しました","error");}
  }

  async function permDelete(t){
    if(!window.confirm(`「${t.name}」を完全に削除しますか？\nこの操作は取り消せません。`))return;
    try{await deleteDoc(doc(db,"trash",t.id));setTrash(trash.filter(x=>x.id!==t.id));showToast("完全に削除しました");}
    catch(e){showToast("削除に失敗しました","error");}
  }

  async function saveVisit(){
    setVTouched(true);if(!vForm.date)return;
    const customer=customers.find(c=>c.id===selId);
    const newVisits=editVid?customer.visits.map(v=>v.id===editVid?{...vForm,id:editVid}:v):[{...vForm,id:"v"+Date.now()},...(customer.visits||[])];
    try{
      await updateDoc(doc(db,"customers",selId),{visits:newVisits});
      setCustomers(customers.map(c=>c.id!==selId?c:{...c,visits:newVisits}));
      setVForm(eVisit);setEditVid(null);setVTouched(false);setView("detail");showToast(editVid?"更新しました":"来店記録を追加しました");
    }catch(e){showToast("保存に失敗しました","error");}
  }

  async function delVisit(vid){
    if(!window.confirm("この来店記録を削除しますか？"))return;
    const customer=customers.find(c=>c.id===selId);
    const newVisits=customer.visits.filter(v=>v.id!==vid);
    try{await updateDoc(doc(db,"customers",selId),{visits:newVisits});setCustomers(customers.map(c=>c.id!==selId?c:{...c,visits:newVisits}));showToast("削除しました");}
    catch(e){showToast("削除に失敗しました","error");}
  }

  function toggleTag(t){const tags=vForm.tags||[];setVForm({...vForm,tags:tags.includes(t)?tags.filter(x=>x!==t):[...tags,t]});}
  function handlePhoto(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setVForm(x=>({...x,photo:ev.target.result}));r.readAsDataURL(f);}
  function submitCheckin(){
    setCiTouched(true);
    if(!isValid(ciForm)||!ciForm.source)return;
    addDoc(collection(db,"pending"),{...ciForm,createdAt:serverTimestamp()})
      .then(ref=>{setPending([...pending,{...ciForm,_docId:ref.id}]);setCiForm(eCheckin);setCiTouched(false);setView("checkinDone");})
      .catch(()=>{setPending([...pending,ciForm]);setCiForm(eCheckin);setCiTouched(false);setView("checkinDone");});
  }
  function addPurchaseToVisit(){setVForm(f=>({...f,purchases:[...(f.purchases||[]),{id:"p"+Date.now(),item:"",price:"",memo:""}]}));}
  function updatePurchase(pid,field,val){setVForm(f=>({...f,purchases:(f.purchases||[]).map(p=>p.id===pid?{...p,[field]:val}:p)}));}
  function removePurchase(pid){setVForm(f=>({...f,purchases:(f.purchases||[]).filter(p=>p.id!==pid)}));}
  function bdonChange(target,f,v){
    const key=f==="year"?"birthYear":f==="month"?"birthMonth":"birthDay";
    if(target==="ci")setCiForm(x=>({...x,[key]:v}));
    else if(target==="cf")setCForm(x=>({...x,[key]:v}));
  }

  const inp={width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${BORDER}`,fontSize:14,background:"#fafaf8",outline:"none",boxSizing:"border-box"};
  const ta={...inp,minHeight:72,resize:"vertical"};
  const btnP={background:PRIMARY,color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"};
  const btnS={background:GOLD_LIGHT,color:PRIMARY,border:`1.5px solid ${GOLD}`,borderRadius:8,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer"};
  const btnD={background:"none",border:`1.5px solid ${DANGER}`,color:DANGER,borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer"};
  const card={background:"#fff",borderRadius:14,padding:"18px 16px",border:`1.5px solid ${BORDER}`};
  const fw={maxWidth:560,margin:"0 auto"};
  const bk={background:"none",border:"none",color:GOLD,fontSize:13,fontWeight:600,cursor:"pointer",padding:0};
  const lbl={display:"block",fontSize:11,fontWeight:700,color:SUB,marginBottom:4};
  const req=<span style={{background:"rgba(224,112,112,0.15)",color:DANGER,fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>必須</span>;
  const opt=<span style={{background:"#f0ece6",color:SUB,fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>任意</span>;

  if(!loggedIn)return(
    <div style={{minHeight:"100vh",background:"#1a1512",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(201,169,110,0.25)",borderRadius:20,padding:"48px 32px",width:"90%",maxWidth:380,textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:"50%",border:"1.5px solid rgba(201,169,110,0.5)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{fontSize:28,fontWeight:900,color:"#c9a96e"}}>M</span></div>
        <div style={{fontSize:20,fontWeight:700,color:"#f0e8d8",letterSpacing:8,marginBottom:4}}>MITONE</div>
        <div style={{fontSize:11,color:"rgba(201,169,110,0.5)",letterSpacing:4,marginBottom:32}}>スタッフログイン</div>
        <input type="password" placeholder="パスワード" value={pwInput} onChange={e=>setPwInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          style={{width:"100%",padding:"12px 14px",borderRadius:10,border:pwError?"1px solid #e07070":"1px solid rgba(201,169,110,0.3)",background:"rgba(255,255,255,0.05)",color:"#f0e8d8",fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
        {pwError&&<div style={{fontSize:12,color:"#e07070",marginBottom:12}}>パスワードが違います</div>}
        <button onClick={handleLogin} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#c9a96e,#a07840)",color:"#1a1512",fontSize:15,fontWeight:800,cursor:"pointer",marginTop:8}}>ログイン</button>
      </div>
    </div>
  );

  if(view==="checkin")return(
    <div style={{minHeight:"100vh",background:"#1a1512",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",fontFamily:"Georgia,serif"}}>
      <div style={{position:"absolute",top:-150,right:-150,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,169,110,0.12) 0%,transparent 70%)"}}/>
      <div style={{width:"100%",maxWidth:480,padding:"30px 20px 50px",display:"flex",flexDirection:"column",alignItems:"center",gap:22,position:"relative",zIndex:1}}>
        <div style={{width:"100%"}}>
          <button onClick={()=>setView("list")} style={{background:"none",border:"1px solid rgba(201,169,110,0.3)",color:"rgba(201,169,110,0.7)",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>← スタッフ画面に戻る</button>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{width:66,height:66,borderRadius:"50%",border:"1.5px solid rgba(201,169,110,0.5)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",background:"rgba(201,169,110,0.06)"}}><span style={{fontSize:28,fontWeight:900,color:"#c9a96e"}}>M</span></div>
          <div style={{fontSize:20,fontWeight:700,color:"#f0e8d8",letterSpacing:8}}>MITONE</div>
          <div style={{fontSize:11,color:"rgba(201,169,110,0.6)",letterSpacing:4,marginTop:4}}>Hair &amp; Beauty</div>
        </div>
        <div style={{width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(201,169,110,0.2)",borderRadius:20,padding:"24px 20px"}}>
          <div style={{fontSize:15,fontWeight:600,color:"#f0e8d8",textAlign:"center",marginBottom:4,letterSpacing:1}}>ご来店ありがとうございます</div>
          <div style={{fontSize:12,color:"rgba(240,232,216,0.4)",textAlign:"center",marginBottom:20,lineHeight:1.8}}>はじめてのお客様は以下をご記入ください</div>
          {[{l:"お名前",k:"name",p:"山田 花子"},{l:"ふりがな",k:"kana",p:"やまだ はなこ"},{l:"携帯番号",k:"phone",t:"tel",p:"09012345678"}].map(f=>(
            <div key={f.k} style={{marginBottom:15}}>
              <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:5,letterSpacing:1.5}}>{f.l}<span style={{background:"rgba(224,112,112,0.2)",color:"#e07070",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>必須</span></label>
              {f.k==="phone"&&<div style={{fontSize:11,color:"rgba(201,169,110,0.5)",marginBottom:6}}>※ ハイフンなしで入力</div>}
              <input type={f.t||"text"} placeholder={f.p} value={ciForm[f.k]} onChange={e=>setCiForm({...ciForm,[f.k]:e.target.value})}
                style={{width:"100%",padding:"11px 13px",borderRadius:10,fontSize:15,outline:"none",boxSizing:"border-box",color:"#f0e8d8",border:ciTouched&&!ciForm[f.k]?"1px solid rgba(224,112,112,0.6)":"1px solid rgba(201,169,110,0.25)",background:ciTouched&&!ciForm[f.k]?"rgba(224,112,112,0.05)":"rgba(255,255,255,0.05)"}}/>
              {ciTouched&&!ciForm[f.k]&&<div style={{fontSize:11,color:"#e07070",marginTop:4}}>{f.l}を入力してください</div>}
            </div>
          ))}
          <div style={{marginBottom:15}}>
            <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:5,letterSpacing:1.5}}>来店のきっかけ<span style={{background:"rgba(224,112,112,0.2)",color:"#e07070",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>必須</span></label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {VISIT_SOURCES.map(s=><button key={s} onClick={()=>setCiForm({...ciForm,source:s})} style={{padding:"7px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:"1px solid",borderColor:ciForm.source===s?"#c9a96e":"rgba(201,169,110,0.25)",background:ciForm.source===s?"rgba(201,169,110,0.2)":"transparent",color:ciForm.source===s?"#c9a96e":"rgba(240,232,216,0.5)"}}>{s}</button>)}
            </div>
            {ciTouched&&!ciForm.source&&<div style={{fontSize:11,color:"#e07070",marginTop:6}}>来店のきっかけを選択してください</div>}
          </div>
          <div style={{marginBottom:15}}>
            <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:8,letterSpacing:1.5}}>生年月日<span style={{background:"rgba(201,169,110,0.15)",color:"rgba(201,169,110,0.6)",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>任意</span></label>
            <BirthdaySelect year={ciForm.birthYear} month={ciForm.birthMonth} day={ciForm.birthDay} onChange={(f,v)=>bdonChange("ci",f,v)} dark={true}/>
          </div>
          {[{l:"メールアドレス",k:"email",t:"email",p:"example@email.com"},{l:"ご住所",k:"address",p:"群馬県〇〇市..."}].map(f=>(
            <div key={f.k} style={{marginBottom:15}}>
              <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:5,letterSpacing:1.5}}>{f.l}<span style={{background:"rgba(201,169,110,0.15)",color:"rgba(201,169,110,0.6)",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>任意</span></label>
              <input type={f.t||"text"} placeholder={f.p||""} value={ciForm[f.k]} onChange={e=>setCiForm({...ciForm,[f.k]:e.target.value})}
                style={{width:"100%",padding:"11px 13px",borderRadius:10,border:"1px solid rgba(201,169,110,0.25)",background:"rgba(255,255,255,0.05)",color:"#f0e8d8",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
          <div style={{marginBottom:15}}>
            <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:5,letterSpacing:1.5}}>アレルギー・特記事項<span style={{background:"rgba(201,169,110,0.15)",color:"rgba(201,169,110,0.6)",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>任意</span></label>
            <textarea value={ciForm.allergy} onChange={e=>setCiForm({...ciForm,allergy:e.target.value})} placeholder="アレルギーや頭皮のお悩みなど"
              style={{width:"100%",padding:"11px 13px",borderRadius:10,border:"1px solid rgba(201,169,110,0.25)",background:"rgba(255,255,255,0.05)",color:"#f0e8d8",fontSize:14,outline:"none",boxSizing:"border-box",minHeight:70,resize:"vertical"}}/>
          </div>
          <button onClick={submitCheckin} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#c9a96e,#a07840)",color:"#1a1512",fontSize:15,fontWeight:800,cursor:"pointer",letterSpacing:2}}>送信する</button>
        </div>
      </div>
    </div>
  );

  if(view==="checkinDone")return(
    <div style={{minHeight:"100vh",background:"#1a1512",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"Georgia,serif"}}>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(201,169,110,0.25)",borderRadius:22,padding:"48px 30px",textAlign:"center",width:"90%",maxWidth:400}}>
        <div style={{width:58,height:58,borderRadius:"50%",border:"1.5px solid #c9a96e",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24,color:"#c9a96e"}}>✓</div>
        <div style={{fontSize:17,fontWeight:700,color:"#f0e8d8",marginBottom:10,letterSpacing:1}}>ご登録ありがとうございます</div>
        <div style={{fontSize:13,color:"rgba(240,232,216,0.5)",lineHeight:2}}>スタッフが確認いたします。<br/>そのままお待ちください。</div>
        <div style={{marginTop:24,fontSize:11,color:"rgba(201,169,110,0.3)",letterSpacing:4}}>— MITONE —</div>
      </div>
      <button onClick={()=>setView("list")} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.25)",borderRadius:8,padding:"8px 16px",fontSize:11,cursor:"pointer"}}>スタッフ画面へ</button>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Hiragino Kaku Gothic ProN','Meiryo',sans-serif",color:PRIMARY}}>
      {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",color:"#fff",padding:"10px 24px",borderRadius:20,fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",background:toast.type==="error"?DANGER:PRIMARY}}>{toast.msg}</div>}
      <header style={{background:PRIMARY,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:640,margin:"0 auto",display:"flex",alignItems:"center",gap:8,height:52,padding:"0 14px"}}>
          <div style={{display:"flex",alignItems:"baseline"}}><span style={{fontSize:22,fontWeight:900,color:GOLD,letterSpacing:-1}}>M</span><span style={{fontSize:15,fontWeight:700,color:"#fff",letterSpacing:4}}>ITONE</span></div>
          <span style={{fontSize:11,color:"#888",letterSpacing:2}}>顧客カルテ</span>
          <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
            {pending.length>0&&<button onClick={()=>setView("pending")} style={{background:"#e05555",color:"#fff",border:"none",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>新規申請 {pending.length}件</button>}
            <button onClick={()=>{setCiForm(eCheckin);setCiTouched(false);setView("checkin");}} style={{background:GOLD,color:PRIMARY,border:"none",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>📋 お客様入力</button>
          </div>
        </div>
        <div style={{display:"flex",borderTop:"1px solid rgba(255,255,255,0.08)",maxWidth:640,margin:"0 auto"}}>
          {[["list","👥 顧客一覧"],["lost","🔔 失客アラート"],["trash","🗑️ ゴミ箱"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{flex:1,background:"none",border:"none",padding:"9px 4px",fontSize:12,cursor:"pointer",color:view===v?GOLD:"rgba(255,255,255,0.45)",borderBottom:view===v?`2px solid ${GOLD}`:"2px solid transparent"}}>
              {l}{v==="trash"&&trash.length>0?` (${trash.length})`:""}
            </button>
          ))}
        </div>
      </header>

      <main style={{maxWidth:640,margin:"0 auto",padding:"16px 14px 60px"}}>

        {view==="list"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 名前・ふりがな・携帯番号" style={{flex:1,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${BORDER}`,fontSize:14,background:"#fff",outline:"none"}}/>
              <button onClick={()=>{setCForm(eForm);setView("add");}} style={btnP}>＋ 新規</button>
            </div>
            {loading?<div style={{textAlign:"center",padding:"48px",color:SUB}}>⏳ 読み込み中...</div>:
              filtered.length===0?<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:40,marginBottom:8}}>✂️</div><p style={{color:SUB}}>まだ登録がありません</p></div>:
              filtered.map(c=>{const l=lastVisit(c);const d=l?daysSince(l):null;const isLost=d&&d>=alertDays;return(
                <div key={c.id} onClick={()=>{setSelId(c.id);setEditingCustomer(false);setView("detail");}} style={{background:"#fff",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:`1.5px solid ${isLost?"#f5c6a0":BORDER}`,marginBottom:8}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:isLost?ORANGE:GOLD,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,flexShrink:0}}>{c.name.charAt(0)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700}}>{c.name}{isLost&&<span style={{fontSize:10,background:"#fff0e6",color:ORANGE,borderRadius:10,padding:"1px 7px",marginLeft:6,fontWeight:600}}>失客注意</span>}</div>
                    <div style={{fontSize:12,color:SUB}}>{c.kana}</div>
                    <div style={{fontSize:12,color:SUB}}>{c.phone}</div>
                  </div>
                  <div style={{textAlign:"center"}}><span style={{display:"block",fontSize:19,fontWeight:800,color:GOLD}}>{(c.visits||[]).length}</span><span style={{fontSize:10,color:SUB}}>来店</span></div>
                </div>
              );})}
          </div>
        )}

        {view==="lost"&&(
          <div>
            <h2 style={{fontSize:17,fontWeight:800,margin:"0 0 16px"}}>🔔 失客アラート</h2>
            <div style={{...card,marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:600,marginBottom:12,textAlign:"center"}}>アラート期間：<strong style={{color:GOLD}}>{alertM}ヶ月</strong>以上来店なし</div>
              <input type="range" min={1} max={12} value={alertM} onChange={e=>setAlertM(Number(e.target.value))} style={{width:"100%",accentColor:GOLD}}/>
            </div>
            {lost.length===0?<div style={{textAlign:"center",padding:"32px",background:"#e8f5ee",borderRadius:12,border:`1.5px solid ${GREEN}`}}><div style={{fontSize:36}}>🎉</div><div style={{color:GREEN,fontWeight:700,marginTop:8}}>失客アラートなし！</div></div>:
              lost.sort((a,b)=>daysSince(lastVisit(b))-daysSince(lastVisit(a))).map(c=>{const d=daysSince(lastVisit(c));return(
                <div key={c.id} onClick={()=>{setSelId(c.id);setView("detail");}} style={{background:"#fff",borderRadius:11,padding:"12px 14px",border:"1.5px solid #f5c6a0",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:ORANGE,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,flexShrink:0}}>{c.name.charAt(0)}</div>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{c.name}</div><div style={{fontSize:11,color:SUB}}>{c.phone}</div><div style={{fontSize:12,color:ORANGE,fontWeight:600,marginTop:2}}>{d}日（約{Math.floor(d/30)}ヶ月）来店なし</div></div>
                </div>
              );})}
          </div>
        )}

        {view==="trash"&&(
          <div>
            <h2 style={{fontSize:17,fontWeight:800,margin:"0 0 16px"}}>🗑️ ゴミ箱 ({trash.length}件)</h2>
            {trash.length===0?<div style={{textAlign:"center",padding:"32px",color:SUB}}>ゴミ箱は空です</div>:
              trash.map(t=>(
                <div key={t.id} style={{...card,marginBottom:8}}>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{t.name} <span style={{fontSize:12,color:SUB,fontWeight:400}}>{t.kana}</span></div>
                  <div style={{fontSize:12,color:SUB,marginBottom:10}}>{t.phone}</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>restoreCustomer(t)} style={{...btnS,fontSize:12}}>↩️ 復元する</button>
                    <button onClick={()=>permDelete(t)} style={{...btnD,fontSize:12}}>完全に削除</button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {view==="pending"&&(
          <div style={fw}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><button onClick={()=>setView("list")} style={bk}>← 戻る</button><h2 style={{fontSize:17,fontWeight:800,margin:0}}>新規申請（{pending.length}件）</h2></div>
            {pending.length===0?<div style={{color:SUB,textAlign:"center",padding:"24px"}}>申請はありません</div>:
              pending.map((c,i)=>(
                <div key={i} style={{...card,border:`2px solid ${GOLD}`,marginBottom:12}}>
                  <div style={{fontSize:16,fontWeight:800,marginBottom:8}}>{c.name} <span style={{fontSize:12,color:SUB,fontWeight:400}}>{c.kana}</span></div>
                  {[{icon:"📱",v:c.phone},{icon:"📧",v:c.email},{icon:"🎂",v:formatBirthday(c.birthYear,c.birthMonth,c.birthDay)},{icon:"💡",v:c.source},{icon:"⚠️",v:c.allergy}].filter(x=>x.v).map(x=><div key={x.icon} style={{fontSize:13,marginBottom:3}}>{x.icon} {x.v}</div>)}
                  <div style={{display:"flex",gap:8,marginTop:12}}><button onClick={()=>approve(i)} style={btnP}>✓ カルテに登録</button><button onClick={()=>setPending(pending.filter((_,j)=>j!==i))} style={btnD}>✕ 削除</button></div>
                </div>
              ))}
          </div>
        )}

        {view==="add"&&(
          <div style={fw}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><button onClick={()=>setView("list")} style={bk}>← 戻る</button><h2 style={{fontSize:17,fontWeight:800,margin:0}}>新規顧客登録</h2></div>
            <div style={card}>
              {[{l:"お名前",k:"name",p:"山田 花子"},{l:"ふりがな",k:"kana",p:"やまだ はなこ"},{l:"携帯番号（ハイフンなし）",k:"phone",t:"tel",p:"09012345678"}].map(f=>(
                <div key={f.k} style={{marginBottom:13}}><label style={lbl}>{f.l}{req}</label><input type={f.t||"text"} placeholder={f.p||""} value={cForm[f.k]} onChange={e=>setCForm({...cForm,[f.k]:e.target.value})} style={inp}/></div>
              ))}
              <div style={{marginBottom:13}}>
                <label style={lbl}>来店のきっかけ{req}</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {VISIT_SOURCES.map(s=><button key={s} onClick={()=>setCForm({...cForm,source:s})} style={{padding:"6px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:`1px solid ${cForm.source===s?GOLD:BORDER}`,background:cForm.source===s?GOLD_LIGHT:"#fff",color:cForm.source===s?GOLD_DARK:SUB}}>{s}</button>)}
                </div>
              </div>
              <div style={{marginBottom:13}}>
                <label style={lbl}>生年月日{opt}</label>
                <BirthdaySelect year={cForm.birthYear} month={cForm.birthMonth} day={cForm.birthDay} onChange={(f,v)=>bdonChange("cf",f,v)}/>
              </div>
              {[{l:"メールアドレス",k:"email",t:"email"},{l:"住所",k:"address",p:"群馬県〇〇市..."}].map(f=>(
                <div key={f.k} style={{marginBottom:13}}><label style={lbl}>{f.l}{opt}</label><input type={f.t||"text"} placeholder={f.p||""} value={cForm[f.k]} onChange={e=>setCForm({...cForm,[f.k]:e.target.value})} style={inp}/></div>
              ))}
              <div style={{marginBottom:13}}><label style={lbl}>メモ・特記事項{opt}</label><textarea value={cForm.memo} onChange={e=>setCForm({...cForm,memo:e.target.value})} placeholder="アレルギー・特記事項など" style={ta}/></div>
              <button onClick={addCustomer} style={btnP}>登録する</button>
            </div>
          </div>
        )}

        {view==="detail"&&sel&&(
          <div style={fw}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><button onClick={()=>setView("list")} style={bk}>← 一覧</button><h2 style={{fontSize:17,fontWeight:800,margin:0}}>カルテ詳細</h2></div>
            <div style={{...card,marginBottom:16}}>
              {editingCustomer?(
                <div>
                  <h3 style={{fontSize:14,fontWeight:800,margin:"0 0 14px"}}>✏️ お客様情報を編集</h3>
                  {[{l:"お名前",k:"name"},{l:"ふりがな",k:"kana"},{l:"携帯番号",k:"phone",t:"tel"},{l:"メールアドレス",k:"email",t:"email"},{l:"住所",k:"address"}].map(f=>(
                    <div key={f.k} style={{marginBottom:11}}><label style={lbl}>{f.l}</label><input type={f.t||"text"} value={cForm[f.k]||""} onChange={e=>setCForm({...cForm,[f.k]:e.target.value})} style={inp}/></div>
                  ))}
                  <div style={{marginBottom:11}}>
                    <label style={lbl}>生年月日</label>
                    <BirthdaySelect year={cForm.birthYear||""} month={cForm.birthMonth||""} day={cForm.birthDay||""} onChange={(f,v)=>bdonChange("cf",f,v)}/>
                  </div>
                  <div style={{marginBottom:11}}>
                    <label style={lbl}>来店のきっかけ</label>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {VISIT_SOURCES.map(s=><button key={s} onClick={()=>setCForm({...cForm,source:s})} style={{padding:"6px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:`1px solid ${cForm.source===s?GOLD:BORDER}`,background:cForm.source===s?GOLD_LIGHT:"#fff",color:cForm.source===s?GOLD_DARK:SUB}}>{s}</button>)}
                    </div>
                  </div>
                  <div style={{marginBottom:11}}><label style={lbl}>メモ</label><textarea value={cForm.memo||""} onChange={e=>setCForm({...cForm,memo:e.target.value})} style={ta}/></div>
                  <div style={{display:"flex",gap:8}}><button onClick={updateCustomer} style={btnP}>保存する</button><button onClick={()=>setEditingCustomer(false)} style={btnS}>キャンセル</button></div>
                </div>
              ):(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                    <div style={{width:54,height:54,borderRadius:"50%",background:GOLD,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700}}>{sel.name.charAt(0)}</div>
                    <div style={{flex:1}}><div style={{fontSize:21,fontWeight:800}}>{sel.name}</div><div style={{fontSize:12,color:SUB}}>{sel.kana}</div></div>
                    <button onClick={()=>{setCForm({name:sel.name,kana:sel.kana,phone:sel.phone,email:sel.email||"",birthYear:sel.birthYear||"",birthMonth:sel.birthMonth||"",birthDay:sel.birthDay||"",address:sel.address||"",memo:sel.memo||"",source:sel.source||""});setEditingCustomer(true);}} style={btnS}>✏️ 編集</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {[{icon:"📱",v:sel.phone},{icon:"📧",v:sel.email},{icon:"🎂",v:formatBirthday(sel.birthYear,sel.birthMonth,sel.birthDay)},{icon:"💡",v:sel.source},{icon:"🏠",v:sel.address},{icon:"📝",v:sel.memo}].filter(x=>x.v).map(x=>(
                      <div key={x.icon} style={{display:"flex",gap:10,fontSize:13}}><span style={{color:SUB,minWidth:22}}>{x.icon}</span><span>{x.v}</span></div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:14}}>
                    {[{l:"来店回数",v:`${(sel.visits||[]).length}回`},{l:"最終来店",v:lastVisit(sel)?`${daysSince(lastVisit(sel))}日前`:"—"}].map(x=>(
                      <div key={x.l} style={{background:GOLD_LIGHT,borderRadius:10,padding:"8px 12px",flex:1,textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:GOLD_DARK}}>{x.v}</div><div style={{fontSize:10,color:SUB,marginTop:2}}>{x.l}</div></div>
                    ))}
                  </div>
                  <button onClick={()=>delCustomer(sel.id)} style={{...btnD,marginTop:14,fontSize:12}}>🗑️ ゴミ箱に移す</button>
                </div>
              )}
            </div>

            {/* 来店履歴 */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"18px 0 8px"}}>
              <h3 style={{fontSize:14,fontWeight:800,margin:0}}>✂️ 来店履歴</h3>
              <button onClick={()=>{setVForm(eVisit);setEditVid(null);setVTouched(false);setView("addVisit");}} style={btnS}>＋ 追加</button>
            </div>
            {!(sel.visits&&sel.visits.length)?<div style={{color:SUB,fontSize:13,padding:"12px 0",textAlign:"center"}}>来店記録がありません</div>:
              (sel.visits||[]).map(v=>(
                <div key={v.id} style={{...card,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:GOLD}}>📅 {v.date?.replace("T"," ")}</span>
                    <div>
                      <button onClick={()=>{setVForm({...v,purchases:v.purchases||[]});setEditVid(v.id);setVTouched(false);setView("addVisit");}} style={{background:GOLD_LIGHT,border:"none",color:PRIMARY,borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",marginLeft:5}}>編集</button>
                      <button onClick={()=>delVisit(v.id)} style={{background:"#fdecea",border:"none",color:DANGER,borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",marginLeft:5}}>削除</button>
                    </div>
                  </div>
                  {v.tags&&v.tags.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{v.tags.map(t=><span key={t} style={{background:GOLD_LIGHT,color:GOLD_DARK,border:`1px solid ${GOLD}`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{t}</span>)}</div>}
                  {v.staff&&<div style={{fontSize:12,marginBottom:3,display:"flex",gap:7}}><span style={{color:SUB,minWidth:44,fontSize:11}}>担当</span>{v.staff}</div>}
                  {v.memo&&<div style={{fontSize:12,marginBottom:3,display:"flex",gap:7}}><span style={{color:SUB,minWidth:44,fontSize:11}}>メモ</span>{v.memo}</div>}
                  {v.purchases&&v.purchases.length>0&&(
                    <div style={{marginTop:8,background:GOLD_LIGHT,borderRadius:8,padding:"8px 10px"}}>
                      <div style={{fontSize:11,color:GOLD_DARK,fontWeight:700,marginBottom:4}}>🛍️ 購入記録</div>
                      {v.purchases.map(p=><div key={p.id} style={{fontSize:12,marginBottom:2}}>{p.item}{p.price?` ¥${p.price}`:""}{p.memo?` (${p.memo})`:""}</div>)}
                    </div>
                  )}
                  {v.drawing&&<div style={{marginTop:8}}><HeadCanvas savedData={v.drawing} readOnly={true}/></div>}
                  {v.photo&&<img src={v.photo} alt="施術写真" style={{width:"100%",borderRadius:8,marginTop:6,maxHeight:200,objectFit:"cover"}}/>}
                </div>
              ))
            }

            {/* 商品購入履歴（一番下） */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"18px 0 8px"}}>
              <h3 style={{fontSize:14,fontWeight:800,margin:0}}>🛍️ 商品購入履歴</h3>
            </div>
            {!(sel.purchases&&sel.purchases.length)?
              <div style={{color:SUB,fontSize:13,padding:"12px 0",textAlign:"center"}}>商品購入履歴がありません</div>:
              (sel.purchases||[]).map(p=>(
                <div key={p.id} style={{...card,padding:"10px 14px",marginBottom:7}}>
                  <div style={{fontSize:12,color:GOLD,fontWeight:700,marginBottom:4}}>📅 {p.date}</div>
                  <div style={{fontSize:14}}>{p.memo||p.item}</div>
                  {p.price&&<div style={{fontSize:12,color:SUB,marginTop:2}}>¥{p.price}</div>}
                </div>
              ))
            }
          </div>
        )}

        {view==="addVisit"&&sel&&(
          <div style={fw}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><button onClick={()=>{setVForm(eVisit);setEditVid(null);setVTouched(false);setView("detail");}} style={bk}>← 戻る</button><h2 style={{fontSize:17,fontWeight:800,margin:0}}>{editVid?"来店記録を編集":"来店記録を追加"}</h2></div>
            <div style={card}>
              <div style={{marginBottom:13}}>
                <label style={lbl}>来店日時{req}</label>
                <input type="datetime-local" value={vForm.date} onChange={e=>setVForm({...vForm,date:e.target.value})} style={{...inp,borderColor:vTouched&&!vForm.date?DANGER:BORDER}}/>
                {vTouched&&!vForm.date&&<div style={{fontSize:11,color:DANGER,marginTop:4}}>来店日時を入力してください</div>}
              </div>
              <div style={{marginBottom:13}}>
                <label style={lbl}>施術タグ</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
                  {TAGS.map(t=><button key={t} onClick={()=>toggleTag(t)} style={{background:(vForm.tags||[]).includes(t)?GOLD:"#f0ece6",color:(vForm.tags||[]).includes(t)?"#fff":SUB,border:`1px solid ${(vForm.tags||[]).includes(t)?GOLD_DARK:BORDER}`,borderRadius:20,padding:"5px 10px",fontSize:11,cursor:"pointer"}}>{t}</button>)}
                </div>
              </div>
              <div style={{marginBottom:13}}><label style={lbl}>担当スタッフ</label><input value={vForm.staff||""} onChange={e=>setVForm({...vForm,staff:e.target.value})} placeholder="例）七海" style={inp}/></div>
              <div style={{marginBottom:13}}><label style={lbl}>メモ・施術詳細</label><textarea value={vForm.memo||""} onChange={e=>setVForm({...vForm,memo:e.target.value})} placeholder="カラー詳細・お客様の要望など" style={ta}/></div>
              <div style={{marginBottom:13}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <label style={{...lbl,marginBottom:0}}>🛍️ 購入記録</label>
                  <button onClick={addPurchaseToVisit} style={btnS}>＋ 追加</button>
                </div>
                {(vForm.purchases||[]).map(p=>(
                  <div key={p.id} style={{background:GOLD_LIGHT,borderRadius:8,padding:"10px",marginBottom:8}}>
                    <div style={{display:"flex",gap:6,marginBottom:6}}>
                      <input placeholder="商品名" value={p.item} onChange={e=>updatePurchase(p.id,"item",e.target.value)} style={{...inp,flex:2,padding:"7px 9px",fontSize:13}}/>
                      <input placeholder="金額" type="number" value={p.price} onChange={e=>updatePurchase(p.id,"price",e.target.value)} style={{...inp,flex:1,padding:"7px 9px",fontSize:13}}/>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <input placeholder="メモ" value={p.memo} onChange={e=>updatePurchase(p.id,"memo",e.target.value)} style={{...inp,flex:1,padding:"7px 9px",fontSize:13}}/>
                      <button onClick={()=>removePurchase(p.id)} style={{background:"none",border:"none",color:DANGER,fontSize:18,cursor:"pointer",padding:"0 4px"}}>×</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:13}}>
                <label style={{...lbl,marginBottom:8}}>🖊️ 頭部展開図</label>
                <HeadCanvas savedData={vForm.drawing} onSave={drawing=>setVForm(f=>({...f,drawing}))} readOnly={false}/>
              </div>
              <div style={{marginBottom:13}}>
                <label style={lbl}>施術写真</label>
                <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
                <button onClick={()=>photoRef.current.click()} style={btnS}>📷 写真を選択</button>
                {vForm.photo&&<img src={vForm.photo} alt="プレビュー" style={{width:"100%",borderRadius:8,marginTop:8,maxHeight:200,objectFit:"cover"}}/>}
              </div>
              <button onClick={saveVisit} style={btnP}>{editVid?"更新する":"記録する"}</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
