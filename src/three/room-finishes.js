export const floorFinishes = [
  { id: "oak", name: "Meşe parke", color: "#c8b293", roughness: 0.88 },
  { id: "walnut", name: "Ceviz parke", color: "#806047", roughness: 0.8 },
  { id: "tile", name: "Seramik", color: "#d9d6ce", roughness: 0.38 },
  { id: "concrete", name: "Beton", color: "#a7aaa8", roughness: 0.96 },
];

export const defaultAppearance = () => ({
  wallColors: { back: "#ede6dc", side: "#ede6dc" },
  floor: { finish: "oak", color: floorFinishes[0].color },
});

export function validateAppearance(input) {
  // Version 1 rooms created before surface editing have no appearance field.
  if (input === undefined) return defaultAppearance();
  const hex = (value) =>
    typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
  if (
    !input ||
    !hex(input.wallColors?.back) ||
    !hex(input.wallColors?.side) ||
    !hex(input.floor?.color) ||
    !floorFinishes.some((finish) => finish.id === input.floor?.finish)
  )
    throw new Error("Duvar ve zemin bilgileri geçersiz.");
  return {
    wallColors: {
      back: input.wallColors.back.toLowerCase(),
      side: input.wallColors.side.toLowerCase(),
    },
    floor: {
      finish: input.floor.finish,
      color: input.floor.color.toLowerCase(),
    },
  };
}
