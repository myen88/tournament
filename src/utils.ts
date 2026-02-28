import { v4 as uuidv4 } from 'uuid';
import type { Match, Player, Standing, Team } from './types';

/**
 * Fisher-Yates shuffle (in-place)
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle players and pair them into teams of 2
 */
export function randomizePartners(players: Player[]): Team[] {
  const shuffled = shuffle(players);
  const teams: Team[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      teams.push({
        id: uuidv4(),
        name: `${shuffled[i].name} & ${shuffled[i + 1].name}`,
        players: [shuffled[i], shuffled[i + 1]],
      });
    } else {
      // Odd player out — solo team
      teams.push({
        id: uuidv4(),
        name: shuffled[i].name,
        players: [shuffled[i]],
      });
    }
  }
  return teams;
}

/**
 * Create teams from individual players (1 player per team)
 */
export function playersToTeams(players: Player[]): Team[] {
  return players.map((p) => ({
    id: uuidv4(),
    name: p.name,
    players: [p],
  }));
}

/**
 * Generate round-robin schedule using the circle method.
 * Every team plays every other team exactly once.
 */
export function generateRoundRobin(teams: Team[]): Match[] {
  const n = teams.length;
  const teamList = [...teams];
  // If odd number of teams, add a bye placeholder
  const hasBye = n % 2 !== 0;
  if (hasBye) {
    teamList.push({ id: 'BYE', name: 'BYE', players: [] });
  }
  const totalTeams = teamList.length;
  const rounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;

  const matches: Match[] = [];
  let matchNumber = 1;

  // Circle method: fix first team, rotate the rest
  const fixed = teamList[0];
  const rotating = teamList.slice(1);

  for (let round = 0; round < rounds; round++) {
    const currentRotation = [...rotating];

    for (let m = 0; m < matchesPerRound; m++) {
      let team1: Team;
      let team2: Team;

      if (m === 0) {
        team1 = fixed;
        team2 = currentRotation[0];
      } else {
        team1 = currentRotation[m];
        team2 = currentRotation[currentRotation.length - m];
      }

      // Skip bye matches
      if (team1.id === 'BYE' || team2.id === 'BYE') continue;

      matches.push({
        id: uuidv4(),
        round: round + 1,
        matchNumber: matchNumber++,
        team1Id: team1.id,
        team2Id: team2.id,
        score1: 0,
        score2: 0,
        status: 'upcoming',
        winnerId: null,
        nextMatchId: null,
      });
    }

    // Rotate: move last element to front
    rotating.unshift(rotating.pop()!);
  }

  return matches;
}

/**
 * Generate single elimination bracket.
 * Teams are seeded and byes are given to fill to next power of 2.
 */
export function generateSingleElimBracket(teams: Team[]): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  // Find next power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(n)));
  const totalRounds = Math.log2(bracketSize);
  const matches: Match[] = [];

  // Generate all match slots for the bracket
  let matchCounter = 1;
  const matchMap = new Map<string, Match>();

  // Create matches for each round, from final back to first
  for (let round = totalRounds; round >= 1; round--) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    for (let m = 0; m < matchesInRound; m++) {
      const matchId = uuidv4();
      const match: Match = {
        id: matchId,
        round,
        matchNumber: matchCounter++,
        team1Id: null,
        team2Id: null,
        score1: 0,
        score2: 0,
        status: 'upcoming',
        winnerId: null,
        nextMatchId: null,
      };
      matchMap.set(`${round}-${m}`, match);
      matches.push(match);
    }
  }

  // Link matches: winner of round R match M goes to round R+1 match floor(M/2)
  for (let round = 1; round < totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    for (let m = 0; m < matchesInRound; m++) {
      const current = matchMap.get(`${round}-${m}`)!;
      const nextMatch = matchMap.get(`${round + 1}-${Math.floor(m / 2)}`)!;
      current.nextMatchId = nextMatch.id;
    }
  }

  // Seed teams into round 1
  // Standard tournament seeding: 1v(bracketSize), 2v(bracketSize-1), etc.
  const seeded = [...teams];
  const round1Matches = Math.pow(2, totalRounds - 1);

  for (let m = 0; m < round1Matches; m++) {
    const match = matchMap.get(`${1}-${m}`)!;
    const seed1 = m;
    const seed2 = bracketSize - 1 - m;

    if (seed1 < n) {
      match.team1Id = seeded[seed1].id;
    }
    if (seed2 < n) {
      match.team2Id = seeded[seed2].id;
    }

    // Handle byes: if only one team, auto-advance
    if (match.team1Id && !match.team2Id) {
      match.winnerId = match.team1Id;
      match.status = 'completed';
      // Advance to next match
      if (match.nextMatchId) {
        const nextMatch = matches.find((nm) => nm.id === match.nextMatchId)!;
        if (!nextMatch.team1Id) {
          nextMatch.team1Id = match.team1Id;
        } else {
          nextMatch.team2Id = match.team1Id;
        }
      }
    } else if (!match.team1Id && match.team2Id) {
      match.winnerId = match.team2Id;
      match.status = 'completed';
      if (match.nextMatchId) {
        const nextMatch = matches.find((nm) => nm.id === match.nextMatchId)!;
        if (!nextMatch.team1Id) {
          nextMatch.team1Id = match.team2Id;
        } else {
          nextMatch.team2Id = match.team2Id;
        }
      }
    }
  }

  // Re-number matches in order
  const sorted = matches.sort((a, b) => a.round - b.round || a.matchNumber - b.matchNumber);
  sorted.forEach((m, i) => (m.matchNumber = i + 1));

  return sorted;
}

