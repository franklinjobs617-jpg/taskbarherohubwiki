import type { Locale } from "./data";

type FaqMap = Partial<Record<Locale, Array<{ q: string; a: string }>>>;

/** FAQ content by entity type. Used by FaqBlock on detail pages. */
export const entityFaqs: Record<string, FaqMap> = {
  items: {
    en: [
      { q: "How do I find what drops this item?", a: "Use the Drop Finder tool or check the \"Drop Sources\" section on this page to see which stages and chests can drop this item." },
      { q: "Can I buy this item on the Steam Market?", a: "If the item is marked as \"tradable\", it may be available on the Steam Community Market. Check the Market section for current prices." },
      { q: "What grade is this item?", a: "Item grades range from COMMON to COSMIC. Higher grade items have better base stats and can appear at higher gear levels." },
      { q: "Which hero can equip this?", a: "Each gear type is restricted to specific heroes. Check the \"Suitable Heroes\" section to see which classes can equip this item type." },
    ],
    zh: [
      { q: "怎么查这个物品的掉落来源？", a: "使用掉落查询工具或查看本页的「掉落来源」部分，可以看到哪些关卡和宝箱会掉落此物品。" },
      { q: "能在 Steam 市场买到吗？", a: "如果物品标记为「可交易」，则可能在 Steam 社区市场上架。查看市场部分获取当前价格。" },
      { q: "这个物品是什么品级？", a: "物品品级从 COMMON 到 COSMIC。更高品级的物品有更好的基础属性，可以在更高装备等级获得。" },
      { q: "哪个英雄能装备？", a: "每种装备类型只限特定英雄使用。查看「适用英雄」部分了解哪些职业可以使用这类装备。" },
    ],
    ja: [
      { q: "このアイテムのドロップ元を調べるには？", a: "ドロップ検索ツールを使うか、このページの「ドロップソース」セクションでどのステージや宝箱から入手できるか確認してください。" },
      { q: "Steamマーケットで購入できますか？", a: "アイテムが「取引可能」と表示されている場合、Steamコミュニティマーケットで入手できる可能性があります。マーケットセクションで現在の価格を確認してください。" },
      { q: "このアイテムのグレードは？", a: "アイテムのグレードはCOMMONからCOSMICまであります。より高いグレードのアイテムは基本ステータスが高く、より高い装備レベルで入手できます。" },
      { q: "どのヒーローが装備できますか？", a: "各装備タイプは特定のヒーローに制限されています。「適正ヒーロー」セクションでどのクラスがこの装備タイプを使用できるか確認してください。" },
    ],
  },
  heroes: {
    en: [
      { q: "Which hero should I pick first?", a: "Knight is the most beginner-friendly choice due to high survivability. Ranger and Sorcerer are good if you prefer ranged gameplay." },
      { q: "What weapon does this hero use?", a: "Each hero uses a main-hand and off-hand weapon type. Check the weapon icons on this page for specific gear types." },
      { q: "What build is best for this hero?", a: "Check the Builds section on this page for recommended builds by phase (early/mid/endgame) and goal (farming/boss/survival)." },
      { q: "Is this hero DLC-only?", a: "Hunter (Crossbow) and Slayer (Axe) are DLC heroes. Knight, Ranger, Sorcerer, and Priest are available in the base game." },
    ],
    zh: [
      { q: "新手第一个英雄选谁？", a: "骑士是最友好的新手选择，生存能力强。游侠和法师适合喜欢远程玩法的玩家。" },
      { q: "这个英雄用什么武器？", a: "每个英雄使用主手和副手两种武器。查看本页武器图标了解具体装备类型。" },
      { q: "这个英雄最强配装是什么？", a: "查看本页 Build 部分，按阶段（前期/中期/后期）和目标（刷图/Boss/生存）筛选推荐配装。" },
      { q: "这个英雄是 DLC 专属吗？", a: "猎人（十字弩）和狂战（战斧）是 DLC 英雄。骑士、游侠、法师、祭司是基础免费英雄。" },
    ],
    ja: [
      { q: "最初にどのヒーローを選ぶべき？", a: "ナイトは生存力が高く、初心者に最も優しい選択です。遠距離プレイが好みならレンジャーかソーサラーがおすすめです。" },
      { q: "このヒーローの武器は？", a: "各ヒーローはメイン武器とサブ武器を使用します。このページの武器アイコンで具体的な装備タイプを確認してください。" },
      { q: "このヒーローの最強ビルドは？", a: "このページのビルドセクションで、フェーズ別（序盤/中盤/終盤）と目標別（周回/ボス/生存）のおすすめビルドを確認してください。" },
      { q: "このヒーローはDLC限定？", a: "ハンター（クロスボウ）とスレイヤー（斧）はDLCヒーローです。ナイト、レンジャー、ソーサラー、プリーストは基本ゲームで利用可能です。" },
    ],
  },
  monsters: {
    en: [
      { q: "Where can I find this monster?", a: "Check the \"Appears in Stages\" section to see every stage where this monster spawns, including difficulty and spawn count." },
      { q: "What does this monster drop?", a: "The \"Drops\" section lists all items and equipment this monster can drop, along with drop rates where available." },
      { q: "What is the best stage to farm this monster?", a: "Use the Farming Compare tool to find the stage with the highest spawn density for this monster." },
    ],
    zh: [
      { q: "这个怪物在哪里出现？", a: "查看「出现关卡」部分，了解该怪物在所有关卡中的出现情况，包括难度和数量。" },
      { q: "这个怪物掉什么？", a: "「掉落」部分列出了该怪物可能掉落的所有物品和装备，以及已知的掉落概率。" },
      { q: "刷这个怪物去哪个关卡最好？", a: "使用刷图对比工具，找到该怪物密度最高的关卡。" },
    ],
    ja: [
      { q: "このモンスターはどこに出現しますか？", a: "「出現ステージ」セクションで、このモンスターが出現する全ステージを難易度と出現数とともに確認できます。" },
      { q: "このモンスターは何をドロップしますか？", a: "「ドロップ」セクションに、このモンスターがドロップする全アイテムと装備がドロップ率とともに表示されます。" },
      { q: "このモンスターを狩るのに最適なステージは？", a: "周回比較ツールを使って、このモンスターの出現密度が最も高いステージを見つけてください。" },
    ],
  },
  stages: {
    en: [
      { q: "What difficulty should I farm?", a: "Higher difficulties give more gold and EXP but enemies have more HP. Use the Farming Calculator to compare efficiency." },
      { q: "What chests drop in this stage?", a: "Check the \"Chests\" section to see which chests are dropped by monsters and the boss in this stage." },
      { q: "What is the boss of this stage?", a: "Boss information including HP, attack patterns, and special drops is listed in the \"Boss\" section." },
    ],
    zh: [
      { q: "应该刷哪个难度？", a: "更高难度给更多金币和经验，但敌人血量也更高。使用刷图计算器对比效率。" },
      { q: "这个关卡掉什么宝箱？", a: "查看「宝箱」部分，了解该关卡怪物和 Boss 掉落的宝箱类型。" },
      { q: "这个关卡的 Boss 是什么？", a: "Boss 信息（包括血量、攻击模式和特殊掉落）列在「Boss」部分。" },
    ],
    ja: [
      { q: "どの難易度を周回すべき？", a: "高い難易度ほど多くのゴールドとEXPを得られますが、敵のHPも増加します。周回計算機で効率を比較してください。" },
      { q: "このステージでどの宝箱がドロップしますか？", a: "「宝箱」セクションで、モンスターとボスがドロップする宝箱を確認できます。" },
      { q: "このステージのボスは？", a: "ボス情報（HP、攻撃パターン、特殊ドロップ）は「ボス」セクションに表示されています。" },
    ],
  },
  chests: {
    en: [
      { q: "What can I get from this chest?", a: "The contents table shows all items that can drop from this chest, with individual drop rates where available." },
      { q: "Where does this chest drop?", a: "Check the drop sources section to see which stages and monsters drop this chest." },
      { q: "Should I open or sell this chest?", a: "Use the Drop Finder to check the expected value of the chest contents vs current market price." },
    ],
    zh: [
      { q: "这个宝箱能开出什么？", a: "内容表显示了该宝箱可能掉落的全部物品及单件掉落概率。" },
      { q: "这个宝箱在哪里掉落？", a: "查看掉落来源部分，了解哪些关卡和怪物会掉落该宝箱。" },
      { q: "这个宝箱该开还是该卖？", a: "使用掉落查询工具对比宝箱内容的期望价值和当前市场价。" },
    ],
    ja: [
      { q: "この宝箱から何が出ますか？", a: "内容テーブルに、この宝箱からドロップする全アイテムと個別のドロップ率が表示されています。" },
      { q: "この宝箱はどこでドロップしますか？", a: "ドロップソースセクションで、どのステージとモンスターがこの宝箱をドロップするか確認できます。" },
      { q: "この宝箱は開けるべき？売るべき？", a: "ドロップ検索ツールで宝箱内容の期待値と現在の市場価格を比較してください。" },
    ],
  },
  builds: {
    en: [
      { q: "Is this build good for beginners?", a: "Builds marked as 'early' phase with 'survival' or 'farming' goal are best for new players." },
      { q: "What gear should I use?", a: "The recommended gear table lists specific items for each equipment slot with explanations." },
      { q: "What is the evidence level?", a: "Evidence levels: Datamined (game data), Community Verified (tested by players), Editorial (curated by our team), Unverified (theoretical)." },
    ],
    zh: [
      { q: "这个 Build 适合新手吗？", a: "标记为「前期」阶段且目标为「生存」或「刷图」的 Build 最适合新手。" },
      { q: "该用什么装备？", a: "推荐装备表列出了每个装备槽的具体物品推荐及理由。" },
      { q: "证据等级是什么意思？", a: "证据等级：数据挖掘（游戏数据）、社区验证（玩家实测）、编辑整理（团队策划）、待验证（理论推导）。" },
    ],
    ja: [
      { q: "このビルドは初心者向けですか？", a: "「序盤」フェーズで「生存」または「周回」目標のビルドが初心者に最適です。" },
      { q: "どの装備を使うべき？", a: "推奨装備テーブルに各スロットの具体的なアイテムと推奨理由が記載されています。" },
      { q: "証拠レベルとは？", a: "証拠レベル: データ抽出（ゲームデータ）、コミュニティ検証済み（プレイヤー実測）、編集部（チーム厳選）、未検証（理論値）。" },
    ],
  },
};

