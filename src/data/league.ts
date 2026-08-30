/**
 * League data: players, divisions, and each player's fixed 10-team roster
 * for the season (FR-012, FR-018). This is the one file the league
 * administrator hand-edits — see specs/001-pickem-leaderboard/quickstart.md
 * and contracts/league-data-schema.md for the full contract.
 *
 * Team ids are ESPN's numeric team ids (as strings), not abbreviations —
 * verified live against site.api.espn.com's team/schedule endpoints.
 * Numeric ids avoid an ambiguity abbreviations can have (e.g. "osu" and
 * "bsu" each collided with an unrelated small-college team when looked up
 * by abbreviation; the numeric id is unambiguous).
 *
 * Division 1 is real league data (2026 season). Additional divisions will
 * be added here as they're provided — only one division so far, so the
 * FR-017 "unique per division" rule has nothing to cross-check against yet
 * (verified: all 60 team ids below are already distinct within this one
 * division).
 */
import type { Division, Player } from "../types/league";

export const divisions: Division[] = [{ id: "division-1", name: "1" }];

export const players: Player[] = [
  {
    id: "taylor",
    name: "Taylor",
    divisionId: "division-1",
    ownedTeamIds: [
      "2483", // Oregon
      "245", // Texas A&M
      "252", // BYU
      "2439", // UNLV
      "228", // Clemson
      "2335", // Liberty
      "258", // Virginia
      "167", // New Mexico
      "2636", // UTSA
      "2", // Auburn
    ],
  },
  {
    id: "choezin",
    name: "Choezin",
    divisionId: "division-1",
    ownedTeamIds: [
      "194", // Ohio State
      "99", // LSU
      "201", // Oklahoma
      "264", // Washington
      "2294", // Iowa
      "158", // Nebraska
      "275", // Wisconsin
      "9", // Arizona State
      "59", // Georgia Tech
      "26", // UCLA
    ],
  },
  {
    id: "jr",
    name: "JR",
    divisionId: "division-1",
    ownedTeamIds: [
      "2641", // Texas Tech
      "333", // Alabama
      "30", // USC
      "254", // Utah
      "2306", // Kansas State
      "57", // Florida
      "356", // Illinois
      "152", // NC State
      "142", // Missouri
      "239", // Baylor
    ],
  },
  {
    id: "alcus",
    name: "Alcus",
    divisionId: "division-1",
    ownedTeamIds: [
      "251", // Texas
      "2567", // SMU
      "213", // Penn State
      "256", // JMU
      "2449", // NDSU (North Dakota State) — FBS, Mountain West
      "58", // USF
      "12", // Arizona
      "2649", // Toledo
      "309", // Louisiana (Ragin' Cajuns)
      "62", // Hawai'i
    ],
  },
  {
    id: "ethan",
    name: "Ethan",
    divisionId: "division-1",
    ownedTeamIds: [
      "84", // Indiana
      "87", // Notre Dame
      "145", // Ole Miss
      "68", // Boise State
      "2633", // Tennessee
      "248", // Houston
      "221", // Pittsburgh
      "2426", // Navy
      "2628", // TCU
      "259", // Virginia Tech
    ],
  },
  {
    id: "gordie",
    name: "Gordie",
    divisionId: "division-1",
    ownedTeamIds: [
      "61", // Georgia
      "2390", // Miami
      "130", // Michigan
      "97", // Louisville
      "235", // Memphis
      "197", // Oklahoma State
      "135", // Minnesota
      "21", // San Diego State
      "2579", // South Carolina
      "2655", // Tulane
    ],
  },
];
