import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Match, MatchType, Player, Tournament, TournamentFormat } from './types';
import {
  advanceBracket,
  calculateStandings,
  generateLeagueSchedule,
  generateRoundRobin,
  generateSingleElimBracket,
  playersToTeams,
  randomizePartners,
  shuffle,
} from './utils';

interface TournamentStore {
  tournaments: Tournament[];

  createTournament: (params: {
    name: string;
    description: string;
    format: TournamentFormat;
    date: string;
    players: Player[];
    matchType: MatchType;
    randomizePerRound?: boolean;
    pointsForWin?: number;
    pointsForDraw?: number;
    pointsForLoss?: number;
    pointsForCloseGame?: number;
    closeGameThreshold?: number;
  }) => Tournament;

  deleteTournament: (id: string) => void;

  updateMatchScore: (
    tournamentId: string,
    matchId: string,
    score1: number,
    score2: number
  ) => void;

  reRandomizePartners: (tournamentId: string) => void;

  randomizeRoundTeams: (tournamentId: string, round: number) => void;

  getTournament: (id: string) => Tournament | undefined;
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set, get) => ({
      tournaments: [],

      createTournament: (params) => {
        const {
          name,
          description,
          format,
          date,
          players,
          matchType,
          randomizePerRound = false,
          pointsForWin = 3,
          pointsForDraw = 1,
          pointsForLoss = 0,
          pointsForCloseGame = 0,
          closeGameThreshold = 3,
        } = params;

        const teams = matchType === 'doubles' ? randomizePartners(players) : playersToTeams(players);

        let matches: Match[] = [];
        switch (format) {
          case 'round_robin':
            matches = generateRoundRobin(teams);
            break;
          case 'single_elim':
          case 'double_elim':
            matches = generateSingleElimBracket(teams);
            break;
          case 'league':
            matches = generateLeagueSchedule(teams);
            break;
        }

        const standings = calculateStandings(teams, matches, pointsForWin, pointsForDraw, pointsForLoss, pointsForCloseGame, closeGameThreshold);

        const tournament: Tournament = {
          id: uuidv4(),
          name,
          description,
          format,
          matchType,
          status: 'upcoming',
          date,
          players,
          teams,
          matches,
          standings,
          pointsForWin,
          pointsForDraw,
          pointsForLoss,
          pointsForCloseGame,
          closeGameThreshold,
          randomizePerRound,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tournaments: [...state.tournaments, tournament],
        }));

        return tournament;
      },

      deleteTournament: (id) => {
        set((state) => ({
          tournaments: state.tournaments.filter((t) => t.id !== id),
        }));
      },

      updateMatchScore: (tournamentId, matchId, score1, score2) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            let updatedMatches: Match[];

            if (t.format === 'single_elim' || t.format === 'double_elim') {
              // For bracket formats, advance the winner
              updatedMatches = t.matches.map((m) => {
                if (m.id !== matchId) return m;
                return { ...m, score1, score2, status: 'completed' as const, winnerId: score1 > score2 ? m.team1Id : m.team2Id };
              });
              const match = updatedMatches.find((m) => m.id === matchId)!;
              if (match.winnerId) {
                updatedMatches = advanceBracket(updatedMatches, matchId, match.winnerId);
              }
            } else {
              // For round robin / league, just update the score
              updatedMatches = t.matches.map((m) => {
                if (m.id !== matchId) return m;
                const winnerId =
                  score1 > score2 ? m.team1Id : score2 > score1 ? m.team2Id : null;
                return {
                  ...m,
                  score1,
                  score2,
                  status: 'completed' as const,
                  winnerId,
                };
              });
            }

            const standings = calculateStandings(
              t.teams,
              updatedMatches,
              t.pointsForWin,
              t.pointsForDraw,
              t.pointsForLoss,
              t.pointsForCloseGame,
              t.closeGameThreshold
            );

            const allCompleted = updatedMatches.every(
              (m) => m.status === 'completed'
            );
            const anyInProgress = updatedMatches.some(
              (m) => m.status === 'completed'
            );

            return {
              ...t,
              matches: updatedMatches,
              standings,
              status: allCompleted
                ? 'completed'
                : anyInProgress
                  ? 'in_progress'
                  : 'upcoming',
            };
          }),
        }));
      },

      reRandomizePartners: (tournamentId) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            const teams = t.matchType === 'doubles' ? randomizePartners(t.players) : playersToTeams(t.players);
            let matches: Match[] = [];
            switch (t.format) {
              case 'round_robin':
                matches = generateRoundRobin(teams);
                break;
              case 'single_elim':
              case 'double_elim':
                matches = generateSingleElimBracket(teams);
                break;
              case 'league':
                matches = generateLeagueSchedule(teams);
                break;
            }
            const standings = calculateStandings(
              teams,
              matches,
              t.pointsForWin,
              t.pointsForDraw,
              t.pointsForLoss,
              t.pointsForCloseGame,
              t.closeGameThreshold
            );

            return {
              ...t,
              teams,
              matches,
              standings,
              status: 'upcoming',
            };
          }),
        }));
      },

      randomizeRoundTeams: (tournamentId, round) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            // Create new random teams from the player pool
            const newTeams = t.matchType === 'doubles'
              ? randomizePartners(t.players)
              : shuffle(playersToTeams(t.players));

            // Replace team IDs in the upcoming matches for this round
            const updatedMatches = t.matches.map((m) => {
              if (m.round !== round || m.status === 'completed') return m;
              // Find matching match index within the round
              const roundMatches = t.matches.filter((rm) => rm.round === round && rm.status !== 'completed');
              const idx = roundMatches.indexOf(m);
              const team1Idx = idx * 2;
              const team2Idx = idx * 2 + 1;
              return {
                ...m,
                team1Id: team1Idx < newTeams.length ? newTeams[team1Idx].id : m.team1Id,
                team2Id: team2Idx < newTeams.length ? newTeams[team2Idx].id : m.team2Id,
              };
            });

            // Merge new teams (keep old completed-match teams, add new ones)
            const allTeamIds = new Set(updatedMatches.flatMap((m) => [m.team1Id, m.team2Id].filter(Boolean)));
            const mergedTeams = [...t.teams.filter((tm) => allTeamIds.has(tm.id)), ...newTeams.filter((nt) => allTeamIds.has(nt.id) && !t.teams.some((tt) => tt.id === nt.id))];

            const standings = calculateStandings(
              mergedTeams,
              updatedMatches,
              t.pointsForWin,
              t.pointsForDraw,
              t.pointsForLoss,
              t.pointsForCloseGame,
              t.closeGameThreshold
            );

            return {
              ...t,
              teams: mergedTeams,
              matches: updatedMatches,
              standings,
            };
          }),
        }));
      },

      getTournament: (id) => {
        return get().tournaments.find((t) => t.id === id);
      },
    }),
    {
      name: 'tournament-storage',
    }
  )
);
