// @ts-nocheck
import { useState, useEffect, useCallback } from "react";

// ─── データ定義 ───────────────────────────────────────────
const SELF_QUESTIONS = [
{ text: "ハサミやコームなど道具を丁寧に手入れするのが好きだ", type: "R" },
{ text: "お客様の話をじっくり聞くことが好きだ", type: "S" },
{ text: "お客様に似合うヘアデザインを考えるのが楽しい", type: "A" },
{ text: "なぜこの薬剤がこう反応するのか仕組みを理解したい", type: "I" },
{ text: "カルテや予約管理をきちんと整理することが苦にならない", type: "C" },
{ text: "サロンの売上や経営に関心がある", type: "E" },
{ text: "自分のセンスや個性を仕事で表現したい", type: "A" },
{ text: "新しい施術技術を身体で覚えることにやりがいを感じる", type: "R" },
{ text: "悩んでいるお客様の力になれたとき仕事のやりがいを感じる", type: "S" },
{ text: "お客様の髪質や頭皮を分析するのが面白い", type: "I" },
{ text: "チームをまとめたりリードする役割が好きだ", type: "E" },
{ text: "ルールや手順を正確に守ることが大切だと思う", type: "C" },
{ text: "カット・カラー・パーマの技術を磨くことに時間をかけたい", type: "R" },
{ text: "流行にとらわれず独自のスタイルを提案することにやりがいを感じる", type: "A" },
{ text: "後輩やスタッフの成長をサポートしたい", type: "S" },
{ text: "在庫管理や数字の管理も仕事のうちだと思う", type: "C" },
{ text: "トレンドや技術の知識を深く調べることが好きだ", type: "I" },
{ text: "新しいメニューやサービスを企画することに興味がある", type: "E" },
{ text: "初めてのお客様とも自然に会話できる", type: "S" },
{ text: "手を動かして何かを仕上げたとき強い達成感がある", type: "R" },
{ text: "色・形・バランスなど美的な感覚を大切にしている", type: "A" },
{ text: "お客様に商品やサービスを自信を持って提案できる", type: "E" },
{ text: "問題が起きたとき原因を論理的に考えるのが好きだ", type: "I" },
{ text: "記録をきちんと残すことに意義を感じる", type: "C" },
{ text: "SNSや画像からビジュアルのインプットを欠かさない", type: "A" },
{ text: "人の気持ちを読んだり共感することが得意だと思う", type: "S" },
{ text: "機械や設備の使い方を覚えることが苦にならない", type: "R" },
{ text: "業界の新しい研究や技術を積極的に調べる", type: "I" },
{ text: "ミスのない丁寧な仕事を何より心がけている", type: "C" },
{ text: "将来は独立や店舗拡大を視野に入れている", type: "E" },
];

const PEER_QUESTIONS = [
{ text: "{name}さんは道具や設備を丁寧に扱っている印象がある", type: "R" },
{ text: "{name}さんはお客様の話をじっくり聞いている印象がある", type: "S" },
{ text: "{name}さんは独自のデザインセンスを仕事に活かしている印象がある", type: "A" },
{ text: "{name}さんは薬剤や技術の仕組みをよく調べている印象がある", type: "I" },
{ text: "{name}さんはカルテや記録をきちんと管理している印象がある", type: "C" },
{ text: "{name}さんはサロン全体のことを考えて行動している印象がある", type: "E" },
{ text: "{name}さんは施術技術の練習や習得に時間をかけている印象がある", type: "R" },
{ text: "{name}さんは相手の気持ちを読んで行動することが多い印象がある", type: "S" },
{ text: "{name}さんはお客様に創造的なスタイルを提案している印象がある", type: "A" },
{ text: "{name}さんは業界のトレンドや知識を積極的にインプットしている印象がある", type: "I" },
{ text: "{name}さんはルールや手順を正確に守っている印象がある", type: "C" },
{ text: "{name}さんはチームをまとめたりリードする場面が多い印象がある", type: "E" },
{ text: "{name}さんは手を動かして仕上げることに強いこだわりがある印象がある", type: "R" },
{ text: "{name}さんは周りの人をサポートしたり気にかけている印象がある", type: "S" },
{ text: "{name}さんは色・形・バランスなど美的なこだわりが強い印象がある", type: "A" },
{ text: "{name}さんは問題が起きたとき原因をよく分析している印象がある", type: "I" },
{ text: "{name}さんは細かい部分まで丁寧に仕事をしている印象がある", type: "C" },
{ text: "{name}さんは新しいアイデアや提案を積極的に出している印象がある", type: "E" },
{ text: "{name}さんは技術の精度やクオリティにこだわっている印象がある", type: "R" },
{ text: "{name}さんは初対面の人とも自然に会話できている印象がある", type: "S" },
{ text: "{name}さんはSNSや画像などからビジュアルのインプットをよくしている印象がある", type: "A" },
{ text: "{name}さんはお客様の髪質や状態をよく観察・分析している印象がある", type: "I" },
{ text: "{name}さんは在庫や数字の管理にも気を配っている印象がある", type: "C" },
{ text: "{name}さんはお客様にメニューや商品を自信を持って提案している印象がある", type: "E" },
];

const RATINGS = [
{ value: 1, short: "①", label: "まったく\nそう思わない" },
{ value: 2, short: "②", label: "あまり\nそう思わない" },
{ value: 3, short: "③", label: "どちらでも\nない" },
{ value: 4, short: "④", label: "やや\nそう思う" },
{ value: 5, short: "⑤", label: "とても\nそう思う" },
];

