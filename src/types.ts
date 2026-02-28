export type TournamentFormat = 'round_robin' | 'single_elim' | 'double_elim' | 'league';
export type TournamentStatus = 'upcoming' | 'in_progress' | 'completed';
export type MatchStatus = 'upcoming' | 'in_progress' | 'completed';
export type MatchType = 'singles' | 'doubles';

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  team1Id: string | null;
  team2Id: string | null;
  score1: number;
  score2: number;
  status: MatchStatus;
  winnerId: string | null;
  /** For bracket formats: the match ID the winner advances to */
  nextMatchId: string | null;
  /** For double elim: which bracket this match belongs to */
  bracket?: 'winners' | 'losers' | 'grand_final';
}

export interface Standing {
  teamId: string;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  scored: number;
  conceded: number;
  differential: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  format: TournamentFormat;
  matchType: MatchType;
  status: TournamentStatus;
  date: string;
  players: Player[];
  teams: Team[];
  matches: Match[];
  standings: Standing[];
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  pointsForCloseGame: number;
  closeGameThreshold: number;
  randomizePerRound: boolean;
  createdAt: string;
}
