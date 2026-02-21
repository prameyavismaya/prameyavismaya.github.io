#!/usr/bin/env python3
"""
Fetch and visualize GoatCounter analytics for The Mathematical Archive.

Requirements:
    pip install requests matplotlib

Usage:
    export GOATCOUNTER_TOKEN=your-token-here
    python3 analytics.py

Get a token at: https://prameyavismaya.goatcounter.com/user/api
"""

import requests
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta, timezone

# ── Config ─────────────────────────────────────────────────────────────────────

SITE_CODE = "prameyavismaya"
BASE_URL  = f"https://{SITE_CODE}.goatcounter.com/api/v0"
DAYS      = 30  # how many days back to fetch

token = "xeq7c53yep3hoqg781izqn8qhdffke7i8wz0qeiua3jd3mw4"

HEADERS = {"Authorization": f"Bearer {token}"}

# ── Date range ─────────────────────────────────────────────────────────────────

end   = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
start = end - timedelta(days=DAYS)
params_base = {
    "start": start.strftime("%Y-%m-%d"),
    "end":   end.strftime("%Y-%m-%d"),
}

# ── Fetch ──────────────────────────────────────────────────────────────────────

def get(path, **params):
    r = requests.get(
        f"{BASE_URL}{path}",
        headers=HEADERS,
        params={**params_base, **params},
    )
    if not r.ok:
        print(f"Error {r.status_code}: {r.text}")
        r.raise_for_status()
    return r.json()

print("Fetching stats...")
hits_data = get("/stats/hits", limit=100)

# Aggregate daily totals across all paths
daily_totals = {}
for hit in hits_data["hits"]:
    for s in hit.get("stats", []):
        day = s["day"]
        daily_totals[day] = daily_totals.get(day, 0) + s["daily"]

days   = sorted(daily_totals.keys())
counts = [daily_totals[d] for d in days]
days   = [datetime.strptime(d, "%Y-%m-%d") for d in days]

# Top 10 pages by total views
top = sorted(hits_data["hits"], key=lambda h: h["count"], reverse=True)[:10]
paths      = [h["path"] for h in top]
path_views = [h["count"] for h in top]

# ── Colors (site design system) ────────────────────────────────────────────────

BG       = "#1a1f2e"
PANEL    = "#232940"
GOLD     = "#d4a574"
TEAL     = "#88c0d0"
LAVENDER = "#b48ead"
TEXT     = "#cdd6f4"
GRID     = "#2e3452"

# ── Plot ───────────────────────────────────────────────────────────────────────

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
fig.patch.set_facecolor(BG)
fig.suptitle(
    "The Mathematical Archive — Analytics",
    color=GOLD, fontsize=15, fontweight="bold", y=1.01,
)

# Daily visits
ax1.set_facecolor(PANEL)
if days:
    ax1.plot(days, counts, color=TEAL, linewidth=2, zorder=3)
    ax1.fill_between(days, counts, alpha=0.15, color=TEAL)
ax1.set_title(f"Daily Visits (Last {DAYS} Days)", color=GOLD, fontsize=12, pad=10)
ax1.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
ax1.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
ax1.set_ylabel("Visits", color=TEXT)
ax1.grid(axis="y", color=GRID, linewidth=0.5, zorder=0)
ax1.tick_params(colors=TEXT, labelsize=9)
for spine in ax1.spines.values():
    spine.set_color(GRID)
plt.setp(ax1.xaxis.get_majorticklabels(), rotation=40, ha="right", color=TEXT)

# Top pages (highest count at top)
ax2.set_facecolor(PANEL)
if paths:
    ax2.barh(list(reversed(paths)), list(reversed(path_views)), color=LAVENDER, height=0.6)
ax2.set_title("Top Pages", color=GOLD, fontsize=12, pad=10)
ax2.set_xlabel("Views", color=TEXT)
ax2.grid(axis="x", color=GRID, linewidth=0.5, zorder=0)
ax2.tick_params(axis="x", colors=TEXT, labelsize=9)
ax2.tick_params(axis="y", colors=TEXT, labelsize=9)
for spine in ax2.spines.values():
    spine.set_color(GRID)

plt.tight_layout()
out = "analytics.png"
plt.savefig(out, dpi=150, bbox_inches="tight", facecolor=BG)
print(f"Saved {out}")
plt.show()
