"use client";

import { useMemo, useState } from "react";
import { menuConfig } from "@/lib/menu.config";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

type Selection =
  | { type: "special"; id: string }
  | { type: "custom" }
  | null;

type Customization = {
  base: string | null;
  milk: string;
  sweetener: string;
  temperature: string;
};

const emptyCustomization: Customization = {
  base: null,
  milk: "",
  sweetener: "",
  temperature: "",
};

const DRINK_EMOJI: Record<string, string> = {
  "Orange Blossom Latte": "🌸",
  "Rooh Afza Latte": "🌹",
  "Bee's Knees Matcha": "🍯",
  "Pumpkin Spice Latte": "🎃",
  "Brown Sugar Shaken Espresso": "🤎",
  "Carrot Cake Matcha": "🥕",
  "Peppermint Mocha Latte": "🍫",
  "Gingerbread Matcha": "🫚",
  "Tiramisu Latte": "🍰",
};

function drinkEmoji(name: string) {
  return DRINK_EMOJI[name] ?? "☕";
}

function seasonEmoji(season: string) {
  switch (season) {
    case "Spring":
      return "🌸";
    case "Fall":
      return "🍂";
    case "Winter":
      return "❄️";
    default:
      return "☕";
  }
}

function seasonBadgeLabel(season: string) {
  switch (season) {
    case "Spring":
      return "🌸 Spring Menu";
    case "Fall":
      return "🍂 Fall Menu";
    case "Winter":
      return "❄️ Winter Menu";
    default:
      return `${seasonEmoji(season)} ${season} Menu`;
  }
}

function seasonTagline(season: string) {
  switch (season) {
    case "Spring":
      return "Floral sips & fresh starts. ✨";
    case "Fall":
      return "Cozy drinks for golden days. 🍂";
    case "Winter":
      return "Warm up, it's that time. ❄️";
    default:
      return "Something delicious awaits. ☕";
  }
}

function tempBadge(temps: string[]) {
  const hasHot = temps.includes("Hot");
  const hasIced = temps.includes("Iced");
  if (hasHot && hasIced) return "H/I";
  if (hasHot) return "H";
  if (hasIced) return "I";
  return "";
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className="px-4 pt-4 pb-0 text-lg text-muted transition-colors hover:text-navy-mid"
    >
      ←
    </button>
  );
}

function StepDots({ step }: { step: Step }) {
  if (step === 1) return null;

  return (
    <div className="flex justify-center gap-2 px-4 pb-2 pt-1">
      {([1, 2, 3, 4, 5, 6] as Step[]).map((i) => (
        <span
          key={i}
          className={`rounded-full transition-all ${
            i < step
              ? "h-2 w-2 bg-forest"
              : i === step
                ? "h-2.5 w-2.5 bg-navy-mid"
                : "h-2 w-2 border border-border-light bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}

function StepHeader({
  step,
  onBack,
}: {
  step: Step;
  onBack: () => void;
}) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <StepDots step={step} />
    </div>
  );
}

function StickyNextBar({
  label = "Next →",
  disabled,
  onClick,
}: {
  label?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="sticky bottom-0 border-t border-border-light bg-soft-white px-4 py-4">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`w-full rounded-lg py-3.5 text-base font-medium transition-colors ${
          disabled
            ? "cursor-not-allowed bg-border-light text-muted"
            : "bg-navy text-cream hover:bg-navy-mid"
        }`}
      >
        {label}
      </button>
    </div>
  );
}

function OptionCard({
  label,
  selected,
  onClick,
  variant = "navy",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: "navy" | "forest";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-[72px] w-[90px] shrink-0 items-center justify-center rounded-[10px] border bg-white px-1 text-[13px] font-medium transition-colors ${
        selected
          ? variant === "forest"
            ? "border-2 border-forest bg-selected-forest text-navy"
            : "border-2 border-navy-mid bg-selected-navy text-navy"
          : "border-border-light text-navy hover:bg-gray-50"
      }`}
    >
      {selected && (
        <span
          className={`absolute right-1.5 top-1 text-[10px] font-bold ${
            variant === "forest" ? "text-forest" : "text-navy-mid"
          }`}
        >
          ✓
        </span>
      )}
      {label}
    </button>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
  variant = "navy",
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  variant?: "navy" | "forest";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <OptionCard
          key={opt}
          label={opt}
          selected={value === opt}
          onClick={() => onChange(opt)}
          variant={variant}
        />
      ))}
    </div>
  );
}

