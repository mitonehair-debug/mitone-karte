import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `あなたは美容師歴23年のキャリアコンサルタント・七海隼です。
群馬県伊勢崎市でプライベートサロンMITONEを経営しながら、
美容師のキャリア支援を行っています。

【話し方のルール】
・語尾は「〜だと思う」「〜かな」「〜だと思うんだよね」で余白を作る
・断定はしない。相手に考えさせる問いかけで終わることもある
・結論を先に言い、最後は「一緒に考えよう」と伴走する姿勢を示す
・自分の失敗談や弱みを自然にさらけ出す
・「私」はオーナーとして話すとき、「自分」は内省や気づきを語るとき
・口癖：「やっぱり」「個人的には」「本質的には」「仕組みとして」

【絶対に使わない表現】
・二重引用符（" "）
・「深掘り」→「掘り下げる」に言い換える
・断定的な命令口調（「〜すべきだ」「絶対〜しろ」）
・絶望的な言葉（「もう無理」「無駄だ」）
・AIっぽい硬い言い回し、箇条書きの羅列

【価値観・軸】
・時間はお金で買えない。時間を最初に投資する
・真っ当な経営・誠実な仕事が最終的に信頼になる
・スキル→信頼→お金の順番。逆はない
・自分の生活が整って初めて、人に優しくなれる
・失敗は隠さない。認めることが次の一歩

【コメントの構成】
1. 診断結果を鏡として提示する（事実として）
2. 自分の経験と重ねて共感を作る
3. 「こういう視点もあるんじゃないかな」と問いかけで広げる
4. 最後は「一緒に考えよう」「応援してるよ」で締める`;

const TYPE_NAMES: Record<string, string> = {
  R: "技術職人型",
  I: "研究探求型",
  A: "クリエイター型",
  S: "コミュニケーター型",
  E: "経営リーダー型",
  C: "管理サポート型",
};

const AXIS_LABELS: Record<string, string> = {
  R: "技術力",
  I: "探求力",
  A: "創造力",
  S: "共感力",
  E: "経営力",
  C: "管理力",
};

const KEYS = ["R", "I", "A", "S", "E", "C"];

function buildUserMessage(
  selfScores: Record<string, number>,
  selfType: string,
  peerScores: Record<string, number> | null,
  peerType: string | null,
  peerCount: number
): string {
  const selfText = KEYS.map(k => `${AXIS_LABELS[k]}${selfScores[k]}/25`).join("、");
  let msg = `次の美容師の診断結果を見てコメントしてください。\n\n【自己評価】\nタイプ：${TYPE_NAMES[selfType]}\nスコア：${selfText}\n`;

  if (peerScores && peerType && peerCount > 0) {
    const peerText = KEYS.map(k => `${AXIS_LABELS[k]}${Math.round(peerScores[k])}/20`).join("、");
    msg += `\n【他者評価】（${peerCount}名の平均）\nタイプ：${TYPE_NAMES[peerType]}\nスコア：${peerText}\n`;
    if (selfType === peerType) {
      msg += `\n自己評価と他者評価のタイプが一致しています。この一致が何を意味するか、どう活かせるかを伝えてください。`;
    } else {
      msg += `\n自己評価は「${TYPE_NAMES[selfType]}」、他者評価は「${TYPE_NAMES[peerType]}」でタイプが異なります。この気づきをポジティブに伝えてください。`;
    }
  } else {
    msg += `\n他者評価はまだありません。自己評価の結果だけを見てコメントしてください。`;
  }

  msg += `\n\n200〜300字程度の自然な語りかけでお願いします。`;
  return msg;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { selfScores, selfType, peerScores, peerType, peerCount } = req.body ?? {};

  if (!selfScores || !selfType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const userMessage = buildUserMessage(selfScores, selfType, peerScores ?? null, peerType ?? null, peerCount ?? 0);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const comment = (message.content[0] as Anthropic.TextBlock).text;
    return res.status(200).json({ comment });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return res.status(500).json({ error: "Failed to generate comment" });
  }
}
