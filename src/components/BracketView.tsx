import { useState } from 'react';
import { useTournamentStore } from '@/store';
import type { Match } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface BracketViewProps {
  matches: Match[];
  teams: { id: string; name: string }[];
  tournamentId: string;
}

export default function BracketView({ matches, teams, tournamentId }: BracketViewProps) {
  const updateMatchScore = useTournamentStore((s) => s.updateMatchScore);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  const getTeamName = (id: string | null) =>
    id ? teams.find((t) => t.id === id)?.name || 'Unknown' : 'TBD';

  // Group matches by round
  const rounds = new Map<number, Match[]>();
  matches.forEach((m) => {
    const roundMatches = rounds.get(m.round) || [];
    roundMatches.push(m);
    rounds.set(m.round, roundMatches);
  });

  const sortedRounds = Array.from(rounds.entries()).sort(([a], [b]) => a - b);
  const totalRounds = sortedRounds.length;

  const getRoundLabel = (round: number, index: number) => {
    if (index === totalRounds - 1) return 'Finals';
    if (index === totalRounds - 2) return 'Semifinals';
    if (index === totalRounds - 3) return 'Quarterfinals';
    return `Round ${round}`;
  };

  // Find champion
  const finalMatch = sortedRounds.length > 0 ? sortedRounds[sortedRounds.length - 1][1][0] : null;
  const champion = finalMatch?.winnerId ? getTeamName(finalMatch.winnerId) : null;

  const handleSubmit = () => {
    if (!selectedMatch) return;
    updateMatchScore(tournamentId, selectedMatch.id, score1, score2);
    setSelectedMatch(null);
  };

  const openScoreDialog = (match: Match) => {
    if (match.team1Id && match.team2Id && match.status !== 'completed') {
      setScore1(match.score1);
      setScore2(match.score2);
      setSelectedMatch(match);
    }
  };

  return (
    <div className="space-y-6">
      {champion && (
        <Card className="bg-gradient-to-r from-yellow-500/10 via-emerald-500/10 to-yellow-500/10 border-yellow-500/30">
          <CardContent className="py-4 flex items-center justify-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Champion</p>
              <p className="text-xl font-bold text-yellow-500">{champion}</p>
            </div>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max items-start">
          {sortedRounds.map(([round, roundMatches], roundIndex) => (
            <div key={round} className="flex flex-col gap-4 min-w-[200px]">
              <h3 className="text-sm font-semibold text-center text-muted-foreground uppercase tracking-wider">
                {getRoundLabel(round, roundIndex)}
              </h3>

              <div
                className="flex flex-col justify-around flex-1"
                style={{
                  gap: `${Math.pow(2, roundIndex) * 16}px`,
                  paddingTop: `${Math.pow(2, roundIndex) * 8 - 8}px`,
                }}
              >
                {roundMatches.map((match) => (
                  <Card
                    key={match.id}
                    className={`cursor-pointer transition-all hover:border-emerald-500/50 ${
                      match.status === 'completed'
                        ? 'border-muted'
                        : match.team1Id && match.team2Id
                          ? 'border-primary/30'
                          : 'border-dashed'
                    }`}
                    onClick={() => openScoreDialog(match)}
                  >
                    <CardContent className="py-2 px-3 space-y-1">
                      <div
                        className={`flex items-center justify-between py-1 px-2 rounded text-sm ${
                          match.winnerId === match.team1Id
                            ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                            : ''
                        }`}
                      >
                        <span className="truncate flex-1">
                          {getTeamName(match.team1Id)}
                        </span>
                        <span className="font-mono font-bold ml-2 tabular-nums">
                          {match.status === 'completed' ? match.score1 : ''}
                        </span>
                      </div>
                      <div className="border-t border-dashed" />
                      <div
                        className={`flex items-center justify-between py-1 px-2 rounded text-sm ${
                          match.winnerId === match.team2Id
                            ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                            : ''
                        }`}
                      >
                        <span className="truncate flex-1">
                          {getTeamName(match.team2Id)}
                        </span>
                        <span className="font-mono font-bold ml-2 tabular-nums">
                          {match.status === 'completed' ? match.score2 : ''}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedMatch} onOpenChange={(o) => !o && setSelectedMatch(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Score</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium truncate">
                    {getTeamName(selectedMatch.team1Id)}
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  className="w-20 text-center text-lg font-bold"
                  value={score1}
                  onChange={(e) => setScore1(Number(e.target.value))}
                  autoFocus
                />
              </div>
              <div className="text-center text-xs text-muted-foreground">VS</div>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium truncate">
                    {getTeamName(selectedMatch.team2Id)}
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  className="w-20 text-center text-lg font-bold"
                  value={score2}
                  onChange={(e) => setScore2(Number(e.target.value))}
                />
              </div>
              <Badge variant="outline" className="text-xs">
                Winner advances to next round
              </Badge>
              <Button
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={score1 === score2}
              >
                Save Score
              </Button>
              {score1 === score2 && (
                <p className="text-xs text-amber-500 text-center">
                  Scores cannot be tied in elimination brackets
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
