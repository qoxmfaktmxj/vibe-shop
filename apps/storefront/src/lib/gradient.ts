export function productGradient(accentColor?: string) {
  const accent = /^#[0-9A-Fa-f]{6}$/.test(accentColor ?? "")
    ? `${accentColor}26`
    : "rgba(220, 226, 247, 0.75)";
  return `linear-gradient(135deg, ${accent} 0%, rgba(255,255,255,0.96) 70%, rgba(240,244,247,0.95) 100%)`;
}
