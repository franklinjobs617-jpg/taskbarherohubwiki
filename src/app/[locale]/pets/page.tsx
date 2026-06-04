import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Skull, Star, Swords } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { extPets, type ExtPet } from "@/lib/game-data/external";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 宠物解锁｜条件、属性与最佳刷取关卡" : "TaskBar Hero Pets — Unlock Conditions, Stats & Best Stages",
    description: locale === "zh"
      ? "全部宠物的解锁条件、属性加成、推荐刷取关卡和击杀需求。包含免费宠物和 DLC 宠物。"
      : "All pets with unlock conditions, stat bonuses, recommended farming stages, and kill requirements. Free and DLC pets included.",
    alternates: pageAlternates(locale, "/pets"),
  };
}

export default async function PetsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const pets = extPets();
  const freePets = pets.filter((p) => !p.dlc);
  const dlcPets = pets.filter((p) => p.dlc);

  return (
    <PageShell>
      <PageHeader
        kicker="Pets"
        title={isZh ? "宠物解锁路线" : "Pet Unlock Routes"}
        description={isZh
          ? "每种宠物的解锁条件、属性加成和最佳刷取关卡。被动属性可叠加。"
          : "Unlock conditions, stat bonuses, and best farming stages for every pet. Passive stats stack."}
      />

      {/* ── Free Pets ── */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-[#f6e8c8]">
          {isZh ? `免费宠物 (${freePets.length})` : `Free Pets (${freePets.length})`}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freePets.map((pet) => <PetCard key={pet.key} pet={pet} locale={locale} isZh={isZh} />)}
        </div>
      </section>

      {/* ── DLC Pets ── */}
      {dlcPets.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#f6e8c8]">
            {isZh ? `DLC 宠物 (${dlcPets.length})` : `DLC Pets (${dlcPets.length})`}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dlcPets.map((pet) => <PetCard key={pet.key} pet={pet} locale={locale} isZh={isZh} />)}
          </div>
        </section>
      )}
    </PageShell>
  );
}

function PetCard({ pet, locale, isZh }: { pet: ExtPet; locale: Locale; isZh: boolean }) {
  return (
    <div className={`border bg-[#0d0d0d] p-5 ${pet.dlc ? "border-[#5a3a1a]" : "border-[#27272a]"}`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[#27272a] bg-[#0a0a0a]">
          <Image src={`/game/pets/${pet.icon}.png`} alt={pet.name} width={40} height={40} className="object-contain" data-pixel unoptimized />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#f1e8d5]">{pet.name}</h3>
            {pet.dlc && (
              <span className="rounded-full border border-[#5a3a1a] bg-[#1b1206] px-2 py-0.5 text-[10px] font-semibold text-[#f0c040]">DLC</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 space-y-1.5">
        {pet.stats.map((s) => (
          <div key={s.stat} className="flex items-center justify-between text-sm">
            <span className="text-[#9d9d9d]">{s.label}</span>
            <span className="font-semibold text-[#62d394]">{s.disp}</span>
          </div>
        ))}
      </div>

      {/* Unlock info */}
      <div className="mt-4 border-t border-[#27272a] pt-4">
        {pet.unlock.type === "KillMonster" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Skull className="h-4 w-4 text-[#d4a017]" />
              <span className="text-[#9d9d9d]">
                {isZh ? `击杀 ${pet.unlock.monsterName ?? "?"}` : `Kill ${pet.unlock.monsterName ?? "?"}`}
              </span>
              <span className="font-semibold text-[#f0c040]">×{(pet.unlock.count ?? 0).toLocaleString()}</span>
            </div>
            {pet.unlock.farm && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-[#ff6b6b]" />
                  <span className="text-[#9d9d9d]">{isZh ? "推荐关卡" : "Best stage"}:</span>
                  <Link
                    href={`/${locale}/stages/${pet.unlock.farm.label.toLowerCase().replace(".", "-")}`}
                    className="font-semibold text-[#f0c040] hover:underline"
                  >
                    {pet.unlock.farm.label} {pet.unlock.farm.stageName}
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6c6c6c]">
                  <Swords className="h-3 w-3" />
                  <span>
                    {isZh
                      ? `${pet.unlock.farm.share}% 占比 · 权重 ${pet.unlock.farm.weight} · 另有 ${pet.unlock.farm.alsoIn} 个关卡`
                      : `${pet.unlock.farm.share}% share · weight ${pet.unlock.farm.weight} · ${pet.unlock.farm.alsoIn} other stages`}
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-[#f0c040]" />
            <span className="text-[#9d9d9d]">
              {isZh ? `解锁方式：${pet.unlock.note ?? "DLC"}` : `Unlock: ${pet.unlock.note ?? "DLC"}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