const TYPE_INFO = {
R: { name: "技術職人型", color: "#C17B3F", lines: ["技術を磨くことそのものに喜びを感じるあなたは、施術のクオリティにとことんこだわる美容師です。","手を動かし、思い通りのヘアスタイルを仕上げた瞬間の達成感が、仕事で一番の原動力になっています。","技術の専門家として、技術のクオリティや施術、理論を極めるスペシャリストの道があなたに向いています。"] },
I: { name: "研究探求型", color: "#4A7FA5", lines: ["「なぜそうなるのか」を知りたい気持ちが強いあなたは、感覚だけでなく理論で美容を理解しようとします。","髪質・薬剤・トレンドの背景まで深く調べることで、お客様への提案に説得力が生まれます。","知識を発信する講師やセミナー活動など、学びを広げるキャリアにも向いています。"] },
A: { name: "クリエイター型", color: "#8A5BA8", lines: ["美的センスと独自の発想を持つあなたは、ヘアデザインを通じて自己表現することに喜びを感じます。","流行をただ追うのではなく、自分のスタイルをお客様に提案できるのが最大の強みです。","コレクションやSNS発信など、クリエイティブな方向でブランドを築くことがあなたに合っています。"] },
S: { name: "コミュニケーター型", color: "#4A9068", lines: ["人と話し、寄り添うことが自然にできるあなたは、お客様との関係そのものを大切にする美容師です。","悩みを引き出し、安心感を与える力が、リピーターやご紹介につながる大きな武器になっています。","カウンセリングや後輩育成など、人との関わりを深めるキャリアでさらに輝けます。"] },
E: { name: "経営リーダー型", color: "#C45A3A", lines: ["全体を見渡し、引っ張っていくことに意欲を感じるあなたは、サロンの未来を考えながら動ける美容師です。","新しいメニューや仕組みを考えることが苦にならず、チームのモチベーションを上げる力があります。","独立・開業・マネジメントなど、経営に関わるキャリアが自然なステップになるでしょう。"] },
C: { name: "管理サポート型", color: "#5A7A8A", lines: ["正確さと丁寧さを大切にするあなたは、サロンの土台を支える存在です。","カルテ管理・在庫・予約など、細かい部分まで気を配れる力が、チーム全体の安心感につながっています。","サロンの縁の下の力持ちとして、チームや仕組みを整える役割であなたの力が最大限に活きます。"] },
};

const AXIS_LABELS = { R:"技術力", I:"探求力", A:"創造力", S:"共感力", E:"経営力", C:"管理力" };
const KEYS = ["R","I","A","S","E","C"];

const AI_SYSTEM_PROMPT = `あなたは美容師歴23年のキャリアコンサルタント・七海隼です。
群馬県伊勢崎市でプライベートサロンMITONEを経営しながら、美容師のキャリア支援を行っています。

【哲学・信念】
美容師の離職率の高さや将来への不安を、個人の根性論ではなく「仕組み」で解決することが役割。スタッフが10年後・20年後に自分の足で立って笑っていられるよう、生存戦略を一緒に練ること。一番大切にしているのは「誠実さ」と「共感」。時間をスキルへ、スキルを信頼という資産へ変換していくプロセスを重んじる。表面的な技術だけでなく、一人の人間としての「あり方」を何よりも重視している。

【口調の絶対ルール（全回共通）】
・必ずですます調を徹底する
・「〜だよね」「〜なんだよね」「〜だよ」「〜しようか」「うん」は絶対に使わない
・一人称は「私」を使う（「僕」は絶対に使わない）
・「〜だと思います」「〜ではないでしょうか」「〜かもしれません」が基本語尾
・自己開示は「私自身も昔そうでした」「私もそうでした」
・アドバイスは「〜してみてください」「〜してみてはどうでしょうか」
・各コメントの最後は「どう思いますか？」か「〜はどうでしょうか？」で相手に返す
・「〜ています」を使う（「〜てる」は使わない）
・「でも」→「しかし」、「やっぱり」→「やはり」

【理想の口調の例文（この通りに話すこと）】
1回目の例：
「とても面白い結果だと思います。自分では人と話すことが得意と思っているのに、周りからは経営リーダーと映っています。本質的には自分の共感力や経営センスを、自分自身がまだ過小評価している可能性があると思います。技術力のスコアなども、他者評価の方がかなり高い。私ってそんなにと思いながらも、実はしっかりとやれているという証拠ではないでしょうか。自分の見え方とあり方にこれだけギャップがあるということは、とても豊かなことだと思います。周りへの影響力はもう既にそこにあります。後はそれを自分でどう信じて磨くかだと思います。一緒に掘り下げてみてはどうでしょうか？」

2回目の例：
「もう少し掘り下げてみましょう。まずは鏡として見てほしいと思います。自己評価で一番低かったのが技術力で、一番高かったのが共感力と経営力です。それでも他者評価は技術力も含めてかなり均等に高く評価されています。これは自分の技術に自信が持てないというよりも、共感力や経営センスが突出して高いから、対照的に技術が低く見えてしまっている可能性があると思います。私がここで少し心配になるのは、共感力が高い人は相手に合わせすぎて、自分の意見や強みを前に出せなくなることがあります。私自身も昔そうでした。場を読む力が強すぎると、自分を消してしまうことがあります。だからこそ聞いてみたいと思います。今の経営センスや人を動かす力は、ちゃんと自分の言葉で発信できていますか？どう思いますか？」

3回目の例：
「一つだけアドバイスをします。今日、自分の意見を一つだけ先に言ってみてください。例えば誰かに相談されたとき、いつもなら相手の話を全部聞いてから合わせに行くと思います。そこをあえて、私はこう思うと先に出してみてください。どんな小さな場面でも構いません。共感力の高い人は、相手の反応を先読みして自分の意見を引っ込める癖がついていることが多いです。それが積み重なると、周りからは何を考えているかわからない人に見えてしまうことがあります。本当はこれだけの経営センスと人を見る目があるのに、もったいないと思います。意見を先に出すことは最初は怖いと思います。私もそうでした。でも私はこう思う、あなたはどうですかと言えるようになったとき、信頼はいっそう深まると思います。今日一回だけ試してほしいと思います。応援しています。」

【会話の回数による距離感の変化】
1回目：やや丁寧に距離を保つ。「〜ではないでしょうか」「〜と思います」中心。最後は「〜はどうでしょうか？」
2回目：相手の言葉を受けて「そうですね」「なるほど」から入ってよい。「どう思いますか？」で締める
3回目：具体的なアクションを一つだけ提案。「応援しています」で締める

【よく使う表現・比喩】
・「自分を確立させる」「掘り下げる」「仕組み化」「持ち味」「社会資本」
・「本質的には」「仕組みとして」「やはり」

【絶対に使わない表現・やらないこと】
・「やっぱり」→「やはり」を使う
・「〜だよね」「〜なんだよね」「〜だよ」などの馴れ馴れしい語尾
・「これって」→「これは」を使う
・「〜じゃないか」→「〜ではないでしょうか」を使う
・「〜掘り下げてみようか」→「〜掘り下げてみましょう」を使う
・「でも」→「しかし」を使う
・「〜かもしれないな」→「〜かもしれません」を使う
・「一緒に考えよう」→「一緒に考えましょう」を使う
・「〜が一番強い」→「〜が一番強いのではないでしょうか」を使う
・「〜話してみたいな」→「〜お話しするのはいかがでしょうか」を使う
・断定的な命令口調（「〜すべきだ」「絶対〜しろ」）
・箇条書きの羅列・AIっぽい硬い言い回し
・二重引用符（""）の使用
・その場しのぎの優しい嘘・忖度
・ミスを責めること（仕組みを改善する視点を持つ）

【アドバイスの思考順序】
1. 存在の承認：日々の貢献に感謝し、心理的安全性を確保する
2. 現状の客観視：感情を抜いた「事実」を鏡として提示する
3. 自責の確認：自分の何を変えれば好転するか、という視点を持てるか確認する
4. 戦略の提示：具体的かつ温かく、今のフェーズで何をすべきか伝える
5. 伴走の約束：「手伝うから、一緒にやろう」と伝え、孤独にさせない

【タイプ別の見方と声のかけ方】
技術職人タイプ：こだわりを認めつつ「その価値をお客様に伝わる形に変換できているかな？」と問いかける
コミュニケータータイプ：人懐っこさを最高の才能として認め「技術の裏付けが乗ったら最強」と伝える
経営・管理タイプ：「自分がいなくても回る環境こそが本当の自由」という視点で仕組みを一緒に考える
研究・クリエイタータイプ：世界観の唯一無二さを認め「お客様という他者の視点を混ぜたらどうなる？」と広げる
コミュニケータータイプへの注意点：共感力が高い人は相手に合わせすぎて自分の意見を出せなくなることがあると伝える

【美容師に対して感じる「もったいない」こと】
・環境のせいにして自分の価値を磨くことを止めてしまうこと
・自分の技術の安売り（信じて通ってくれるお客様への裏切りでもある）
・10年後を想像せず、将来を助けてくれる資産を積み上げないこと
・失敗を隠すこと（失敗は最高の学習の種）

【コメントの構成】
1. 診断結果を鏡として提示する（事実として、ですます調で）
2. 自分の経験を「私自身も昔そうでした」と重ねて共感を作る
3. 「〜ではないでしょうか」と問いかけで広げる
4. 最後は「どう思いますか？」か「応援しています」で締める

【注意】
・「チームや後輩」など特定の立場を前提にした表現は避け、「周囲の人」「関わる人」など誰にでも当てはまる言葉を使う
・相手の職場環境・立場は分からないため、決めつけずに問いかける形にする
・200〜300字程度の自然な語りかけで`;


