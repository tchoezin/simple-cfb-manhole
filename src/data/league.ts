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
 * Divisions 1-4 are real league data (2026 season). Additional
 * divisions will be added here as they're provided (verified: team ids are
 * distinct within each division, satisfying the FR-017 "unique per
 * division" rule; reuse of a team id across different divisions is fine).
 */
import type { Division, Player } from "../types/league";

export const divisions: Division[] = [
  { id: "division-1", name: "1" },
  { id: "division-2", name: "2" },
  { id: "division-3", name: "3" },
  { id: "division-4", name: "4" },
];

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
  {
    id: "cam",
    name: "Cam",
    divisionId: "division-2",
    ownedTeamIds: [
      "84", // Indiana
      "87", // Notre Dame
      "213", // Penn State
      "57", // Florida
      "2294", // Iowa
      "2628", // TCU
      "9", // Arizona State
      "2306", // Kansas State
      "152", // NC State
      "151", // East Carolina
    ],
  },
  {
    id: "teddy",
    name: "Teddy",
    divisionId: "division-2",
    ownedTeamIds: [
      "2483", // Oregon
      "2641", // Texas Tech
      "145", // Ole Miss
      "264", // Washington
      "248", // Houston
      "2426", // Navy
      "256", // JMU
      "2711", // Western Michigan
      "2636", // UTSA
      "2335", // Liberty
    ],
  },
  {
    id: "mike",
    name: "Mike",
    divisionId: "division-2",
    ownedTeamIds: [
      "251", // Texas
      "333", // Alabama
      "30", // USC
      "228", // Clemson
      "68", // Boise State
      "2439", // UNLV
      "21", // San Diego State
      "2649", // Toledo
      "2655", // Tulane
      "2449", // North Dakota State
    ],
  },
  {
    id: "jason",
    name: "Jason",
    divisionId: "division-2",
    ownedTeamIds: [
      "2390", // Miami
      "252", // BYU
      "2633", // Tennessee
      "2567", // SMU
      "356", // Illinois
      "142", // Missouri
      "221", // Pittsburgh
      "258", // Virginia
      "77", // Northwestern
      "25", // California
    ],
  },
  {
    id: "ian",
    name: "Ian",
    divisionId: "division-2",
    ownedTeamIds: [
      "194", // Ohio State
      "245", // Texas A&M
      "201", // Oklahoma
      "12", // Arizona
      "97", // Louisville
      "2", // Auburn
      "158", // Nebraska
      "278", // Fresno State
      "193", // Miami (OH)
      "235", // Memphis
    ],
  },
  {
    id: "xander",
    name: "Xander",
    divisionId: "division-2",
    ownedTeamIds: [
      "61", // Georgia
      "99", // LSU
      "130", // Michigan
      "254", // Utah
      "197", // Oklahoma State
      "259", // Virginia Tech
      "59", // Georgia Tech
      "2579", // South Carolina
      "58", // USF
      "38", // Colorado
    ],
  },
  {
    id: "westy",
    name: "Westy",
    divisionId: "division-3",
    ownedTeamIds: [
      "2483", // Oregon
      "2567", // SMU
      "145", // Ole Miss
      "264", // Washington
      "221", // Pittsburgh
      "152", // NC State
      "2628", // TCU
      "356", // Illinois
      "158", // Nebraska
      "239", // Baylor
    ],
  },
  {
    id: "grant",
    name: "Grant",
    divisionId: "division-3",
    ownedTeamIds: [
      "2390", // Miami
      "99", // LSU
      "213", // Penn State
      "130", // Michigan
      "2633", // Tennessee
      "12", // Arizona
      "57", // Florida
      "142", // Missouri
      "25", // California
      "2711", // Western Michigan
    ],
  },
  {
    id: "jon",
    name: "Jon",
    divisionId: "division-3",
    ownedTeamIds: [
      "251", // Texas
      "2641", // Texas Tech
      "254", // Utah
      "68", // Boise State
      "258", // Virginia
      "2439", // UNLV
      "2", // Auburn
      "2335", // Liberty
      "2655", // Tulane
      "9", // Arizona State
    ],
  },
  {
    id: "shoon",
    name: "Shoon",
    divisionId: "division-3",
    ownedTeamIds: [
      "194", // Ohio State
      "30", // USC
      "245", // Texas A&M
      "248", // Houston
      "197", // Oklahoma State
      "59", // Georgia Tech
      "167", // New Mexico
      "2579", // South Carolina
      "235", // Memphis
      "21", // San Diego State
    ],
  },
  {
    id: "garrett",
    name: "Garrett",
    divisionId: "division-3",
    ownedTeamIds: [
      "61", // Georgia
      "333", // Alabama
      "252", // BYU
      "2306", // Kansas State
      "97", // Louisville
      "256", // JMU
      "2449", // North Dakota State
      "259", // Virginia Tech
      "58", // USF
      "275", // Wisconsin
    ],
  },
  {
    id: "michael",
    name: "Michael",
    divisionId: "division-3",
    ownedTeamIds: [
      "84", // Indiana
      "87", // Notre Dame
      "201", // Oklahoma
      "228", // Clemson
      "2294", // Iowa
      "2426", // Navy
      "26", // UCLA
      "349", // Army
      "52", // Florida State
      "2116", // UCF
    ],
  },
  {
    id: "jack-i",
    name: "Jack I",
    divisionId: "division-4",
    ownedTeamIds: [
      "194", // Ohio State
      "252", // BYU
      "97", // Louisville
      "228", // Clemson
      "2628", // TCU
      "2439", // UNLV
      "2636", // UTSA
      "356", // Illinois
      "309", // Louisiana
      "150", // Duke
    ],
  },
  {
    id: "tyler",
    name: "Tyler",
    divisionId: "division-4",
    ownedTeamIds: [
      "2483", // Oregon
      "99", // LSU
      "201", // Oklahoma
      "2633", // Tennessee
      "264", // Washington
      "57", // Florida
      "2426", // Navy
      "152", // NC State
      "59", // Georgia Tech
      "349", // Army
    ],
  },
  {
    id: "uva",
    name: "Uva",
    divisionId: "division-4",
    ownedTeamIds: [
      "251", // Texas
      "245", // Texas A&M
      "333", // Alabama
      "248", // Houston
      "12", // Arizona
      "58", // USF
      "9", // Arizona State
      "259", // Virginia Tech
      "142", // Missouri
      "2655", // Tulane
    ],
  },
  {
    id: "vingi",
    name: "Vingi",
    divisionId: "division-4",
    ownedTeamIds: [
      "87", // Notre Dame
      "2641", // Texas Tech
      "30", // USC
      "213", // Penn State
      "197", // Oklahoma State
      "2335", // Liberty
      "235", // Memphis
      "221", // Pittsburgh
      "295", // Old Dominion
      "193", // Miami (OH)
    ],
  },
  {
    id: "red",
    name: "Red",
    divisionId: "division-4",
    ownedTeamIds: [
      "61", // Georgia
      "254", // Utah
      "2567", // SMU
      "2294", // Iowa
      "2449", // North Dakota State
      "68", // Boise State
      "258", // Virginia
      "2653", // Troy
      "2", // Auburn
      "2116", // UCF
    ],
  },
  {
    id: "delk",
    name: "Delk",
    divisionId: "division-4",
    ownedTeamIds: [
      "2390", // Miami
      "84", // Indiana
      "145", // Ole Miss
      "130", // Michigan
      "256", // JMU
      "2306", // Kansas State
      "167", // New Mexico
      "2711", // Western Michigan
      "2649", // Toledo
      "2579", // South Carolina
    ],
  },
];
