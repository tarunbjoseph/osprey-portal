import { useMemo, useState } from 'react';

/* ==========================================================================
   Threat register — the one genuinely interactive view on the site.

   Rendered as a React island because filtering across four axes with a live
   count is the kind of thing people actually operate, rather than read. The
   data is serialised at build time from the content collection, so there is
   no fetch and no loading state.
   ========================================================================== */

export interface RegisterRow {
  slug: string;
  code: string;
  name: string;
  behaviour: string;
  signals: string[];
  severity: string;
  scope: string;
  addedIn?: string;
  harmClasses: string[];
  action: { peak: string; summary: string; tier: string; humanReview: string; reviewNote: string };
  detection: { instrument: string; slmDifficulty: string | null; inGate1: boolean };
  surfaces: string[];
  anchorSummary: { framework: string; label: string; ids: string }[];
  href: string;
}

interface Props {
  rows: RegisterRow[];
  actionLabels: Record<string, string>;
  actionOrder: string[];
  instrumentLabels: Record<string, string>;
  surfaceNames: Record<string, string>;
}

type FilterKey = 'scope' | 'severity' | 'instrument' | 'surface';

const SEV_ORDER = ['critical', 'high', 'medium-high', 'medium', 'low'];
const SEV_LABEL: Record<string, string> = {
  critical: 'Critical', high: 'High', 'medium-high': 'Medium–High', medium: 'Medium', low: 'Low',
};
const SCOPE_LABEL: Record<string, string> = {
  core: 'Core', secondary: 'Secondary', 'out-of-scope': 'Out of scope',
};

