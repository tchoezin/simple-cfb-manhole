/**
 * Conference-to-teams list (FR-019, constitution III). Manually maintained
 * — never fetched from ESPN. See
 * specs/001-pickem-leaderboard/contracts/conferences-schema.md for the
 * full contract and specs/001-pickem-leaderboard/research.md §2a for why
 * this replaced a live ESPN fetch.
 *
 * 2026 FBS realignment, as provided by the league administrator (138 FBS
 * schools across 10 conferences + 2 independents).
 *
 * Independents (Notre Dame, UConn) are each modeled as their own
 * single-team "conference" with a unique id, rather than sharing an
 * "independents" id — independent schools play no conference games, so
 * even a game between two independents must never trigger the
 * same-conference bonus (FR-005). Giving each a unique id makes that true
 * by construction: conferenceId equality never holds for two independents,
 * or between an independent and anyone else.
 */
import type { Conference } from "../types/league";

export const conferences: Conference[] = [
  {
    id: "acc",
    name: "Atlantic Coast Conference",
    teamIds: [
      "103", // Boston College
      "25", // California
      "228", // Clemson
      "150", // Duke
      "52", // Florida State
      "59", // Georgia Tech
      "97", // Louisville
      "2390", // Miami
      "152", // NC State
      "153", // North Carolina
      "221", // Pittsburgh
      "2567", // SMU
      "24", // Stanford
      "183", // Syracuse
      "258", // Virginia
      "259", // Virginia Tech
      "154", // Wake Forest
    ],
  },
  {
    id: "american",
    name: "American Conference",
    teamIds: [
      "349", // Army
      "2429", // Charlotte
      "151", // East Carolina
      "2226", // Florida Atlantic
      "235", // Memphis
      "2426", // Navy
      "249", // North Texas
      "242", // Rice
      "218", // Temple
      "2655", // Tulane
      "202", // Tulsa
      "5", // UAB
      "58", // South Florida
      "2636", // UTSA
    ],
  },
  {
    id: "big-12",
    name: "Big 12 Conference",
    teamIds: [
      "12", // Arizona
      "9", // Arizona State
      "239", // Baylor
      "252", // BYU
      "2132", // Cincinnati
      "38", // Colorado
      "248", // Houston
      "66", // Iowa State
      "2305", // Kansas
      "2306", // Kansas State
      "197", // Oklahoma State
      "2628", // TCU
      "2641", // Texas Tech
      "2116", // UCF
      "254", // Utah
      "277", // West Virginia
    ],
  },
  {
    id: "big-ten",
    name: "Big Ten Conference",
    teamIds: [
      "356", // Illinois
      "84", // Indiana
      "2294", // Iowa
      "120", // Maryland
      "130", // Michigan
      "127", // Michigan State
      "135", // Minnesota
      "158", // Nebraska
      "77", // Northwestern
      "194", // Ohio State
      "2483", // Oregon
      "213", // Penn State
      "2509", // Purdue
      "164", // Rutgers
      "26", // UCLA
      "30", // USC
      "264", // Washington
      "275", // Wisconsin
    ],
  },
  {
    id: "conference-usa",
    name: "Conference USA",
    teamIds: [
      "48", // Delaware
      "2229", // Florida International
      "55", // Jacksonville State
      "338", // Kennesaw State
      "2335", // Liberty
      "2393", // Middle Tennessee
      "2623", // Missouri State
      "166", // New Mexico State
      "2534", // Sam Houston
      "98", // Western Kentucky
    ],
  },
  {
    id: "mac",
    name: "Mid-American Conference",
    teamIds: [
      "2006", // Akron
      "2050", // Ball State
      "189", // Bowling Green
      "2084", // Buffalo
      "2117", // Central Michigan
      "2199", // Eastern Michigan
      "2309", // Kent State
      "193", // Miami (OH)
      "195", // Ohio
      "16", // Sacramento State
      "2649", // Toledo
      "113", // Massachusetts
      "2711", // Western Michigan
    ],
  },
  {
    id: "mountain-west",
    name: "Mountain West Conference",
    teamIds: [
      "2005", // Air Force
      "62", // Hawai'i
      "2440", // Nevada
      "167", // New Mexico
      "2449", // North Dakota State
      "2459", // Northern Illinois
      "23", // San José State
      "2439", // UNLV
      "2638", // UTEP
      "2751", // Wyoming
    ],
  },
  {
    id: "pac-12",
    name: "Pac-12 Conference",
    teamIds: [
      "68", // Boise State
      "36", // Colorado State
      "278", // Fresno State
      "204", // Oregon State
      "21", // San Diego State
      "326", // Texas State
      "328", // Utah State
      "265", // Washington State
    ],
  },
  {
    id: "sec",
    name: "Southeastern Conference",
    teamIds: [
      "333", // Alabama
      "8", // Arkansas
      "2", // Auburn
      "57", // Florida
      "61", // Georgia
      "96", // Kentucky
      "99", // LSU
      "344", // Mississippi State
      "142", // Missouri
      "201", // Oklahoma
      "145", // Ole Miss
      "2579", // South Carolina
      "2633", // Tennessee
      "251", // Texas
      "245", // Texas A&M
      "238", // Vanderbilt
    ],
  },
  {
    id: "sun-belt",
    name: "Sun Belt Conference",
    teamIds: [
      "2026", // App State
      "2032", // Arkansas State
      "324", // Coastal Carolina
      "290", // Georgia Southern
      "2247", // Georgia State
      "256", // James Madison
      "309", // Louisiana
      "2348", // Louisiana Tech
      "276", // Marshall
      "295", // Old Dominion
      "6", // South Alabama
      "2572", // Southern Miss
      "2653", // Troy
      "2433", // UL Monroe
    ],
  },
  {
    id: "independent-notre-dame",
    name: "Independent (Notre Dame)",
    teamIds: ["87"], // Notre Dame
  },
  {
    id: "independent-uconn",
    name: "Independent (UConn)",
    teamIds: ["41"], // UConn
  },
];
