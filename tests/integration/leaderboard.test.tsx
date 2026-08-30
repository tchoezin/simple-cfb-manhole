import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Leaderboard } from "../../src/components/Leaderboard";
import { Header } from "../../src/components/Header";
import { StaleDataNotice } from "../../src/components/StaleDataNotice";
import type { LeaderboardEntry, Player } from "../../src/types/league";

function player(
  id: string,
  name: string,
  divisionId: string,
  ownedTeamIds: string[] = [],
): Player {
  return { id, name, divisionId, ownedTeamIds };
}

describe("Header (US1 — brand color refresh)", () => {
  it("renders the CFB Manhole logo image without visible brand text", () => {
    render(<Header />);

    expect(screen.getByAltText("CFB Manhole")).toBeInTheDocument();
    expect(screen.queryByText("CFB Manhole")).toBeNull();
  });

  it("falls back to the CFB Manhole brand text if the logo image fails to load", () => {
    render(<Header />);

    fireEvent.error(screen.getByAltText("CFB Manhole"));

    expect(screen.getByText("CFB Manhole")).toBeInTheDocument();
  });
});

describe("Leaderboard (US2 — brand color refresh)", () => {
  it("wraps the table in a scrollable container and keeps rows in a single leaderboard table", () => {
    const entries: LeaderboardEntry[] = [
      { player: player("alice", "Alice", "east"), total: 12, rank: 1 },
      { player: player("bob", "Bob", "west"), total: 7, rank: 2 },
    ];

    const { container } = render(<Leaderboard entries={entries} />);

    expect(container.querySelector(".leaderboard-scroll table.leaderboard")).not.toBeNull();
  });
});

describe("StaleDataNotice (US2 — brand color refresh)", () => {
  it("renders with the stale-data-notice class for warning styling", () => {
    const { container } = render(
      <StaleDataNotice computedAt="2026-08-27T00:00:00.000Z" />,
    );

    expect(container.querySelector(".stale-data-notice")).not.toBeNull();
  });
});