function SelectedCheck() {
  return (
    <span className="absolute right-3 top-3 text-sm font-bold text-navy-mid">
      ✓
    </span>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [selection, setSelection] = useState<Selection>(null);
  const [customization, setCustomization] =
    useState<Customization>(emptyCustomization);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  const selectedSpecial = useMemo(() => {
    if (selection?.type !== "special") return null;
    return menuConfig.specials.find((s) => s.id === selection.id) ?? null;
  }, [selection]);

  const drinkName = useMemo(() => {
    if (selection?.type === "special" && selectedSpecial) {
      return selectedSpecial.name;
    }
    if (selection?.type === "custom") return "Build Your Own";
    return "";
  }, [selection, selectedSpecial]);

  const drinkEmojiCurrent = drinkEmoji(drinkName);

  const drinkType = selection?.type === "custom" ? "custom" : "special";

  const temperatureOptions = useMemo(() => {
    if (selection?.type === "special" && selectedSpecial) {
      return selectedSpecial.temps;
    }
    return menuConfig.buildYourOwn.temperatures;
  }, [selection, selectedSpecial]);

  const customizeComplete = useMemo(() => {
    if (selection?.type === "custom") {
      return !!(customization.base && customization.temperature);
    }
    if (selection?.type === "special") {
      return !!(
        customization.milk &&
        customization.sweetener &&
        customization.temperature
      );
    }
    return false;
  }, [selection, customization]);

  function goBack() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  function goToCustomize() {
    if (selection?.type === "special" && selectedSpecial) {
      const d = selectedSpecial.defaults;
      setCustomization({
        base: d.base,
        milk: d.milk,
        sweetener: d.sweetener,
        temperature: d.temperature,
      });
    } else {
      setCustomization(emptyCustomization);
    }
    setStep(3);
  }

  function resetAll() {
    setStep(1);
    setSelection(null);
    setCustomization(emptyCustomization);
    setCustomerName("");
    setNotes("");
    setPlacing(false);
  }

  async function placeOrder() {
    if (!selection) return;
    setPlacing(true);
    try {
      const body = {
        customerName: customerName.trim(),
        drinkName,
        drinkType: drinkType as "special" | "custom",
        base:
          selection.type === "custom" ? customization.base : null,
        milk:
          selection.type === "custom"
            ? customization.milk || null
            : customization.milk,
        sweetener:
          selection.type === "custom"
            ? customization.sweetener || null
            : customization.sweetener,
        temperature: customization.temperature,
        notes: notes.trim() || null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to place order");
      setStep(6);
    } catch {
      alert("Could not place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  const recapParts = [
    customization.milk,
    customization.sweetener,
    customization.temperature,
  ];
  if (selection?.type === "custom" && customization.base) {
    recapParts.unshift(customization.base);
  }
  const recapLine = recapParts.filter(Boolean).join(" · ");

  const selectedCardClass = (selected: boolean) =>
    `relative w-full rounded-xl border p-4 text-left transition-colors ${
      selected
        ? "border-2 border-navy-mid bg-selected-navy"
        : "border border-border-light bg-white hover:bg-gray-50"
    }`;

  // Step 1 — Welcome
  if (step === 1) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-6 py-12">
        {/* Decorative florals */}
        <span
          className="pointer-events-none absolute left-6 top-16 select-none text-3xl opacity-50"
          aria-hidden
        >
          🌸
        </span>
        <span
          className="pointer-events-none absolute right-8 top-20 select-none text-4xl opacity-40"
          aria-hidden
        >
          🌿
        </span>
        <span
          className="pointer-events-none absolute bottom-28 left-10 select-none text-2xl opacity-60"
          aria-hidden
        >
          🌼
        </span>
        <span
          className="pointer-events-none absolute bottom-24 right-6 select-none text-3xl opacity-35"
          aria-hidden
        >
          🍃
        </span>
        <span
          className="pointer-events-none absolute left-[18%] top-[42%] select-none text-2xl opacity-45"
          aria-hidden
        >
          🌸
        </span>
        <span
          className="pointer-events-none absolute right-[30%] top-[38%] select-none text-xl opacity-55"
          aria-hidden
        >
          ✨
        </span>

        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="mb-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-cream">
            {seasonBadgeLabel(menuConfig.season)}
          </span>
          <h1 className="font-serif text-5xl font-medium text-cream sm:text-7xl">
            Cafe 303
          </h1>
          <div className="my-5 h-px w-16 bg-cream/30" />
          <p className="mb-6 max-w-xs text-base text-cream/80">
            {seasonTagline(menuConfig.season)}
          </p>

          <div className="mb-8 flex max-w-full flex-wrap justify-center gap-2 px-2 sm:flex-nowrap sm:overflow-x-auto sm:pb-1">
            {menuConfig.specials.map((special) => (
              <span
                key={special.id}
                className="pointer-events-none shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs text-cream"
              >
                {drinkEmoji(special.name)} {special.name}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="rounded-lg border border-cream/60 px-8 py-3 text-base font-medium text-cream transition-colors hover:border-cream hover:bg-cream/10"
          >
            Let&apos;s Order ✨
          </button>
        </div>
      </main>
    );
  }

  // Step 6 — Confirmation
  if (step === 6) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center">
        <p className="mb-6 text-4xl sm:text-5xl" aria-hidden>
          ☕ ✨ 🎉
        </p>
        <h1 className="mb-3 text-2xl font-semibold text-cream">
          {customerName.trim()}! You&apos;re all set.
        </h1>
        <p className="mb-8 max-w-xs text-base text-muted">
          We&apos;ll call your name when your drink is ready. Hang tight! 🌿
        </p>
        <div className="mb-10 max-w-sm text-sm text-muted">
          <p className="font-medium text-cream/90">
            {drinkEmojiCurrent} {drinkName}
          </p>
          <p>{recapLine}</p>
          {notes.trim() && (
            <p className="mt-1 italic">&ldquo;{notes.trim()}&rdquo;</p>
          )}
        </div>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-lg border border-cream/60 px-8 py-3 text-base font-medium text-cream transition-colors hover:border-cream hover:bg-cream/10"
        >
          Order another round? ☕
        </button>
      </main>
    );
  }

  // Steps 2–5 — shared shell with back + dots + scrollable content
  return (
    <div className="flex min-h-screen flex-col bg-soft-white">
      <StepHeader step={step} onBack={goBack} />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Step 2 — Menu Browse */}
        {step === 2 && (
          <>
            <h2 className="mb-4 text-base font-semibold text-navy">
              This season&apos;s favorites {seasonEmoji(menuConfig.season)}
            </h2>
            <div className="space-y-3">
              {menuConfig.specials.map((special) => {
                const selected =
                  selection?.type === "special" &&
                  selection.id === special.id;
                return (
                  <button
                    key={special.id}
                    type="button"
                    onClick={() =>
                      setSelection({ type: "special", id: special.id })
                    }
                    className={selectedCardClass(selected)}
                  >
                    {selected && <SelectedCheck />}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-navy">
                          {drinkEmoji(special.name)} {special.name}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {special.description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-navy/10 px-2 py-0.5 text-xs font-semibold text-navy-mid">
                        {tempBadge(special.temps)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="my-6 border-t border-border-light" />

            <p className="mb-3 text-sm font-medium text-muted">
              Or craft your own ✏️
            </p>
            <button
              type="button"
              onClick={() => setSelection({ type: "custom" })}
              className={selectedCardClass(selection?.type === "custom")}
            >
              {selection?.type === "custom" && <SelectedCheck />}
              <p className="text-lg font-bold text-navy">Build Your Own</p>
              <p className="mt-1 text-sm text-muted">
                You&apos;re the barista. Pick your base, milk & sweetener. 🎨
              </p>
            </button>
          </>
        )}

        {/* Step 3 — Customize */}
        {step === 3 && (
          <>
            <h2 className="mb-1 text-2xl font-bold text-navy">
              {selection?.type === "custom"
                ? "Let's build something good. 🎨"
                : drinkName}
            </h2>
            {selection?.type === "special" && (
              <p className="mb-6 text-sm text-muted">
                Tweaked from the defaults — make it yours. 👇
              </p>
            )}
            {selection?.type === "custom" && <div className="mb-6" />}

            <div className="space-y-6">
              {selection?.type === "custom" && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy">
                    Base ☕
                  </h3>
                  <OptionGrid
                    options={menuConfig.buildYourOwn.bases}
                    value={customization.base ?? ""}
                    onChange={(base) =>
                      setCustomization((c) => ({ ...c, base }))
                    }
                  />
                </section>
              )}

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy">
                  Milk 🥛
                </h3>
                <OptionGrid
                  options={menuConfig.buildYourOwn.milks}
                  value={customization.milk}
                  onChange={(milk) =>
                    setCustomization((c) => ({
                      ...c,
                      milk:
                        selection?.type === "custom" && c.milk === milk
                          ? ""
                          : milk,
                    }))
                  }
                />
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy">
                  Sweetener 🍯
                </h3>
                <OptionGrid
                  options={menuConfig.buildYourOwn.sweeteners}
                  value={customization.sweetener}
                  onChange={(sweetener) =>
                    setCustomization((c) => ({
                      ...c,
                      sweetener:
                        selection?.type === "custom" &&
                        c.sweetener === sweetener
                          ? ""
                          : sweetener,
                    }))
                  }
                  variant="forest"
                />
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy">
                  Temp 🌡️
                </h3>
                <OptionGrid
                  options={temperatureOptions}
                  value={customization.temperature}
                  onChange={(temperature) =>
                    setCustomization((c) => ({ ...c, temperature }))
                  }
                />
              </section>
            </div>
          </>
        )}

        {/* Step 4 — Your Details */}
        {step === 4 && (
          <div className="space-y-6 pt-2">
            <h2 className="text-2xl font-bold text-navy">Almost there! 🎉</h2>
            <div>
              <label
                htmlFor="customerName"
                className="mb-2 block text-sm font-medium text-navy"
              >
                Your name ✍️
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="What do we write on the cup?"
                className="w-full rounded-lg border border-border-light bg-white px-4 py-3 text-navy outline-none placeholder:text-muted focus:ring-2 focus:ring-navy-mid"
              />
            </div>
            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium text-navy"
              >
                Notes for your barista 💬
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Light ice, extra sweet, oat milk instead... you're the boss ☕"
                className="w-full resize-none rounded-lg border border-border-light bg-white px-4 py-3 text-navy outline-none placeholder:text-muted focus:ring-2 focus:ring-navy-mid"
              />
            </div>
          </div>
        )}

        {/* Step 5 — Review */}
        {step === 5 && (
          <>
            <h2 className="mb-6 text-2xl font-bold text-navy">
              Looking good! 👀
            </h2>
            <div className="rounded-xl border border-border-light bg-white p-5">
              <p className="text-2xl font-semibold text-navy">
                {customerName.trim()}
              </p>
              <p className="mt-2 text-lg font-bold text-navy">
                {drinkEmojiCurrent} {drinkName}
              </p>
              <p className="mt-3 text-sm text-navy">
                {[
                  selection?.type === "custom" ? customization.base : null,
                  customization.milk || null,
                  customization.sweetener || null,
                  customization.temperature,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {notes.trim() && (
                <p className="mt-3 text-sm italic text-muted">
                  {notes.trim()}
                </p>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg border border-navy-mid py-3.5 text-base font-medium text-navy-mid transition-colors hover:bg-selected-navy"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={placing}
                onClick={placeOrder}
                className="flex-1 rounded-lg bg-navy py-3.5 text-base font-medium text-cream transition-colors hover:bg-navy-mid disabled:opacity-60"
              >
                {placing ? "Placing…" : "Place Order ☕ →"}
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              Your drink is on us — no payment needed. 🎁
            </p>
          </>
        )}
      </div>

      {step === 2 && (
        <StickyNextBar
          disabled={!selection}
          onClick={goToCustomize}
        />
      )}
      {step === 3 && (
        <StickyNextBar
          disabled={!customizeComplete}
          onClick={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <StickyNextBar
          disabled={!customerName.trim()}
          onClick={() => setStep(5)}
        />
      )}
    </div>
  );
}