export default function Register({
  rows, actionLabels, actionOrder, instrumentLabels, surfaceNames,
}: Props) {
  const [q, setQ] = useState('');
  const [f, setF] = useState<Record<FilterKey, string>>({
    scope: 'all', severity: 'all', instrument: 'all', surface: 'all',
  });

  const severities = useMemo(
    () => SEV_ORDER.filter((s) => rows.some((r) => r.severity === s)), [rows],
  );
  const instruments = useMemo(
    () => [...new Set(rows.map((r) => r.detection.instrument))].sort(), [rows],
  );
  const surfaces = useMemo(
    () => [...new Set(rows.flatMap((r) => r.surfaces))].sort(), [rows],
  );

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (f.scope !== 'all' && r.scope !== f.scope) return false;
      if (f.severity !== 'all' && r.severity !== f.severity) return false;
      if (f.instrument !== 'all' && r.detection.instrument !== f.instrument) return false;
      if (f.surface !== 'all' && !r.surfaces.includes(f.surface)) return false;
      if (!needle) return true;
      const hay = [
        r.code, r.name, r.behaviour, r.action.summary, r.action.reviewNote,
        ...r.signals, ...r.anchorSummary.map((a) => `${a.label} ${a.ids}`),
      ].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, f]);

  const grouped = useMemo(() => {
    const g = new Map<string, RegisterRow[]>();
    for (const r of visible) {
      if (!g.has(r.scope)) g.set(r.scope, []);
      g.get(r.scope)!.push(r);
    }
    return [...g.entries()].sort(
      (a, b) => (a[0] === 'core' ? -1 : 1) - (b[0] === 'core' ? -1 : 1),
    );
  }, [visible]);

  const set = (k: FilterKey, v: string) => setF((prev) => ({ ...prev, [k]: v }));
  const active = f.scope !== 'all' || f.severity !== 'all' || f.instrument !== 'all'
    || f.surface !== 'all' || q.trim() !== '';
  const reset = () => { setQ(''); setF({ scope: 'all', severity: 'all', instrument: 'all', surface: 'all' }); };

  return (
    <>
      <div className="ctl">
        <div className="ctl-row">
          <label className="search">
            <span className="visually-hidden">Search the register</span>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />
            </svg>
            <input
              type="search" value={q} placeholder="Search behaviour, signals, framework anchors…"
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <p className="count" role="status">
            <b>{visible.length}</b> of {rows.length}
            {active && <button className="reset" onClick={reset} type="button">Clear</button>}
          </p>
        </div>

        <div className="ctl-row wrap">
          <Group label="Scope" k="scope" cur={f.scope} set={set}
            opts={['core', 'secondary'].map((v) => [v, SCOPE_LABEL[v]])} />
          <Group label="Severity" k="severity" cur={f.severity} set={set}
            opts={severities.map((v) => [v, SEV_LABEL[v]])} />
          <Group label="Detection" k="instrument" cur={f.instrument} set={set}
            opts={instruments.map((v) => [v, instrumentLabels[v] ?? v])} />
          <Group label="Surface" k="surface" cur={f.surface} set={set}
            opts={surfaces.map((v) => [v, surfaceNames[v] ?? v])} />
        </div>
      </div>

      {grouped.length === 0 && (
        <p className="empty">
          No threat categories match those filters. <button onClick={reset} type="button">Clear them</button> to see the whole register.
        </p>
      )}

      {grouped.map(([scope, list]) => (
        <section key={scope} className="grp-wrap">
          <h2 className="grp">
            <b>{SCOPE_LABEL[scope]} scope</b>
            <span>
              {scope === 'core'
                ? 'what the platform must detect and classify today'
                : 'logged and monitored, in scope for later phases'}
            </span>
            <em>{list.length}</em>
          </h2>

          {list.map((r) => (
            <article key={r.code} className="t" data-sev={r.severity}>
              <span className="stripe" aria-hidden="true" />
              <div className="tin">
                <header className="thead">
                  <a className="tid" href={r.href}>{r.code}</a>
                  <a className="tname" href={r.href}>{r.name}</a>
                  {r.addedIn && <span className="tag">new</span>}
                  {r.detection.inGate1 && <span className="tag tag--g">evaluation gate</span>}
                  <span className="pill" data-sev={r.severity}>{SEV_LABEL[r.severity]}</span>
                </header>

                <div className="cols">
                  <div>
                    <p className="label">Behaviour</p>
                    <p className="body dk">{r.behaviour}</p>
                  </div>
                  <div>
                    <p className="label">Possible signals · detect stage</p>
                    <ul className="sig">
                      {r.signals.slice(0, 4).map((s) => <li key={s}>{s}</li>)}
                      {r.signals.length > 4 && (
                        <li className="more"><a href={r.href}>{r.signals.length - 4} more</a></li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="resp">
                  <div>
                    <p className="label">Action ladder</p>
                    <div className="ladder">
                      {actionOrder.map((act, i) => {
                        const peak = actionOrder.indexOf(r.action.peak);
                        return (
                          <span key={act} className={`rung${i < peak ? ' on' : ''}${i === peak ? ' peak' : ''}`}>
                            {actionLabels[act]}
                          </span>
                        );
                      })}
                    </div>
                    <div className="tier">
                      {['HOOTL', 'HOTL', 'HITL'].map((t, i) => (
                        <span key={t}>
                          {i > 0 && <i className="arr">›</i>}
                          <span className={`tp${t === r.action.tier ? ' on' : ''}`}>{t}</span>
                        </span>
                      ))}
                      <span className="cap">after detection</span>
                    </div>
                  </div>
                  <div>
                    <p className="label">Suggested action &amp; human review</p>
                    <p className="body dk">{r.action.summary}</p>
                    <p className="body sub">{r.action.reviewNote}</p>
                  </div>
                </div>

                <div className="chips">
                  {r.anchorSummary.map((a) => (
                    <span key={a.framework} className="chip">
                      <span className="k">{a.label}</span>{a.ids}
                    </span>
                  ))}
                  <a className="chip chip--accent" href={r.href}>Full anchoring →</a>
                </div>
              </div>
            </article>
          ))}
        </section>
      ))}
    </>
  );
}

function Group({ label, k, cur, set, opts }: {
  label: string; k: FilterKey; cur: string;
  set: (k: FilterKey, v: string) => void; opts: [string, string][];
}) {
  return (
    <div className="fg" role="group" aria-label={label}>
      <span className="label">{label}</span>
      <button type="button" className="f" aria-pressed={cur === 'all'} onClick={() => set(k, 'all')}>All</button>
      {opts.map(([v, l]) => (
        <button key={v} type="button" className="f" aria-pressed={cur === v} onClick={() => set(k, v)}>{l}</button>
      ))}
    </div>
  );
}