describe("Leaderboard (US1)", () => {
  it("renders every player from fixture data with name + score, correctly ordered", () => {
    const entries: LeaderboardEntry[] = [
      { player: player("alice", "Alice", "east"), total: 12, rank: 1 },
      { player: player("bob", "Bob", "west"), total: 7, rank: 2 },
      { player: player("carol", "Carol", "east"), total: 3, rank: 3 },
    ];

    render(<Leaderboard entries={entries} />);

    const rows = screen.getAllByRole("row").slice(1); // skip header row
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("Alice");
    expect(rows[0]).toHaveTextContent("12");
    expect(rows[1]).toHaveTextContent("Bob");
    expect(rows[2]).toHaveTextContent("Carol");
  });

  it("shows tied players adjacent with the same rank", () => {
    const entries: LeaderboardEntry[] = [
      { player: player("alice", "Alice", "east"), total: 5, rank: 1 },
      { player: player("bob", "Bob", "west"), total: 5, rank: 1 },
      { player: player("carol", "Carol", "east"), total: 2, rank: 3 },
    ];

    render(<Leaderboard entries={entries} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("1");
    expect(rows[1]).toHaveTextContent("1");
    expect(rows[2]).toHaveTextContent("3");
  });
});

describe("Leaderboard (US3 — divisions never split the display)", () => {
  it("renders players from multiple divisions, including a team owned in two divisions, as one combined list with no division grouping", () => {
    const entries: LeaderboardEntry[] = [
      { player: player("alice", "Alice", "east"), total: 3, rank: 1 },
      { player: player("dan", "Dan", "west"), total: 3, rank: 1 }, // owns the same team as alice in a different division
      { player: player("bob", "Bob", "east"), total: 1, rank: 3 },
      { player: player("erin", "Erin", "west"), total: 0, rank: 4 },
    ];

    render(<Leaderboard entries={entries} />);

    // Exactly one table, one header row + one row per player — no
    // per-division sub-tables or headers. Each player's own division
    // still renders inline in that row's Division column
    // (004-division-column, FR-001–FR-002) — it just never groups/splits
    // the list itself.
    expect(screen.getAllByRole("table")).toHaveLength(1);
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveTextContent("east");
    expect(rows[1]).toHaveTextContent("west");
    expect(rows[2]).toHaveTextContent("east");
    expect(rows[3]).toHaveTextContent("west");
  });
});

describe("Leaderboard (US1 — division column, 004-division-column)", () => {
  it("renders a Division column header (FR-001)", () => {
    render(<Leaderboard entries={[]} />);

    expect(screen.getByRole("columnheader", { name: "Division" })).toBeInTheDocument();
  });

  it("shows each player's resolved division name in their row (FR-002)", () => {
    const entries: LeaderboardEntry[] = [
      { player: player("alice", "Alice", "division-1"), total: 12, rank: 1 },
    ];
    const divisionsById = new Map([["division-1", { id: "division-1", name: "Division 1" }]]);

    render(<Leaderboard entries={entries} divisionsById={divisionsById} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Division 1");
  });

  it("falls back to the raw division id when it doesn't match any known division (FR-005 edge case)", () => {
    const entries: LeaderboardEntry[] = [
      { player: player("alice", "Alice", "unknown-division"), total: 12, rank: 1 },
    ];
    const divisionsById = new Map([["division-1", { id: "division-1", name: "Division 1" }]]);

    render(<Leaderboard entries={entries} divisionsById={divisionsById} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("unknown-division");
  });

  it("does not change rank order or alphabetical tie-breaking after adding the column (FR-004, SC-002)", () => {
    const entries: LeaderboardEntry[] = [
      { player: player("bob", "Bob", "division-1"), total: 5, rank: 1 },
      { player: player("alice", "Alice", "division-1"), total: 5, rank: 1 },
      { player: player("carol", "Carol", "division-1"), total: 2, rank: 3 },
    ];
    const divisionsById = new Map([["division-1", { id: "division-1", name: "Division 1" }]]);

    render(<Leaderboard entries={entries} divisionsById={divisionsById} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("Bob");
    expect(rows[1]).toHaveTextContent("Alice");
    expect(rows[2]).toHaveTextContent("Carol");
  });
});

describe("Leaderboard (US1 — roster hover preview, 003-hover-player-roster)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderWithAlice(ownedTeamIds: string[] = ["59", "333"]) {
    const entries: LeaderboardEntry[] = [
      { player: player("alice", "Alice", "east", ownedTeamIds), total: 12, rank: 1 },
    ];
    const teamNamesById = new Map([
      ["59", "Georgia Tech"],
      ["333", "Alabama"],
    ]);
    render(<Leaderboard entries={entries} teamNamesById={teamNamesById} />);
    return screen.getByText("Alice");
  }

  it("opens a dialog with team names after 1 continuous second of hover (FR-001, FR-002)", () => {
    const nameEl = renderWithAlice();

    fireEvent.mouseEnter(nameEl);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Georgia Tech")).toBeInTheDocument();
    expect(screen.getByText("Alabama")).toBeInTheDocument();
  });

  it("does not open the dialog if the pointer leaves before 1s (FR-003, SC-003)", () => {
    const nameEl = renderWithAlice();

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.mouseLeave(nameEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the dialog as soon as the pointer leaves the name (FR-004)", () => {
    const nameEl = renderWithAlice();

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.mouseLeave(nameEl);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays open when the pointer moves from the name directly onto the dialog (FR-010, clarification 2026-08-28 Q1)", () => {
    const nameEl = renderWithAlice();

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const dialog = screen.getByRole("dialog");

    // Simulates the real browser transition: leaving the name with the
    // dialog as the relatedTarget (the element the pointer is entering).
    fireEvent.mouseLeave(nameEl, { relatedTarget: dialog });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("stays open when the pointer moves from the dialog back onto the name", () => {
    const nameEl = renderWithAlice();

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const dialog = screen.getByRole("dialog");

    fireEvent.mouseLeave(nameEl, { relatedTarget: dialog });
    fireEvent.mouseLeave(dialog, { relatedTarget: nameEl });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes once the pointer leaves the dialog to somewhere that isn't the name", () => {
    const nameEl = renderWithAlice();

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const dialog = screen.getByRole("dialog");

    fireEvent.mouseLeave(nameEl, { relatedTarget: dialog });
    fireEvent.mouseLeave(dialog, { relatedTarget: document.body });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("restarts the 1s timer from zero on re-entry after leaving early (FR-007)", () => {
    const nameEl = renderWithAlice();

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    fireEvent.mouseLeave(nameEl);

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    // Cumulative hover time is 1400ms, but only 700ms since the restart —
    // must not have opened yet.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the first dialog and opens the new one when hovering a different player (FR-008)", () => {
    const entries: LeaderboardEntry[] = [
      { player: player("alice", "Alice", "east", ["59"]), total: 12, rank: 1 },
      { player: player("bob", "Bob", "west", ["333"]), total: 7, rank: 2 },
    ];
    const teamNamesById = new Map([
      ["59", "Georgia Tech"],
      ["333", "Alabama"],
    ]);
    render(<Leaderboard entries={entries} teamNamesById={teamNamesById} />);

    const aliceEl = screen.getByText("Alice");
    fireEvent.mouseEnter(aliceEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Georgia Tech")).toBeInTheDocument();

    fireEvent.mouseLeave(aliceEl);
    const bobEl = screen.getByText("Bob");
    fireEvent.mouseEnter(bobEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByText("Alabama")).toBeInTheDocument();
    expect(screen.queryByText("Georgia Tech")).not.toBeInTheDocument();
  });

  it("falls back to the raw team id when a name is missing from the lookup (FR-005 edge case)", () => {
    const nameEl = renderWithAlice(["59", "unknown-id"]);

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Georgia Tech")).toBeInTheDocument();
    expect(screen.getByText("unknown-id")).toBeInTheDocument();
  });

  it("shows a 'no teams listed' fallback for an empty roster (spec Edge Cases)", () => {
    const nameEl = renderWithAlice([]);

    fireEvent.mouseEnter(nameEl);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/no teams listed/i)).toBeInTheDocument();
  });
});