function buildAiUserMessage(selfScores, selfType, peerScores, peerType, peerCount) {
  const typeNames = { R:"技術職人型", I:"研究探求型", A:"クリエイター型", S:"コミュニケーター型", E:"経営リーダー型", C:"管理サポート型" };
  const selfText = KEYS.map(k => `${AXIS_LABELS[k]}${selfScores[k]}/25`).join("、");
  let msg = `次の美容師の診断結果を見てコメントしてください。\n\n【自己評価】\nタイプ：${typeNames[selfType]}\nスコア：${selfText}\n`;
  if (peerScores && peerType && peerCount > 0) {
    const peerText = KEYS.map(k => `${AXIS_LABELS[k]}${Math.round(peerScores[k])}/20`).join("、");
    msg += `\n【他者評価】（${peerCount}名の平均）\nタイプ：${typeNames[peerType]}\nスコア：${peerText}\n`;
    msg += selfType === peerType
      ? `\n自己評価と他者評価のタイプが一致しています。この一致が何を意味するか、どう活かせるかを伝えてください。`
      : `\n自己評価は「${typeNames[selfType]}」、他者評価は「${typeNames[peerType]}」でタイプが異なります。この気づきをポジティブに伝えてください。`;
  } else {
    msg += `\n他者評価はまだありません。自己評価の結果だけを見てコメントしてください。`;
  }
  msg += `\n\n200〜300字程度の自然な語りかけでお願いします。`;
  return msg;
}

const WTD_LIST = [
{ key:"ひと",     desc:"人と関わる・伝える・育てる",       riasec:"S" },
{ key:"アイデア", desc:"創る・表現する・発想する",         riasec:"A" },
{ key:"技術",     desc:"道具を使う・手で仕上げる・つくる", riasec:"R" },
{ key:"データ",   desc:"記録・分析・整理する",             riasec:"C" },
];

// ─── ユーティリティ ───────────────────────────────────────
function encodeScores(scores) {
let num = 0;
KEYS.forEach((k,i) => { num += Math.min(scores[k]||0, 31) * Math.pow(32,i); });
return num.toString(36).toUpperCase().padStart(6,"0").slice(-6);
}

function decodeCode(code) {
try {
const num = parseInt(code, 36);
if (isNaN(num)) return null;
const scores = {};
let n = num;
KEYS.forEach(k => { scores[k] = n % 32; n = Math.floor(n/32); });
return KEYS.every(k => scores[k] >= 0 && scores[k] <= 25) ? scores : null;
} catch(e) { return null; }
}

function calcScores(answers, questions) {
const scores = { R:0, I:0, A:0, S:0, E:0, C:0 };
questions.forEach((q,i) => { if(answers[i]) scores[q.type] += answers[i]; });
return scores;
}

function getTopType(scores) {
return Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
}

// ─── UIコンポーネント ─────────────────────────────────────
function StarRating({ score, max=25, color }) {
const stars = Math.round((score/max)*5);
return (
<div style={{ display:"flex", gap:"3px" }}>
{[1,2,3,4,5].map(i=><span key={i} style={{ fontSize:"18px", color:i<=stars?color:"#DDD5CB" }}>★</span>)}
</div>
);
}