/**
 * Generate league schedule (same as round robin but with home/away double round)
 */
export function generateLeagueSchedule(teams: Team[]): Match[] {
  const firstHalf = generateRoundRobin(teams);
  const secondHalf = firstHalf.map((m) => ({
    ...m,
    id: uuidv4(),
    round: m.round + (teams.length % 2 === 0 ? teams.length - 1 : teams.length),
    team1Id: m.team2Id,
    team2Id: m.team1Id,
    score1: 0,
    score2: 0,
    status: 'upcoming' as const,
    winnerId: null,
  }));
  const all = [...firstHalf, ...secondHalf];
  all.forEach((m, i) => (m.matchNumber = i + 1));
  return all;
}

/**
 * Calculate standings from completed matches
 */
export function calculateStandings(
  teams: Team[],
  matches: Match[],
  pointsForWin = 3,
  pointsForDraw = 1,
  pointsForLoss = 0,
  pointsForCloseGame = 0,
  closeGameThreshold = 3
): Standing[] {
  const standingsMap = new Map<string, Standing>();

  teams.forEach((t) => {
    standingsMap.set(t.id, {
      teamId: t.id,
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      scored: 0,
      conceded: 0,
      differential: 0,
    });
  });

  matches
    .filter((m) => m.status === 'completed' && m.team1Id && m.team2Id)
    .forEach((m) => {
      const s1 = standingsMap.get(m.team1Id!)!;
      const s2 = standingsMap.get(m.team2Id!)!;

      if (!s1 || !s2) return;

      s1.played++;
      s2.played++;
      s1.scored += m.score1;
      s1.conceded += m.score2;
      s2.scored += m.score2;
      s2.conceded += m.score1;

      if (m.score1 > m.score2) {
        s1.wins++;
        s1.points += pointsForWin;
        s2.losses++;
        s2.points += pointsForLoss;
        // Close game bonus for the loser
        if (pointsForCloseGame > 0 && (m.score1 - m.score2) < closeGameThreshold) {
          s2.points += pointsForCloseGame;
        }
      } else if (m.score2 > m.score1) {
        s2.wins++;
        s2.points += pointsForWin;
        s1.losses++;
        s1.points += pointsForLoss;
        // Close game bonus for the loser
        if (pointsForCloseGame > 0 && (m.score2 - m.score1) < closeGameThreshold) {
          s1.points += pointsForCloseGame;
        }
      } else {
        s1.draws++;
        s2.draws++;
        s1.points += pointsForDraw;
        s2.points += pointsForDraw;
      }

      s1.differential = s1.scored - s1.conceded;
      s2.differential = s2.scored - s2.conceded;
    });

  return Array.from(standingsMap.values()).sort(
    (a, b) => b.points - a.points || b.differential - a.differential || b.scored - a.scored
  );
}

/**
 * Advance the winner of a bracket match to the next match
 */
export function advanceBracket(matches: Match[], matchId: string, winnerId: string): Match[] {
  const updated = matches.map((m) => ({ ...m }));
  const match = updated.find((m) => m.id === matchId);
  if (!match) return updated;

  match.winnerId = winnerId;
  match.status = 'completed';

  if (match.nextMatchId) {
    const nextMatch = updated.find((m) => m.id === match.nextMatchId);
    if (nextMatch) {
      if (!nextMatch.team1Id) {
        nextMatch.team1Id = winnerId;
      } else if (!nextMatch.team2Id) {
        nextMatch.team2Id = winnerId;
      }
    }
  }

  return updated;
}

/**
 * Format helpers
 */
export function formatLabel(format: string): string {
  const labels: Record<string, string> = {
    round_robin: 'Round Robin',
    single_elim: 'Single Elimination',
    double_elim: 'Double Elimination',
    league: 'League',
  };
  return labels[format] || format;
}

export function statusColor(status: string): string {
  switch (status) {
    case 'upcoming':
      return 'secondary';
    case 'in_progress':
      return 'default';
    case 'completed':
      return 'outline';
    default:
      return 'secondary';
  }
}
