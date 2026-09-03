import { getCollection, type CollectionEntry } from 'astro:content';

/* ==========================================================================
   Shared derivations over the content collections.

   Every page that needs "which controls does this threat touch" or "which
   surfaces is this threat on" goes through here, so the joins live in one
   place and a schema change breaks the build in one file rather than ten.
   ========================================================================== */

export type Threat = CollectionEntry<'threats'>;
export type Control = CollectionEntry<'controls'>;
export type Surface = CollectionEntry<'surfaces'>;
export type Framework = CollectionEntry<'frameworks'>;

const bySort = <T extends { data: { order?: number } }>(a: T, b: T) =>
  (a.data.order ?? 50) - (b.data.order ?? 50);

export async function allThreats(): Promise<Threat[]> {
  return (await getCollection('threats')).sort(bySort);
}
export async function allControls(): Promise<Control[]> {
  return (await getCollection('controls')).sort(bySort);
}
export async function allSurfaces(): Promise<Surface[]> {
  return (await getCollection('surfaces')).sort(bySort);
}
export async function allFrameworks(): Promise<Framework[]> {
  return (await getCollection('frameworks')).sort(bySort);
}

/** Control code -> control entry, for resolving an anchor to a real page. */
export async function controlIndex() {
  const controls = await allControls();
  const byCode = new Map<string, Control>();
  for (const c of controls) byCode.set(`${c.data.framework.id}:${c.data.code}`, c);
  return byCode;
}

/**
 * Surfaces a threat sits on, derived from the controls it anchors to rather
 * than restated per threat. One less field to keep in sync by hand.
 */
export async function surfacesForThreat(t: Threat): Promise<string[]> {
  const idx = await controlIndex();
  const out = new Set<string>();
  for (const a of t.data.anchors) {
    const c = idx.get(`${a.framework.id}:${a.id}`);
    for (const s of c?.data.surfaces ?? []) out.add(s);
  }
  return [...out];
}

/** Threats that anchor to a given control, for the reverse view on a control page. */
export async function threatsForControl(c: Control): Promise<Threat[]> {
  const threats = await allThreats();
  return threats.filter((t) =>
    t.data.anchors.some((a) => a.framework.id === c.data.framework.id && a.id === c.data.code),
  );
}

/** Threats touching a governance surface, via their anchored controls. */
export async function threatsForSurface(surfaceId: string): Promise<Threat[]> {
  const threats = await allThreats();
  const idx = await controlIndex();
  return threats.filter((t) =>
    t.data.anchors.some((a) => idx.get(`${a.framework.id}:${a.id}`)?.data.surfaces.includes(surfaceId)),
  );
}

/** Every anchor on the site, flattened — powers the verification register. */
export async function allAnchors() {
  const threats = await allThreats();
  return threats.flatMap((t) =>
    t.data.anchors.map((a) => ({ ...a, threatCode: t.data.code, threatName: t.data.name, threatId: t.id })),
  );
}

/** Headline counts used on the overview page. Derived, never hard-coded. */
export async function stats() {
  const threats = await allThreats();
  const controls = await allControls();
  const anchors = await allAnchors();
  const modelOwned = threats.filter((t) => t.data.detection.slmDifficulty !== null);
  return {
    threats: threats.length,
    core: threats.filter((t) => t.data.scope === 'core').length,
    secondary: threats.filter((t) => t.data.scope === 'secondary').length,
    modelInvolved: modelOwned.length,
    inGate1: threats.filter((t) => t.data.detection.inGate1).length,
    neverModel: threats.filter((t) => t.data.detection.slmDifficulty === null).length,
    controls: controls.length,
    agscControls: controls.filter((c) => c.data.framework.id === 'agsc').length,
    adgControls: controls.filter((c) => c.data.framework.id === 'adg').length,
    anchors: anchors.length,
    verified: anchors.filter((a) => a.verification === 'verified').length,
    pending: anchors.filter((a) => a.verification === 'pending').length,
    gaps: anchors.filter((a) => a.verification === 'gap').length,
  };
}

/** Absolute URL helper that respects the configured base path. */
export const url = (p: string) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return p === '/' ? `${base}/` : `${base}${p}`;
};
