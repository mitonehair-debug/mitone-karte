import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#FAF7F3',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          position: 'relative',
        },
        children: [
          // 上部バー
          { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '12px', background: '#4A9068' } } },
          // 下部バー
          { type: 'div', props: { style: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '12px', background: '#4A9068' } } },
          // メインコンテンツ
          {
            type: 'div',
            props: {
              style: { display: 'flex', flex: 1, padding: '60px 80px', alignItems: 'center', gap: '60px' },
              children: [
                // 左側テキスト
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' },
                    children: [
                      { type: 'div', props: { style: { width: '6px', height: '80px', background: '#4A9068', borderRadius: '3px', marginBottom: '8px' } } },
                      { type: 'div', props: { style: { fontSize: '68px', fontWeight: '700', color: '#2C2416', lineHeight: 1.2 }, children: '美容師タイプ別\nキャリア診断' } },
                      { type: 'div', props: { style: { fontSize: '30px', color: '#4A9068', fontWeight: '600', marginTop: '8px' }, children: '30問・無料・AIキャリア相談つき' } },
                      { type: 'div', props: { style: { fontSize: '26px', color: '#6A6058', marginTop: '4px' }, children: '自分でも知らなかった強みが見つかる。' } },
                      { type: 'div', props: { style: { marginTop: '24px', paddingTop: '24px', borderTop: '1.5px solid #E0D8D0', display: 'flex', alignItems: 'center', gap: '12px' } ,
                        children: [
                          { type: 'div', props: { style: { fontSize: '32px', fontWeight: '700', color: '#4A9068' }, children: 'MITONE' } },
                          { type: 'div', props: { style: { fontSize: '24px', color: '#8A7E74' }, children: '七海隼｜群馬県伊勢崎市' } },
                        ]
                      } },
                    ],
                  },
                },
                // 右側レーダー風デコ
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '280px', height: '280px', borderRadius: '50%',
                      border: '3px solid #4A9068',
                      background: 'rgba(74,144,104,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    },
                    children: {
                      type: 'div',
                      props: {
                        style: { fontSize: '80px', textAlign: 'center' },
                        children: '✂️',
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}
