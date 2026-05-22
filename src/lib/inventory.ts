export type Inventory = {
  specials: Record<string, boolean>;
  bases: Record<string, boolean>;
  milks: Record<string, boolean>;
  sweeteners: Record<string, boolean>;
  temperatures: Record<string, boolean>;
};

export const emptyInventory: Inventory = {
  specials: {},
  bases: {},
  milks: {},
  sweeteners: {},
  temperatures: {},
};

export function isSpecialSoldOut(
  special: {
    id: string;
    temps: string[];
    defaults: { base: string; sweetener: string };
  },
  inventory: Inventory
): { soldOut: boolean; reason: string | null } {
  if (inventory.specials[special.id])
    return { soldOut: true, reason: "manual" };
  if (inventory.sweeteners[special.defaults.sweetener])
    return {
      soldOut: true,
      reason: `${special.defaults.sweetener} syrup is out`,
    };
  if (inventory.bases[special.defaults.base])
    return { soldOut: true, reason: `${special.defaults.base} is out` };
  const availableTemps = special.temps.filter((t) => !inventory.temperatures[t]);
  if (availableTemps.length === 0)
    return { soldOut: true, reason: "no available temperatures" };
  return { soldOut: false, reason: null };
}

export function isAllBasesSoldOut(inventory: Inventory, bases: string[]) {
  return bases.length > 0 && bases.every((b) => inventory.bases[b]);
}
