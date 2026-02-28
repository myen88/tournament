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
import { Check } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  tournamentId: string;
  teams: { id: string; name: string }[];
}

export default function MatchCard({ match, tournamentId, teams }: MatchCardProps) {
  const updateMatchScore = useTournamentStore((s) => s.updateMatchScore);
  const [open, setOpen] = useState(false);
  const [score1, setScore1] = useState(match.score1);
  const [score2, setScore2] = useState(match.score2);

  const team1 = teams.find((t) => t.id === match.team1Id);
  const team2 = teams.find((t) => t.id === match.team2Id);

  const handleSubmit = () => {
    updateMatchScore(tournamentId, match.id, score1, score2);
    setOpen(false);
  };

  if (!team1 && !team2) return null;

  return (
    <>
      <Card
        className={`cursor-pointer transition-all hover:border-emerald-500/50 ${
          match.status === 'completed' ? 'opacity-80' : ''
        }`}
        onClick={() => {
          if (team1 && team2) {
            setScore1(match.score1);
            setScore2(match.score2);
            setOpen(true);
          }
        }}
      >
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Match {match.matchNumber}</span>
            {match.status === 'completed' && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Check className="h-2.5 w-2.5 mr-0.5" />
                Final
              </Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <div
              className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                match.winnerId === match.team1Id
                  ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                  : 'bg-muted/30'
              }`}
            >
              <span className="text-sm truncate flex-1">
                {team1?.name || 'TBD'}
              </span>
              <span className="text-sm font-mono font-bold tabular-nums ml-2">
                {match.status === 'completed' ? match.score1 : '-'}
              </span>
            </div>

            <div
              className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                match.winnerId === match.team2Id
                  ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                  : 'bg-muted/30'
              }`}
            >
              <span className="text-sm truncate flex-1">
                {team2?.name || 'TBD'}
              </span>
              <span className="text-sm font-mono font-bold tabular-nums ml-2">
                {match.status === 'completed' ? match.score2 : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Score</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex-1 text-right">
                <p className="text-sm font-medium truncate">{team1?.name}</p>
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
                <p className="text-sm font-medium truncate">{team2?.name}</p>
              </div>
              <Input
                type="number"
                min={0}
                className="w-20 text-center text-lg font-bold"
                value={score2}
                onChange={(e) => setScore2(Number(e.target.value))}
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Save Score
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
