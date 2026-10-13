// Left navigation bar: one item per feature, grouped.
import { GROUPS, FEATURES } from "../features";

// small line icons drawn with SVG paths
const ICONS = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5",
  table: "M4 5h16v14H4zM4 10h16M4 15h16M10 5v14",
  cab: "M5 16V11l2-5h10l2 5v5M5 16h14M7 16v2M17 16v2M8 12h1M15 12h1",
  backup: "M12 3v4M12 17v4M3 12h4M17 12h4M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  chart: "M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6",
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

export default function Sidebar({ active, onSelect, simRunning, collapsed, onToggle }) {
  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <div className="brand-text">
          <div className="brand-name">CabRoute</div>
          <div className="brand-sub">Cab allocation with DAA</div>
        </div>
      </div>

      <nav>
        {GROUPS.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            {group.ids.map((id) => (
              <button
                key={id}
                className={id === active ? "nav-item active" : "nav-item"}
                onClick={() => onSelect(id)}
                title={collapsed ? FEATURES[id].name : undefined}
              >
                <Icon name={FEATURES[id].icon} />
                <span className="nav-text">
                  <span className="nav-name">
                    {FEATURES[id].name}
                    {id === "sim" && simRunning && <span className="live-dot" title="Cabs are moving" />}
                  </span>
                  <span className="nav-algo">{FEATURES[id].algorithm}</span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <button className="collapse-btn" onClick={onToggle} aria-label={collapsed ? "Expand menu" : "Collapse menu"}>
        <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
          <path d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
        </svg>
        <span className="nav-text">Collapse menu</span>
      </button>
    </aside>
  );
}
