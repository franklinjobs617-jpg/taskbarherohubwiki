import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Coins, Route, Sparkles, Swords, Trophy, Zap } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allStages, stageName, stageSlug, text, type Locale, type Stage } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

type ActGroup = {
  act: number;
  stages: Stage[];
  levelRange: string;
  bossCount: number;
  image: string;
};

const difficultyTone: Record<string, string> = {
  NORMAL: "from-[#1b2618] via-[#11140e] to-[#080807]",
  NIGHTMARE: "from-[#241820] via-[#141016] to-[#080708]",
  TORMENT: "from-[#261b10] via-[#16100a] to-[#080706]",
};

const actImages = [
  "/game/screenshots/screenshot-1.jpg",
  "/game/screenshots/screenshot-4.jpg",
  "/game/screenshots/screenshot-7.jpg",
  "/game/screenshots/screenshot-10.jpg",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = copy(
    locale,
    "TaskBar Hero 关卡地图｜怪物、Boss 与刷图路线",
    "TaskBar Hero Stage Map | Bosses, Acts & Farming Routes",
    "TaskBar Hero ステージマップ｜ボス、Act、周回ルート",
  );

  const description = copy(
    locale,
    "按难度和 Act 浏览全部关卡，查看等级、Boss、金币、经验和刷图入口。",
    "Browse every stage by difficulty and Act, with level, boss, gold, EXP, and farming links.",
    "難易度とAct別にステージを確認し、レベル、ボス、ゴールド、経験値、周回導線を見られます。",
  );

  return { title, description, alternates: pageAlternates(locale, "/map") };
}

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  const stages = allStages().sort((a, b) => a.key - b.key);
  const difficulties = Array.from(new Set(stages.map((stage) => stage.difficulty)));
  const highestLevel = Math.max(...stages.map((stage) => stage.level));
  const bossStages = stages.filter((stage) => isBossStage(stage));
  const actsCount = new Set(stages.map((stage) => `${stage.difficulty}-${stage.act}`)).size;

  return (
    <PageShell>
      <PageHeader
        kicker={copy(locale, "Stage route", "Stage route", "Stage route")}
        title={copy(locale, "关卡路线图", "Stage Map", "ステージマップ")}
        description={copy(
          locale,
          "从难度、Act、Boss 和基础收益四个维度找关卡。先看路线，再进详情页确认掉落与刷取价值。",
          "Find stages by difficulty, Act, boss, and base rewards. Scan the route first, then open details for drops and farming value.",
          "難易度、Act、ボス、基本報酬からステージを探せます。まずルートを見て、詳細ページでドロップと周回価値を確認します。",
        )}
      />

      <section className="mb-8 overflow-hidden border border-[#2d281e] bg-[#0c0b08]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[320px] overflow-hidden p-5 sm:p-7">
            <Image
              src="/game/screenshots/screenshot-10.jpg"
              alt=""
              fill
              className="object-cover opacity-28 saturate-125"
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#0c0b08_0%,rgba(12,11,8,0.82)_42%,rgba(12,11,8,0.35)_100%)]" />
            <div className="relative max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c87925]">
                {copy(locale, "Map overview", "Map overview", "Map overview")}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#fff7df] sm:text-4xl">
                {copy(locale, "先选难度，再沿 Act 路线找目标关卡", "Pick a difficulty, then follow the Act route", "難易度を選び、Actルートをたどる")}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#c9bda6]">
                {copy(
                  locale,
                  "地图页不是普通列表。这里按推进顺序展示关卡，并把 Boss、等级、金币、经验和刷图工具入口放在同一视线里。",
                  "This is not a plain list. Stages are ordered by progression, with boss, level, gold, EXP, and farming tools kept in one scan path.",
                  "単なる一覧ではありません。進行順に並べ、ボス、レベル、ゴールド、経験値、周回ツールを同じ視線で確認できます。",
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/${locale}/tools/farming-compare`} className="inline-flex items-center gap-2 border border-[#c87925] bg-[#c87925] px-4 py-2 text-sm font-semibold text-[#120d06] transition hover:bg-[#e0a64a]">
                  {copy(locale, "对比刷图收益", "Compare farming routes", "周回効率を比較")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/${locale}/chests`} className="inline-flex items-center gap-2 border border-[#4a3b24] bg-[#15100a]/80 px-4 py-2 text-sm font-semibold text-[#f3dfb8] transition hover:border-[#c87925]">
                  {copy(locale, "查看宝箱", "View chests", "宝箱を見る")}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px border-t border-[#2d281e] bg-[#2d281e] lg:border-l lg:border-t-0">
            <OverviewStat icon={<Route className="h-4 w-4" />} label={copy(locale, "关卡", "Stages", "ステージ")} value={stages.length} />
            <OverviewStat icon={<Sparkles className="h-4 w-4" />} label={copy(locale, "难度", "Difficulties", "難易度")} value={difficulties.length} />
            <OverviewStat icon={<Boxes className="h-4 w-4" />} label="Act" value={actsCount} />
            <OverviewStat icon={<Trophy className="h-4 w-4" />} label={copy(locale, "最高等级", "Max level", "最高Lv")} value={`Lv.${highestLevel}`} />
          </div>
        </div>
      </section>

      <div className="space-y-10">
        {difficulties.map((difficulty, index) => {
          const rows = stages.filter((stage) => stage.difficulty === difficulty);
          const acts = groupActs(rows, index);
          return (
            <DifficultyMap
              key={difficulty}
              locale={locale}
              difficulty={difficulty}
              stages={rows}
              acts={acts}
              bossStages={bossStages.filter((stage) => stage.difficulty === difficulty).length}
            />
          );
        })}
      </div>
    </PageShell>
  );
}

function DifficultyMap({
  locale,
  difficulty,
  stages,
  acts,
  bossStages,
}: {
  locale: Locale;
  difficulty: string;
  stages: Stage[];
  acts: ActGroup[];
  bossStages: number;
}) {
  return (
    <section className={`overflow-hidden border border-[#2d281e] bg-gradient-to-br ${difficultyTone[difficulty] ?? "from-[#171717] to-[#080808]"}`}>
      <div className="flex flex-col gap-4 border-b border-[#2d281e] bg-[#090806]/72 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-[#c87925]/70 bg-[#211408] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ffce7a]">
              {difficultyLabel(difficulty, locale)}
            </span>
            <span className="text-xs text-[#887b65]">{levelRange(stages)}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-[#fff7df]">
            {copy(locale, "推进路线", "Progression route", "進行ルート")}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
          <MiniStat label={copy(locale, "关卡", "Stages", "ステージ")} value={stages.length} />
          <MiniStat label="Act" value={acts.length} />
          <MiniStat label="Boss" value={bossStages} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[980px] grid-flow-col auto-cols-[320px] gap-4 p-4 sm:auto-cols-[360px] sm:p-5">
          {acts.map((act) => (
            <ActColumn key={`${difficulty}-${act.act}`} locale={locale} act={act} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ActColumn({ locale, act }: { locale: Locale; act: ActGroup }) {
  const mainBoss = act.stages.find(isBossStage) ?? act.stages.at(-1);
  const bossName = mainBoss?.boss?.name ? text(mainBoss.boss.name, locale, "Boss") : "Boss";

  return (
    <div className="relative overflow-hidden border border-[#342a1a] bg-[#0c0b08]/88">
      <div className="relative h-32 overflow-hidden border-b border-[#342a1a]">
        <Image src={act.image} alt="" fill sizes="360px" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b08] via-[#0c0b08]/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d49b45]">Act {act.act}</p>
              <h3 className="mt-1 text-lg font-semibold text-[#fff7df]">{act.levelRange}</h3>
            </div>
            <div className="rounded-full border border-[#5a4324] bg-[#130e08]/90 px-3 py-1 text-xs font-semibold text-[#f0c040]">
              {act.stages.length} {copy(locale, "关", "stages", "面")}
            </div>
          </div>
          <p className="mt-2 truncate text-xs text-[#c9bda6]">
            {copy(locale, "最终 Boss", "Final boss", "最終ボス")}: {bossName}
          </p>
        </div>
      </div>

      <div className="relative space-y-3 p-3">
        <div className="absolute bottom-8 left-[27px] top-7 w-px bg-gradient-to-b from-[#c87925] via-[#7f5a2c] to-transparent" />
        {act.stages.map((stage) => (
          <StageNode key={stage.key} stage={stage} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function StageNode({ stage, locale }: { stage: Stage; locale: Locale }) {
  const boss = isBossStage(stage);
  const bossName = stage.boss?.name ? text(stage.boss.name, locale, "Boss") : "Boss";

  return (
    <Link
      href={`/${locale}/stages/${stageSlug(stage)}`}
      className={`group relative grid grid-cols-[40px_1fr] gap-3 border p-3 transition hover:-translate-y-0.5 ${
        boss
          ? "border-[#c87925]/70 bg-[#1a1107] shadow-[0_0_0_1px_rgba(200,121,37,0.18)]"
          : "border-[#2b251b] bg-[#11100d]/94 hover:border-[#8a6736]"
      }`}
    >
      <div className={`relative z-10 flex h-10 w-10 items-center justify-center border text-sm font-semibold ${
        boss ? "border-[#f0c040] bg-[#c87925] text-[#130e08]" : "border-[#4d422f] bg-[#19150f] text-[#f3dfb8]"
      }`}>
        {stage.no}
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#fff7df] group-hover:text-[#f0c040]">
              {stageName(stage, locale)}
            </p>
            <p className="mt-1 truncate text-[11px] text-[#8d806d]">
              Lv.{stage.level} / {typeLabel(stage.type, locale)}
            </p>
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#7b6c55] transition group-hover:translate-x-0.5 group-hover:text-[#f0c040]" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <NodeStat icon={<Coins className="h-3.5 w-3.5" />} value={formatNumber(stage.goldPerClear)} />
          <NodeStat icon={<Zap className="h-3.5 w-3.5" />} value={formatNumber(stage.expPerClear)} />
          <NodeStat icon={<Swords className="h-3.5 w-3.5" />} value={formatNumber(stage.kills)} />
        </div>

        {boss ? (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#3b2a16] pt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#ffce7a]">
              <Trophy className="h-3.5 w-3.5" />
              Boss
            </span>
            <span className="truncate text-right text-[11px] text-[#c9bda6]">{bossName}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function OverviewStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-[#0f0d09] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs text-[#8d806d]">
        <span className="text-[#c87925]">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#fff7df]">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[#342a1a] bg-[#0f0d09] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#7b6c55]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#fff7df]">{value}</p>
    </div>
  );
}

function NodeStat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex min-w-0 items-center justify-center gap-1 border border-[#2d281e] bg-[#0c0b08] px-1.5 py-1 text-[11px] text-[#c9bda6]">
      <span className="text-[#9b7a42]">{icon}</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

function groupActs(stages: Stage[], difficultyIndex: number): ActGroup[] {
  const acts = new Map<number, Stage[]>();
  stages.forEach((stage) => {
    const current = acts.get(stage.act) ?? [];
    current.push(stage);
    acts.set(stage.act, current);
  });

  return Array.from(acts.entries()).map(([act, rows], index) => {
    const sorted = rows.sort((a, b) => a.no - b.no);
    return {
      act,
      stages: sorted,
      levelRange: levelRange(sorted),
      bossCount: sorted.filter(isBossStage).length,
      image: actImages[(difficultyIndex + index) % actImages.length],
    };
  });
}

function levelRange(stages: Stage[]) {
  const levels = stages.map((stage) => stage.level);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  return min === max ? `Lv.${min}` : `Lv.${min}-${max}`;
}

function isBossStage(stage: Stage) {
  return stage.type === "ACTBOSS" || Boolean(stage.boss && stage.no === 10);
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number") return "-";
  return new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function difficultyLabel(value: string, locale: Locale) {
  const labels: Record<string, Record<Locale, string>> = {
    NORMAL: { zh: "普通", en: "Normal", ja: "通常" },
    NIGHTMARE: { zh: "噩梦", en: "Nightmare", ja: "ナイトメア" },
    TORMENT: { zh: "折磨", en: "Torment", ja: "トーメント" },
  };
  return labels[value]?.[locale] ?? value;
}

function typeLabel(value: string, locale: Locale) {
  if (value === "ACTBOSS") return copy(locale, "Boss 关", "Boss stage", "ボス戦");
  return copy(locale, "普通关", "Normal stage", "通常ステージ");
}

function copy(locale: Locale, zh: string, en: string, ja: string) {
  if (locale === "zh") return zh;
  if (locale === "ja") return ja;
  return en;
}