/** FAQ for the main FAQ page */
export const siteFaqs: Partial<Record<Locale, Array<{ q: string; a: string }>>> = {
  en: [
    { q: "What is this site?", a: "TBH Guide is a community-built wiki and database for TBH: Task Bar Hero. We provide item databases, build guides, farming calculators, and Steam Market price tracking." },
    { q: "How do I search for items?", a: "Use the search bar on any page or visit the Items database. You can filter by type, slot, level, rarity, and more." },
    { q: "Where do builds come from?", a: "Builds are curated by our editorial team and community contributors. Each build includes an evidence level so you know how reliable it is." },
    { q: "Are market prices real-time?", a: "Steam Market prices are refreshed every 15 minutes. They are reference prices only — actual execution prices may vary." },
    { q: "Is this site affiliated with the game developers?", a: "No. This is a fan-made community site and is not affiliated with or endorsed by the TBH: Task Bar Hero developers." },
  ],
  zh: [
    { q: "这个网站是什么？", a: "TBH 攻略站是 TBH: Task Bar Hero 的社区 Wiki 和数据库。提供物品数据、配装攻略、刷图计算器和 Steam 市场价格追踪。" },
    { q: "怎么搜索物品？", a: "使用任意页面的搜索框或访问物品数据库。可以按类型、装备槽、等级、稀有度等条件筛选。" },
    { q: "Build 配装来源是什么？", a: "Build 由编辑团队和社区贡献者策划。每个 Build 都有证据等级标注，让你了解其可靠程度。" },
    { q: "市场价格是实时的吗？", a: "Steam 市场价格每 15 分钟刷新一次。仅作参考，实际成交价可能有差异。" },
    { q: "本站和游戏开发商有关系吗？", a: "没有。本站为玩家自制社区站点，与 TBH: Task Bar Hero 开发商无关，也未被其认可。" },
  ],
  ja: [
    { q: "このサイトは何ですか？", a: "TBHガイドはTBH: Task Bar HeroのコミュニティWiki＆データベースです。アイテムデータ、ビルドガイド、周回計算機、Steam市場価格追跡を提供しています。" },
    { q: "アイテムを検索するには？", a: "各ページの検索バーを使うか、アイテムデータベースにアクセスしてください。タイプ、スロット、レベル、レアリティなどでフィルタリングできます。" },
    { q: "ビルドの出典は？", a: "ビルドは編集チームとコミュニティ貢献者によって厳選されています。各ビルドには証拠レベルが付いており、信頼性がわかります。" },
    { q: "市場価格はリアルタイムですか？", a: "Steam市場価格は15分ごとに更新されます。参考価格であり、実際の約定価格とは異なる場合があります。" },
    { q: "このサイトはゲーム開発元と関係がありますか？", a: "いいえ。これはファンメイドのコミュニティサイトであり、TBH: Task Bar Heroの開発元とは提携・承認されていません。" },
  ],
};