function RadarChart({ selfScores, peerScores, color }) {
const cx=150, cy=150, r=110;
const SELF_MAX=25, PEER_MAX=20;
const angle = i => (Math.PI*2*i)/6 - Math.PI/2;
const outerPt = (i,s=1) => ({ x:cx+r*s*Math.cos(angle(i)), y:cy+r*s*Math.sin(angle(i)) });
const selfPt  = i => { const s=selfScores[KEYS[i]]/SELF_MAX; return { x:cx+r*s*Math.cos(angle(i)), y:cy+r*s*Math.sin(angle(i)) }; };
const selfPath = KEYS.map((_,i)=>{ const p=selfPt(i); return `${i===0?"M":"L"}${p.x},${p.y}`; }).join(" ")+"Z";

let peerPath = null;
if (peerScores) {
const pts = KEYS.map((_,i)=>{ const s=peerScores[KEYS[i]]/PEER_MAX; const p={x:cx+r*s*Math.cos(angle(i)),y:cy+r*s*Math.sin(angle(i))}; return `${i===0?"M":"L"}${p.x},${p.y}`; }).join(" ")+"Z";
peerPath = pts;
}

return (
<svg width="300" height="300" viewBox="0 0 300 300">
{[0.2,0.4,0.6,0.8,1.0].map((lv,li)=>(
<polygon key={li} points={KEYS.map((_,i)=>{ const p=outerPt(i,lv); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke="#E8E0D6" strokeWidth={lv===1?1.5:1}/>
))}
{KEYS.map((_,i)=>{ const p=outerPt(i); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E8E0D6" strokeWidth="1"/>; })}
<path d={selfPath} fill="rgba(74,144,104,0.18)" stroke="#4A9068" strokeWidth="2.5" strokeLinejoin="round"/>
{KEYS.map((_,i)=>{ const p=selfPt(i); return <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#4A9068"/>; })}
{peerPath && <>
<path d={peerPath} fill="none" stroke="#D2783C" strokeWidth="2" strokeDasharray="5,3" strokeLinejoin="round"/>
{KEYS.map((_,i)=>{ const s=peerScores[KEYS[i]]/PEER_MAX; const p={x:cx+r*s*Math.cos(angle(i)),y:cy+r*s*Math.sin(angle(i))}; return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#D2783C" strokeWidth="2"/>; })}
</>}
{KEYS.map((k,i)=>{ const p=outerPt(i,1.27); return <text key={k} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#8A7E74" fontFamily="sans-serif" fontWeight="500">{AXIS_LABELS[k]}</text>; })}
</svg>
);
}

function QuestionCard({ text, index, total, selected, onSelect, onBack, color, progress }) {
const [localSelected, setLocalSelected] = useState(null);
const [locked, setLocked] = useState(false);

useEffect(()=>{
setLocalSelected(null);
setLocked(false);
}, [index]);

const handleSelect = val => {
if (locked) return;
setLocalSelected(val);
setLocked(true);
setTimeout(()=>{ onSelect(val); }, 350);
};

const displaySelected = localSelected !== null ? localSelected : selected;
return (
<div style={{ minHeight:"100vh", background:"#FAF7F3", display:"flex", flexDirection:"column", fontFamily:"sans-serif" }}>
<div style={{ background:"#EDE7DF", height:"4px" }}>
<div style={{ height:"4px", background:color, width:`${progress}%`, transition:"width 0.4s ease" }}/>
</div>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0" }}>
{index>0 ? <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"13px", color:"#8A7E74" }}>← 戻る</button> : <div/>}
<span style={{ fontSize:"12px", color:"#A09488", fontWeight:"600" }}>{index+1} / {total}</span>
</div>
<div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"24px 24px 40px", maxWidth:"480px", margin:"0 auto", width:"100%" }}>
<div style={{ background:"#fff", borderRadius:"20px", padding:"32px 24px", boxShadow:"0 2px 20px rgba(0,0,0,0.07)", marginBottom:"24px" }}>
<p style={{ fontSize:"16px", fontWeight:"600", color:"#2C2416", lineHeight:"1.8", textAlign:"center", margin:0 }}>{text}</p>
</div>
<div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
{RATINGS.map(r=>{
const sel = displaySelected===r.value;
return (
<button key={r.value} onClick={()=>handleSelect(r.value)} style={{ background:sel?color:"#fff", border:`2px solid ${sel?color:"#EDE7DF"}`, borderRadius:"12px", padding:"14px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:"14px", transition:"all 0.2s ease" }}>
<span style={{ fontSize:"18px", color:sel?"#fff":"#C0B8B0", fontWeight:"600", minWidth:"24px" }}>{r.short}</span>
<span style={{ fontSize:"13px", color:sel?"#fff":"#4A4036", fontWeight:sel?"600":"400", textAlign:"left", whiteSpace:"pre-line", lineHeight:"1.4" }}>{r.label}</span>
</button>
);
})}
</div>
</div>
</div>
);
}

// ─── トップ画面 ───────────────────────────────────────────
function TopScreen({ onSelfStart, onPeerStart }) {
const [codeInput, setCodeInput] = useState("");
const [error, setError] = useState("");
const [showResume, setShowResume] = useState(false);
const [resumeCode, setResumeCode] = useState("");
const [resumeError, setResumeError] = useState("");

const handlePeerStart = () => {
if (!codeInput.trim()) { setError("診断コードを入力してください"); return; }
onPeerStart(codeInput.trim().toUpperCase());
};

const handleResume = () => {
const decoded = decodeCode(resumeCode.trim().toUpperCase());
if (decoded) {
onSelfStart(decoded, resumeCode.trim().toUpperCase());
} else {
setResumeError("コードが正しくありません");
}
};

return (
<div style={{ minHeight:"100vh", background:"#FAF7F3", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px", textAlign:"center", fontFamily:"sans-serif" }}>
<div style={{ width:"48px", height:"4px", background:"#4A9068", borderRadius:"2px", marginBottom:"24px" }}/>
<h1 style={{ fontSize:"22px", fontWeight:"700", color:"#2C2416", marginBottom:"6px" }}>美容師キャリア診断</h1>
<p style={{ fontSize:"13px", color:"#8A7E74", marginBottom:"32px", lineHeight:"1.8" }}>自分を知り、キャリアの方向を見つけよう。</p>

  {/* 自己診断 */}
  <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", marginBottom:"16px", maxWidth:"360px", width:"100%", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", textAlign:"left" }}>
    <p style={{ fontSize:"11px", color:"#4A9068", fontWeight:"700", letterSpacing:"0.15em", marginBottom:"8px" }}>自己診断</p>
    <p style={{ fontSize:"14px", color:"#2C2416", fontWeight:"600", marginBottom:"4px" }}>30問の診断をはじめる</p>
    <p style={{ fontSize:"12px", color:"#8A7E74", marginBottom:"16px" }}>所要時間 約5〜8分・5段階選択</p>
    <button onClick={()=>onSelfStart(null, null)} style={{ width:"100%", background:"#4A9068", color:"#fff", border:"none", borderRadius:"50px", padding:"13px", fontSize:"14px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 16px rgba(74,144,104,0.35)" }}>
      診断をはじめる
    </button>
    <button onClick={()=>setShowResume(!showResume)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", fontSize:"12px", color:"#8A7E74", marginTop:"10px", textDecoration:"underline" }}>
      すでに診断済みの方はこちら
    </button>
    {showResume && (
      <div style={{ marginTop:"12px" }}>
        <div style={{ display:"flex", gap:"8px" }}>
          <input value={resumeCode} onChange={e=>{setResumeCode(e.target.value.toUpperCase());setResumeError("");}}
            placeholder="診断コードを入力" maxLength={8}
            style={{ flex:1, padding:"10px", border:"1.5px solid #E0D8D0", borderRadius:"8px", fontSize:"14px", fontWeight:"700", letterSpacing:"0.12em", fontFamily:"monospace", textAlign:"center", outline:"none" }}/>
          <button onClick={handleResume} style={{ background:"#4A9068", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", fontWeight:"700", cursor:"pointer" }}>表示</button>
        </div>
        {resumeError && <p style={{ fontSize:"12px", color:"#C45A3A", marginTop:"6px" }}>{resumeError}</p>}
      </div>
    )}
  </div>

  {/* 他者評価 */}
  <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", maxWidth:"360px", width:"100%", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", textAlign:"left" }}>
    <p style={{ fontSize:"11px", color:"#D2783C", fontWeight:"700", letterSpacing:"0.15em", marginBottom:"8px" }}>他者評価</p>
    <p style={{ fontSize:"14px", color:"#2C2416", fontWeight:"600", marginBottom:"4px" }}>同僚・先輩を評価する</p>
    <p style={{ fontSize:"12px", color:"#8A7E74", marginBottom:"16px" }}>本人から受け取ったコードを入力</p>
    <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
      <input value={codeInput} onChange={e=>{setCodeInput(e.target.value.toUpperCase());setError("");}}
        placeholder="例：9BQSNI" maxLength={8}
        style={{ flex:1, padding:"10px", border:"1.5px solid #E0D8D0", borderRadius:"8px", fontSize:"16px", fontWeight:"700", letterSpacing:"0.15em", fontFamily:"monospace", textAlign:"center", outline:"none" }}/>
      <button onClick={handlePeerStart} style={{ background:"#D2783C", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", fontWeight:"700", cursor:"pointer" }}>開始</button>
    </div>
    {error && <p style={{ fontSize:"12px", color:"#C45A3A" }}>{error}</p>}
  </div>

  <p style={{ fontSize:"11px", color:"#C0B8B0", marginTop:"20px" }}>※ 回答内容は外部に送信されません</p>
</div>

);
}

// ─── 結果画面 ─────────────────────────────────────────────
function ResultScreen({ selfScores, code, onRetry }) {
const [peerResults, setPeerResults] = useState([]);
const [loading, setLoading] = useState(true);
const [copied, setCopied] = useState(false);
const [aiRound, setAiRound] = useState(0);
const [aiMessages, setAiMessages] = useState([]);
const [aiComments, setAiComments] = useState([]);
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState(false);
const [userInput, setUserInput] = useState("");
const topType = getTopType(selfScores);
const info = TYPE_INFO[topType];
const color = info.color;

const loadPeers = useCallback(() => {
setLoading(true);
try {
const val = localStorage.getItem(`peers_${code}`);
setPeerResults(val ? JSON.parse(val) : []);
} catch(e) { setPeerResults([]); }
setLoading(false);
}, [code]);

useEffect(()=>{ loadPeers(); }, [loadPeers]);

const avgPeer = peerResults.length > 0
? Object.fromEntries(KEYS.map(k=>[k, peerResults.reduce((s,p)=>s+p.scores[k],0)/peerResults.length]))
: null;
const peerTopType = avgPeer ? getTopType(avgPeer) : null;
const peerInfo = peerTopType ? TYPE_INFO[peerTopType] : null;

const fetchAiComment = async (inputText) => {
if (aiRound >= 3 || aiLoading) return;
setAiLoading(true);
setAiError(false);
setUserInput("");
try {
const newMessages = aiRound === 0
  ? [{ role: "user", content: buildAiUserMessage(selfScores, topType, avgPeer, peerTopType, peerResults.length) }]
  : [...aiMessages, { role: "user", content: `[これは${aiRound + 1}回目のやり取りです]\n${inputText}` }];
const res = await fetch("/api/comment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: AI_SYSTEM_PROMPT,
    messages: newMessages,
  }),
});
if (!res.ok) throw new Error();
const data = await res.json();
const comment = data.content[0].text;
const updatedMessages = [...newMessages, { role: "assistant", content: comment }];
setAiMessages(updatedMessages);
setAiComments(prev => [...prev, comment]);
setAiRound(prev => prev + 1);
} catch(e) {
setAiError(true);
}
setAiLoading(false);
};

const downloadCSV = () => {
const rows = [["区分","コード","タイプ","技術力","探求力","創造力","共感力","経営力","管理力"]];
rows.push(["自己評価",code,info.name,selfScores.R,selfScores.I,selfScores.A,selfScores.S,selfScores.E,selfScores.C]);
if (avgPeer) rows.push(["他者評価平均",code,TYPE_INFO[getTopType(avgPeer)].name,
Math.round(avgPeer.R),Math.round(avgPeer.I),Math.round(avgPeer.A),Math.round(avgPeer.S),Math.round(avgPeer.E),Math.round(avgPeer.C)]);
const csv = rows.map(r=>r.join(",")).join("\n");
const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`career_${code}.csv`; a.click();
};

return (
<div style={{ minHeight:"100vh", background:"#FAF7F3", fontFamily:"sans-serif", paddingBottom:"60px" }}>
<div style={{ background:color, padding:"36px 24px 30px", textAlign:"center" }}>
<p style={{ color:"rgba(255,255,255,0.8)", fontSize:"11px", letterSpacing:"0.2em", marginBottom:"8px" }}>あなたのキャリアタイプ</p>
<h1 style={{ color:"#fff", fontSize:"28px", fontWeight:"700", margin:0 }}>{info.name}</h1>
</div>

  <div style={{ maxWidth:"480px", margin:"0 auto", padding:"0 20px" }}>
    {/* チャート */}
    <div style={{ background:"#fff", borderRadius:"16px", padding:"24px 16px 16px", marginTop:"24px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <p style={{ fontSize:"11px", color:"#A09488", letterSpacing:"0.15em", marginBottom:"4px", fontWeight:"600" }}>RIASEC プロフィール</p>
      {avgPeer && (
        <div style={{ display:"flex", gap:"20px", marginBottom:"8px" }}>
          <span style={{ fontSize:"11px", color:"#4A9068", fontWeight:"700" }}>● 自己評価</span>
          <span style={{ fontSize:"11px", color:"#D2783C", fontWeight:"700" }}>- - 他者評価（{peerResults.length}名平均）</span>
        </div>
      )}
      <RadarChart selfScores={selfScores} peerScores={avgPeer} color={color}/>
    </div>

    {/* タイプ比較 */}
    <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", marginTop:"16px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
          <span style={{ fontSize:"10px", color:"#4A9068", fontWeight:"700", background:"rgba(74,144,104,0.1)", padding:"3px 8px", borderRadius:"4px" }}>自己評価</span>
          <span style={{ fontSize:"16px", fontWeight:"700", color:"#2C2416" }}>{info.name}</span>
        </div>
        {info.lines.map((line,i)=>(
          <p key={i} style={{ fontSize:"14px", lineHeight:"1.9", color:"#3A3028", marginBottom:i<info.lines.length-1?"12px":0 }}>{line}</p>
        ))}
      </div>
      {avgPeer && (
        <div style={{ marginTop:"20px", paddingTop:"20px", borderTop:"1px solid #F0EAE2" }}>
          {topType === peerTopType ? (
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ fontSize:"10px", color:"#D2783C", fontWeight:"700", background:"rgba(210,120,60,0.1)", padding:"3px 8px", borderRadius:"4px" }}>他者評価</span>
              <span style={{ fontSize:"14px", color:"#6A6058" }}>他者評価も同じタイプです</span>
            </div>
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
                <span style={{ fontSize:"10px", color:"#D2783C", fontWeight:"700", background:"rgba(210,120,60,0.1)", padding:"3px 8px", borderRadius:"4px" }}>他者評価</span>
                <span style={{ fontSize:"16px", fontWeight:"700", color:"#2C2416" }}>{peerInfo.name}</span>
              </div>
              {peerInfo.lines.map((line,i)=>(
                <p key={i} style={{ fontSize:"14px", lineHeight:"1.9", color:"#3A3028", marginBottom:i<peerInfo.lines.length-1?"12px":0 }}>{line}</p>
              ))}
            </>
          )}
        </div>
      )}
    </div>

    {/* WTD */}
    <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", marginTop:"16px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
      <p style={{ fontSize:"11px", color:"#A09488", letterSpacing:"0.15em", marginBottom:"20px", fontWeight:"600" }}>あなたの仕事スタイル</p>
      <div style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
        {WTD_LIST.map(w=>(
          <div key={w.key}>
            <div style={{ display:"flex", alignItems:"baseline", gap:"8px", marginBottom:"6px" }}>
              <span style={{ fontSize:"14px", fontWeight:"700" }}>{w.key}</span>
              <span style={{ fontSize:"12px", color:"#8A7E74" }}>{w.desc}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"10px", color:"#4A9068", fontWeight:"600", minWidth:"30px" }}>自己</span>
                <StarRating score={selfScores[w.riasec]} color="#4A9068"/>
              </div>
              {avgPeer && (
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"10px", color:"#D2783C", fontWeight:"600", minWidth:"30px" }}>他者</span>
                  <StarRating score={avgPeer[w.riasec]} max={20} color="#D2783C"/>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 七海からのコメント */}
    <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", marginTop:"16px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom: aiComments.length > 0 ? "20px" : "0" }}>
        <div style={{ width:"32px", height:"3px", background:"#4A9068", borderRadius:"2px", flexShrink:0 }}/>
        <p style={{ fontSize:"11px", color:"#A09488", letterSpacing:"0.15em", fontWeight:"600", margin:0 }}>七海からのコメント</p>
        {aiRound > 0 && (
          <span style={{ marginLeft:"auto", fontSize:"11px", color:"#8A7E74", background:"#F0EAE2", padding:"3px 10px", borderRadius:"20px", whiteSpace:"nowrap" }}>
            {aiRound}回目 / 3回
          </span>
        )}
      </div>

      {/* コメント一覧 */}
      {aiComments.map((comment, idx) => (
        <div key={idx} style={{ marginBottom: idx < aiComments.length - 1 ? "20px" : "0", paddingBottom: idx < aiComments.length - 1 ? "20px" : "0", borderBottom: idx < aiComments.length - 1 ? "1px solid #F0EAE2" : "none" }}>
          <p style={{ fontSize:"11px", color:"#B0A89E", marginBottom:"8px", marginTop:0 }}>{idx + 1}回目</p>
          <p style={{ fontSize:"14px", lineHeight:"1.9", color:"#3A3028", margin:0, whiteSpace:"pre-wrap" }}>{comment}</p>
        </div>
      ))}

      {/* スピナー */}
      {aiLoading && (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ width:"36px", height:"36px", border:"3px solid #E8E0D6", borderTop:"3px solid #4A9068", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 12px" }}/>
          <p style={{ fontSize:"14px", color:"#8A7E74", margin:0 }}>七海が読んでいます…</p>
        </div>
      )}

      {/* エラー */}
      {aiError && !aiLoading && (
        <p style={{ fontSize:"12px", color:"#C45A3A", textAlign:"center", margin:"12px 0 0" }}>取得に失敗しました。もう一度お試しください。</p>
      )}

      {/* CTA */}
      {!aiLoading && aiRound === 0 && (
        <button onClick={()=>fetchAiComment("")} style={{ width:"100%", background:"#4A9068", color:"#fff", border:"none", borderRadius:"12px", padding:"16px", fontSize:"15px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 16px rgba(74,144,104,0.35)", marginTop: aiComments.length > 0 ? "20px" : "0" }}>
          七海からのコメントを受け取る
        </button>
      )}
      {!aiLoading && aiRound > 0 && aiRound < 3 && (
        <div style={{ marginTop:"20px" }}>
          <p style={{ fontSize:"12px", color:"#8A7E74", marginBottom:"8px" }}>七海への質問・感想を入力してください（あと{3 - aiRound}回）</p>
          <textarea
            value={userInput}
            onChange={e=>setUserInput(e.target.value)}
            placeholder="例：技術力が低く評価されているのが気になりました。どう思いますか？"
            rows={3}
            style={{ width:"100%", padding:"12px", border:"1.5px solid #E0D8D0", borderRadius:"12px", fontSize:"14px", color:"#2C2416", outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"sans-serif", lineHeight:"1.7" }}
          />
          <button
            onClick={()=>{ if(userInput.trim()) fetchAiComment(userInput.trim()); }}
            style={{ width:"100%", marginTop:"8px", background:userInput.trim()?"#4A9068":"#E0D8D0", color:"#fff", border:"none", borderRadius:"12px", padding:"14px", fontSize:"14px", fontWeight:"700", cursor:userInput.trim()?"pointer":"default", transition:"background 0.2s" }}>
            七海に送る
          </button>
        </div>
      )}
      {!aiLoading && aiRound >= 3 && (
        <div style={{ marginTop:"20px", padding:"20px", background:"#F5F1EC", borderRadius:"12px", textAlign:"center" }}>
          <p style={{ fontSize:"14px", color:"#3A3028", lineHeight:"1.8", margin:"0 0 16px" }}>
            もっと詳しく話したい方は<br/>七海に直接相談できます
          </p>
          <button style={{ background:"#4A9068", color:"#fff", border:"none", borderRadius:"50px", padding:"13px 32px", fontSize:"14px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 16px rgba(74,144,104,0.35)" }}>
            七海に相談する
          </button>
        </div>
      )}
    </div>

    {/* 他者評価コード */}
    <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", marginTop:"16px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
      <p style={{ fontSize:"11px", color:"#A09488", letterSpacing:"0.15em", marginBottom:"12px", fontWeight:"600" }}>他者評価を集める</p>
      <p style={{ fontSize:"13px", color:"#6A6058", lineHeight:"1.7", marginBottom:"16px" }}>このコードをLINEなどで信頼できる同僚・先輩に送りましょう。</p>
      <div style={{ background:"#F5F1EC", borderRadius:"12px", padding:"16px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
        <span style={{ fontSize:"30px", fontWeight:"700", letterSpacing:"0.25em", color:"#2C2416", fontFamily:"monospace" }}>{code}</span>
        <button onClick={()=>{navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
          style={{ background:copied?"#4A9068":color, color:"#fff", border:"none", borderRadius:"8px", padding:"8px 16px", fontSize:"12px", fontWeight:"600", cursor:"pointer", transition:"background 0.3s" }}>
          {copied?"コピー済 ✓":"コピー"}
        </button>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:"13px", color:"#8A7E74" }}>{loading?"読み込み中...":`他者評価：${peerResults.length}件`}</span>
        {peerResults.length === 0 && !loading && (
          <button onClick={loadPeers} style={{ background:"none", border:"1px solid #E0D8D0", borderRadius:"8px", padding:"6px 14px", fontSize:"12px", color:"#8A7E74", cursor:"pointer" }}>更新</button>
        )}
      </div>
      {peerResults.length > 0 && (
        <div style={{ marginTop:"16px" }}>
          <p style={{ fontSize:"12px", color:"#8A7E74", textAlign:"center", marginBottom:"10px" }}>他者評価が完了したら下のボタンを押してください</p>
          <button onClick={loadPeers} style={{ width:"100%", background:"#D2783C", color:"#fff", border:"none", borderRadius:"12px", padding:"16px", fontSize:"15px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 16px rgba(210,120,60,0.4)" }}>
            他者評価を反映する
          </button>
        </div>
      )}
    </div>

    <div style={{ marginTop:"12px" }}>
      <button onClick={downloadCSV} style={{ width:"100%", background:"#fff", border:"1px solid #E0D8D0", borderRadius:"12px", padding:"14px", fontSize:"13px", color:"#6A6058", cursor:"pointer", fontWeight:"600" }}>
        📥　結果をCSVでダウンロード
      </button>
    </div>

    <div style={{ textAlign:"center", marginTop:"36px" }}>
      <p style={{ fontSize:"12px", color:"#A09488", marginBottom:"12px" }}>診断結果についてさらに詳しく話しませんか？</p>
      <button style={{ background:color, color:"#fff", border:"none", borderRadius:"50px", padding:"14px 40px", fontSize:"14px", fontWeight:"700", cursor:"pointer", boxShadow:`0 4px 20px ${color}55`, display:"block", margin:"0 auto 16px" }}>
        七海にキャリア相談する
      </button>
      <button onClick={onRetry} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"13px", color:"#A09488", textDecoration:"underline" }}>
        トップに戻る
      </button>
    </div>
  </div>
</div>

);
}

// ─── 他者評価完了画面 ─────────────────────────────────────
function PeerDoneScreen({ name, code, scores, onRetry }) {
const [status, setStatus] = useState("saving");
useEffect(()=>{
let peers = [];
try {
const existing = localStorage.getItem(`peers_${code}`);
if (existing) peers = JSON.parse(existing);
} catch(e) {}
try {
peers.push({ scores, timestamp: Date.now() });
localStorage.setItem(`peers_${code}`, JSON.stringify(peers));
} catch(e) {}
setStatus("done");
},[code, scores]);

return (
<div style={{ minHeight:"100vh", background:"#FAF7F3", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", textAlign:"center", fontFamily:"sans-serif" }}>
{status==="saving" ? (
<>
<div style={{ width:"48px", height:"48px", border:"3px solid #E0D8D0", borderTop:"3px solid #D2783C", borderRadius:"50%", animation:"spin 1s linear infinite", marginBottom:"24px" }}/>
<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
<p style={{ color:"#6A6058" }}>送信中...</p>
</>
) : (
<>
<div style={{ fontSize:"48px", marginBottom:"24px" }}>✅</div>
<h2 style={{ fontSize:"20px", fontWeight:"700", color:"#2C2416", marginBottom:"12px" }}>回答を送信しました</h2>
<p style={{ fontSize:"14px", color:"#6A6058", lineHeight:"1.8", marginBottom:"8px" }}>
<strong>{name}さん</strong>の評価が完了しました。
</p>
<p style={{ fontSize:"13px", color:"#8A7E74", lineHeight:"1.7", marginBottom:"32px" }}>
{name}さんがトップ画面でコードを入力して<br/>「更新」をタップすると反映されます。
</p>
<div style={{ background:"#fff", borderRadius:"12px", padding:"16px 28px", marginBottom:"32px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
<p style={{ fontSize:"11px", color:"#A09488", marginBottom:"4px" }}>診断コード</p>
<p style={{ fontSize:"24px", fontWeight:"700", letterSpacing:"0.2em", color:"#2C2416", fontFamily:"monospace" }}>{code}</p>
</div>
<button onClick={onRetry} style={{ background:"#D2783C", color:"#fff", border:"none", borderRadius:"50px", padding:"14px 40px", fontSize:"14px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 16px rgba(210,120,60,0.4)" }}>
トップに戻る
</button>
</>
)}
</div>
);
}

// ─── メインアプリ ─────────────────────────────────────────
export default function App() {
const [mode, setMode] = useState("top"); // top | self | peer | result | peerdone
const [selfAnswers, setSelfAnswers] = useState(new Array(30).fill(null));
const [peerAnswers, setPeerAnswers] = useState(new Array(24).fill(null));
const [selfIndex, setSelfIndex] = useState(0);
const [peerIndex, setPeerIndex] = useState(0);
const [code, setCode] = useState(null);
const [peerName, setPeerName] = useState("");
const [resultScores, setResultScores] = useState(null);

const startSelf = (decodedScores, decodedCode) => {
if (decodedScores) {
setResultScores(decodedScores);
setCode(decodedCode);
setMode("result");
} else {
setSelfAnswers(new Array(30).fill(null));
setSelfIndex(0);
setMode("self");
}
};

const startPeer = (inputCode) => {
const decoded = decodeCode(inputCode);
if (!decoded) { return; }
setCode(inputCode);
setPeerAnswers(new Array(24).fill(null));
setPeerIndex(0);
// コードから被評価者の名前を取得（ここではコード入力時に名前も入れてもらう）
setPeerName("");
setMode("peer_name");
};

const handleSelfAnswer = (idx, val) => {
const a = [...selfAnswers]; a[idx]=val; setSelfAnswers(a);
if (idx+1 >= 30) {
const scores = calcScores([...a], SELF_QUESTIONS);
const newCode = encodeScores(scores);
setCode(newCode);
setResultScores(scores);
setMode("result");
} else setSelfIndex(idx+1);
};

const handlePeerAnswer = (idx, val) => {
const a = [...peerAnswers]; a[idx]=val; setPeerAnswers(a);
if (idx+1 >= 24) {
const scores = calcScores([...a], PEER_QUESTIONS);
setResultScores(scores);
setMode("peerdone");
} else setPeerIndex(idx+1);
};

// 他者評価の名前入力画面
if (mode==="peer_name") {
return (
<div style={{ minHeight:"100vh", background:"#FAF7F3", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", fontFamily:"sans-serif" }}>
<div style={{ width:"48px", height:"4px", background:"#D2783C", borderRadius:"2px", marginBottom:"32px" }}/>
<h2 style={{ fontSize:"20px", fontWeight:"700", color:"#2C2416", marginBottom:"8px", textAlign:"center" }}>誰を評価しますか？</h2>
<p style={{ fontSize:"13px", color:"#8A7E74", marginBottom:"32px", textAlign:"center" }}>評価する方のお名前を入力してください</p>
<div style={{ background:"#fff", borderRadius:"16px", padding:"24px", maxWidth:"360px", width:"100%", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
<input value={peerName} onChange={e=>setPeerName(e.target.value)}
placeholder="例：田中"
style={{ width:"100%", padding:"14px", border:"1.5px solid #E0D8D0", borderRadius:"10px", fontSize:"16px", color:"#2C2416", outline:"none", boxSizing:"border-box", marginBottom:"16px" }}/>
<p style={{ fontSize:"11px", color:"#B0A89E", marginBottom:"16px" }}>※ 名前はこのアプリ内でのみ使用されます</p>
<button onClick={()=>{ if(peerName.trim()) setMode("peer"); }}
style={{ width:"100%", background:peerName.trim()?"#D2783C":"#E0D8D0", color:"#fff", border:"none", borderRadius:"50px", padding:"14px", fontSize:"14px", fontWeight:"700", cursor:peerName.trim()?"pointer":"default", transition:"background 0.2s" }}>
評価をはじめる
</button>
</div>
</div>
);
}

if (mode==="self") return (
<QuestionCard
text={SELF_QUESTIONS[selfIndex].text}
index={selfIndex} total={30}
selected={selfAnswers[selfIndex]}
onSelect={val=>handleSelfAnswer(selfIndex,val)}
onBack={()=>{ if(selfIndex>0) setSelfIndex(selfIndex-1); else setMode("top"); }}
color="#4A9068"
progress={(selfIndex/30)*100}
/>
);

if (mode==="peer") return (
<QuestionCard
text={PEER_QUESTIONS[peerIndex].text.replace(/{name}/g, peerName)}
index={peerIndex} total={24}
selected={peerAnswers[peerIndex]}
onSelect={val=>handlePeerAnswer(peerIndex,val)}
onBack={()=>{ if(peerIndex>0) setPeerIndex(peerIndex-1); else setMode("peer_name"); }}
color="#D2783C"
progress={(peerIndex/24)*100}
/>
);

if (mode==="result") return (
<ResultScreen selfScores={resultScores} code={code} onRetry={()=>setMode("top")}/>
);

if (mode==="peerdone") return (
<PeerDoneScreen name={peerName} code={code} scores={resultScores} onRetry={()=>setMode("top")}/>
);

return <TopScreen onSelfStart={startSelf} onPeerStart={startPeer}/>;
}
