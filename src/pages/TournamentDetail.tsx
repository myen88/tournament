import { useParams, Link } from 'react-router-dom';
import { useTournamentStore } from '@/store';
import { formatLabel } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import BracketView from '@/components/BracketView';
import PartnerRandomizer from '@/components/PartnerRandomizer';
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  Shuffle,
} from 'lucide-react';

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const tournament = useTournamentStore((s) => s.getTournament(id!));
  const randomizeRoundTeams = useTournamentStore((s) => s.randomizeRoundTeams);

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Tournament not found</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const isBracket = tournament.format === 'single_elim' || tournament.format === 'double_elim';

  // Group matches by round
  const roundsMap = new Map<number, typeof tournament.matches>();
  tournament.matches.forEach((m) => {
    const arr = roundsMap.get(m.round) || [];
    arr.push(m);
    roundsMap.set(m.round, arr);
  });
  const rounds = Array.from(roundsMap.entries()).sort(([a], [b]) => a - b);

  const completedCount = tournament.matches.filter((m) => m.status === 'completed').length;
  const totalCount = tournament.matches.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{tournament.name}</h1>
            {tournament.description && (
              <p className="text-muted-foreground">{tournament.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{formatLabel(tournament.format)}</Badge>
            <Badge
              className={
                tournament.status === 'in_progress'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : tournament.status === 'completed'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : ''
              }
              variant={tournament.status === 'upcoming' ? 'outline' : 'default'}
            >
              {tournament.status === 'in_progress'
                ? 'In Progress'
                : tournament.status === 'completed'
                  ? 'Completed'
                  : 'Upcoming'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {tournament.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {tournament.players.length} players · {tournament.teams.length} teams
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            {completedCount}/{totalCount} matches
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={isBracket ? 'bracket' : 'schedule'}>
        <TabsList className="w-full sm:w-auto">
          {isBracket ? (
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
          ) : (
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          )}
          {!isBracket && <TabsTrigger value="standings">Standings</TabsTrigger>}
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        {/* Schedule tab (round robin / league) */}
        <TabsContent value="schedule" className="space-y-6 mt-6">
          {rounds.map(([round, roundMatches]) => {
            const hasUpcoming = roundMatches.some((m) => m.status !== 'completed');
            return (
            <div key={round} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Round {round}
                </h3>
                {tournament.randomizePerRound && hasUpcoming && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => randomizeRoundTeams(tournament.id, round)}
                  >
                    <Shuffle className="h-3.5 w-3.5 mr-1.5" />
                    Shuffle Teams
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    tournamentId={tournament.id}
                    teams={tournament.teams}
                  />
                ))}
              </div>
            </div>
          );
          })}
        </TabsContent>

        {/* Bracket tab (elimination) */}
        <TabsContent value="bracket" className="mt-6">
          <BracketView
            matches={tournament.matches}
            teams={tournament.teams}
            tournamentId={tournament.id}
          />
        </TabsContent>

        {/* Standings tab */}
        <TabsContent value="standings" className="mt-6">
          <StandingsTable
            standings={tournament.standings}
            teams={tournament.teams}
          />
        </TabsContent>

        {/* Teams tab */}
        <TabsContent value="teams" className="mt-6">
          <PartnerRandomizer
            tournamentId={tournament.id}
            teams={tournament.teams}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
