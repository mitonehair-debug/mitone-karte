import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const VISIT_SOURCES = ["紹介","Instagram","ホットペッパー","Google","チラシ","通りがかり","その他"];
const YEARS = Array.from({length:100},(_,i)=>String(new Date().getFullYear()-i));
const MONTHS = Array.from({length:12},(_,i)=>String(i+1));
const DAYS = Array.from({length:31},(_,i)=>String(i+1));

const eForm = {name:"",kana:"",phone:"",email:"",birthYear:"",birthMonth:"",birthDay:"",address:"",allergy:"",source:""};

export default function Checkin() {
  const [form, setForm] = useState(eForm);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  function isValid() {
    return form.name.trim() && form.kana.trim() && form.phone.trim() && form.source;
  }

  async function handleSubmit() {
    setTouched(true);
    if (!isValid()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "pending"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch(e) {
      alert("送信に失敗しました。もう一度お試しください。");
    }
    setSaving(false);
  }

  const sel = {
    padding:"10px 6px", borderRadius:8, fontSize:14, outline:"none",
    boxSizing:"border-box", border:"1px solid rgba(201,169,110,0.25)",
    background:"rgba(255,255,255,0.08)", color:"#f0e8d8", cursor:"pointer"
  };

  if (done) return (
    <div style={{minHeight:"100vh",background:"#1a1512",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(201,169,110,0.25)",borderRadius:22,padding:"48px 30px",textAlign:"center",width:"90%",maxWidth:400}}>
        <div style={{width:58,height:58,borderRadius:"50%",border:"1.5px solid #c9a96e",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24,color:"#c9a96e"}}>✓</div>
        <div style={{fontSize:17,fontWeight:700,color:"#f0e8d8",marginBottom:10,letterSpacing:1}}>ご登録ありがとうございます</div>
        <div style={{fontSize:13,color:"rgba(240,232,216,0.5)",lineHeight:2}}>スタッフが確認いたします。<br/>そのままお待ちください。</div>
        <div style={{marginTop:24,fontSize:11,color:"rgba(201,169,110,0.3)",letterSpacing:4}}>— MITONE —</div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#1a1512",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",fontFamily:"Georgia,serif"}}>
      <div style={{position:"absolute",top:-150,right:-150,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,169,110,0.12) 0%,transparent 70%)"}}/>
      <div style={{position:"absolute",bottom:-150,left:-150,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,169,110,0.08) 0%,transparent 70%)"}}/>
      <div style={{width:"100%",maxWidth:480,padding:"40px 20px 60px",display:"flex",flexDirection:"column",alignItems:"center",gap:22,position:"relative",zIndex:1}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:66,height:66,borderRadius:"50%",border:"1.5px solid rgba(201,169,110,0.5)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",background:"rgba(201,169,110,0.06)"}}><span style={{fontSize:28,fontWeight:900,color:"#c9a96e"}}>M</span></div>
          <div style={{fontSize:20,fontWeight:700,color:"#f0e8d8",letterSpacing:8}}>MITONE</div>
          <div style={{fontSize:11,color:"rgba(201,169,110,0.6)",letterSpacing:4,marginTop:4}}>Hair &amp; Beauty</div>
        </div>

        <div style={{width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(201,169,110,0.2)",borderRadius:20,padding:"24px 20px"}}>
          <div style={{fontSize:15,fontWeight:600,color:"#f0e8d8",textAlign:"center",marginBottom:4,letterSpacing:1}}>ご来店ありがとうございます</div>
          <div style={{fontSize:12,color:"rgba(240,232,216,0.4)",textAlign:"center",marginBottom:20,lineHeight:1.8}}>はじめてのお客様は以下をご記入ください</div>

          {/* 必須項目 */}
          {[{l:"お名前",k:"name",p:"山田 花子"},{l:"ふりがな",k:"kana",p:"やまだ はなこ"},{l:"携帯番号",k:"phone",t:"tel",p:"09012345678"}].map(f=>(
            <div key={f.k} style={{marginBottom:15}}>
              <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:5,letterSpacing:1.5}}>
                {f.l}<span style={{background:"rgba(224,112,112,0.2)",color:"#e07070",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>必須</span>
              </label>
              {f.k==="phone"&&<div style={{fontSize:11,color:"rgba(201,169,110,0.5)",marginBottom:6}}>※ ハイフンなしで入力（例：09012345678）</div>}
              <input type={f.t||"text"} placeholder={f.p} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})}
                style={{width:"100%",padding:"11px 13px",borderRadius:10,fontSize:15,outline:"none",boxSizing:"border-box",color:"#f0e8d8",
                  border:touched&&!form[f.k]?"1px solid rgba(224,112,112,0.6)":"1px solid rgba(201,169,110,0.25)",
                  background:touched&&!form[f.k]?"rgba(224,112,112,0.05)":"rgba(255,255,255,0.05)"}}/>
              {touched&&!form[f.k]&&<div style={{fontSize:11,color:"#e07070",marginTop:4}}>{f.l}を入力してください</div>}
            </div>
          ))}

          {/* 来店のきっかけ（必須） */}
          <div style={{marginBottom:15}}>
            <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:5,letterSpacing:1.5}}>
              来店のきっかけ<span style={{background:"rgba(224,112,112,0.2)",color:"#e07070",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>必須</span>
            </label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {VISIT_SOURCES.map(s=>(
                <button key={s} onClick={()=>setForm({...form,source:s})}
                  style={{padding:"7px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:"1px solid",
                    borderColor:form.source===s?"#c9a96e":"rgba(201,169,110,0.25)",
                    background:form.source===s?"rgba(201,169,110,0.2)":"transparent",
                    color:form.source===s?"#c9a96e":"rgba(240,232,216,0.5)"}}>
                  {s}
                </button>
              ))}
            </div>
            {touched&&!form.source&&<div style={{fontSize:11,color:"#e07070",marginTop:6}}>来店のきっかけを選択してください</div>}
          </div>

          {/* 生年月日（任意・プルダウン） */}
          <div style={{marginBottom:15}}>
            <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:8,letterSpacing:1.5}}>
              生年月日<span style={{background:"rgba(201,169,110,0.15)",color:"rgba(201,169,110,0.6)",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>任意</span>
            </label>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <select value={form.birthYear} onChange={e=>setForm({...form,birthYear:e.target.value})} style={{...sel,width:90}}>
                <option value="">年</option>
                {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
              <span style={{color:"rgba(201,169,110,0.6)",fontSize:13}}>年</span>
              <select value={form.birthMonth} onChange={e=>setForm({...form,birthMonth:e.target.value})} style={{...sel,width:66}}>
                <option value="">月</option>
                {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
              <span style={{color:"rgba(201,169,110,0.6)",fontSize:13}}>月</span>
              <select value={form.birthDay} onChange={e=>setForm({...form,birthDay:e.target.value})} style={{...sel,width:66}}>
                <option value="">日</option>
                {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              <span style={{color:"rgba(201,169,110,0.6)",fontSize:13}}>日</span>
            </div>
          </div>

          {/* 任意項目 */}
          {[{l:"メールアドレス",k:"email",t:"email",p:"example@email.com"},{l:"ご住所",k:"address",p:"群馬県〇〇市..."}].map(f=>(
            <div key={f.k} style={{marginBottom:15}}>
              <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:5,letterSpacing:1.5}}>
                {f.l}<span style={{background:"rgba(201,169,110,0.15)",color:"rgba(201,169,110,0.6)",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>任意</span>
              </label>
              <input type={f.t||"text"} placeholder={f.p||""} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})}
                style={{width:"100%",padding:"11px 13px",borderRadius:10,border:"1px solid rgba(201,169,110,0.25)",background:"rgba(255,255,255,0.05)",color:"#f0e8d8",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}

          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:11,color:"rgba(201,169,110,0.75)",marginBottom:5,letterSpacing:1.5}}>
              アレルギー・特記事項<span style={{background:"rgba(201,169,110,0.15)",color:"rgba(201,169,110,0.6)",fontSize:10,borderRadius:4,padding:"1px 6px",marginLeft:4}}>任意</span>
            </label>
            <textarea value={form.allergy} onChange={e=>setForm({...form,allergy:e.target.value})} placeholder="アレルギーや頭皮のお悩みなど"
              style={{width:"100%",padding:"11px 13px",borderRadius:10,border:"1px solid rgba(201,169,110,0.25)",background:"rgba(255,255,255,0.05)",color:"#f0e8d8",fontSize:14,outline:"none",boxSizing:"border-box",minHeight:70,resize:"vertical"}}/>
          </div>

          <button onClick={handleSubmit} disabled={saving}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#c9a96e,#a07840)",color:"#1a1512",fontSize:15,fontWeight:800,cursor:"pointer",letterSpacing:2,opacity:saving?0.7:1}}>
            {saving?"送信中...":"送信する"}
          </button>
        </div>
        <p style={{fontSize:10,color:"rgba(240,232,216,0.2)",textAlign:"center"}}>ご入力いただいた情報はMITONEが適切に管理いたします</p>
      </div>
    </div>
  );
}
