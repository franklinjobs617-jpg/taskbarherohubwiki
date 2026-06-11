import { type Locale } from "@/lib/game-data/data";

type Step = string;

const HINTS: Record<string, { zh: Step[]; en: Step[]; ja: Step[]; ko: Step[] }> = {
  "/items": {
    zh: ["顶部搜索框输入名称/英文名", "用 chip 过滤类型/职业/市场状态", "点击物品名进入详情，看掉率、关卡和价格"],
    en: ["Use the search box to filter by name", "Apply chips to narrow by type, class, or market status", "Click an item for drop rate, source stage, and price"],
    ja: ["上部検索ボックスで名前検索", "chip でタイプ・職業・市場状態を絞り込み", "アイテム名をクリックでドロップ率・入手ステージ・価格を表示"],
    ko: ["상단 검색창에서 이름으로 검색", "chip 으로 타입/직업/시장 상태 필터", "아이템명을 클릭해 드롭률, 출처, 가격 확인"],
  },
  "/chests": {
    zh: ["按装备等级选 Lv chip（1/20/50/80）", "用 quick filter 选可交易 / 装备 / 材料", "卡片底部看 Top source（最佳来源关卡）和 Best use"],
    en: ["Pick a level chip (Lv 1 / 20 / 50 / 80)", "Use the quick filter for tradable / gear / materials", "Each card shows the top source stage and best use"],
    ja: ["装備レベル Lv chip (1/20/50/80) を選択", "取引可能 / 装備 / 素材 を quick filter", "カード末尾に Top source と Best use を表示"],
    ko: ["장비 레벨 Lv chip (1/20/50/80) 선택", "거래 가능 / 장비 / 재료를 quick filter", "카드 하단에 Top source 및 Best use 표시"],
  },
  "/monsters": {
    zh: ["看卡片类型和 Boss 标签", '看「主要关卡」行决定去刷哪个', "点击怪物查看完整掉落表和出现关卡"],
    en: ["Check the type and Boss tag on each card", "Use the Top stage line to pick a farm target", "Click a monster for the full drop table"],
    ja: ["カードの種類と Boss タグを確認", "「主要ステージ」行で周回先を選ぶ", "クリックで全ドロップと出現ステージを表示"],
    ko: ["카드의 타입과 Boss 태그 확인", "\"주요 스테이지\" 줄에서 파밍 대상 선택", "클릭하면 전체 드롭표와 출현 스테이지 표시"],
  },
  "/market": {
    zh: ["先看 Decision 列（Sell/Keep/Farm）", '理解 Sell/Keep/Farm 标签前点「How to read」折叠', "看 Lowest + Listings 综合判断市场深度"],
    en: ["Scan the Decision column first (Sell / Keep / Farm)", "Open the How to read expander before trusting the label", "Cross-check Lowest and Listings to gauge market depth"],
    ja: ["まず Decision 列 (Sell/Keep/Farm) を確認", "ラベルを理解するために How to read を開く", "Lowest と Listings を組み合わせて市場の厚みを判断"],
    ko: ["먼저 Decision 열(Sell/Keep/Farm) 확인", "라벨을 이해하려면 How to read 펼치기", "Lowest + Listings 함께 보고 시장 깊이 판단"],
  },
  "/runes": {
    zh: ["顶部 Quick answer 告诉你优先加点", "看 4 条 FAQ 了解常见问题", "点节点查看解锁条件"],
    en: ["Read the Quick answer at the top for priority", "Skim the 4 FAQ items for common pitfalls", "Click a node to see unlock conditions"],
    ja: ["上部の Quick answer で優先度を確認", "FAQ 4 問でよくある疑問をチェック", "ノードをクリックで解放条件を表示"],
    ko: ["상단 Quick answer 에서 우선순위 확인", "FAQ 4개로 자주 묻는 질문 점검", "노드 클릭으로 해금 조건 표시"],
  },
  "/pets": {
    zh: ["先看 4 个 Top pick 卡片", "按 Bonus 排序决定先解锁哪只", "看 Best stage 和 Kill count 算时间成本"],
    en: ["Look at the 4 Top pick cards first", "Sort by bonus to decide unlock order", "Cross-check Best stage and Kill count for time cost"],
    ja: ["まず Top pick 4 枚を確認", "ボーナスで並び替えて解放順を決定", "Best stage と Kill count で時間コストを算出"],
    ko: ["먼저 Top pick 카드 4장 확인", "보너스 순으로 정렬해 해금 순서 결정", "Best stage + Kill count 로 시간 비용 계산"],
  },
};

export function HowToUse({ pageKey, locale }: { pageKey: keyof typeof HINTS; locale: Locale }) {
  const h = HINTS[pageKey];
  if (!h) return null;
  const steps = (h as Record<string, Step[]>)[locale] ?? h.en;
  return (
    <section className="mb-4 border border-[#27272a] bg-[#0d0d0d] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d9d9d]">
        {locale === "zh" ? "怎么用这页" : locale === "ja" ? "使い方" : locale === "ko" ? "사용법" : "How to use this page"}
      </p>
      <ol className="mt-2 space-y-1 text-[12px] leading-5 text-[#d8d1c2]">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-mono text-[10px] text-[#d4a017]">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
