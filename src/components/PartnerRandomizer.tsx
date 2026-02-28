import { useTournamentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Users } from 'lucide-react';

interface PartnerRandomizerProps {
  tournamentId: string;
  teams: { id: string; name: string; players: { id: string; name: string }[] }[];
}

export default function PartnerRandomizer({ tournamentId, teams }: PartnerRandomizerProps) {
  const reRandomizePartners = useTournamentStore((s) => s.reRandomizePartners);

  const isDoubles = teams.some((t) => t.players.length > 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-emerald-500" />
          {isDoubles ? 'Teams / Partners' : 'Players'}
        </CardTitle>
        {isDoubles && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Re-shuffle partners? This will reset all matches and scores.')) {
                reRandomizePartners(tournamentId);
              }
            }}
          >
            <Shuffle className="h-3.5 w-3.5 mr-1.5" />
            Re-shuffle
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {teams.map((team, i) => (
            <div
              key={team.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-transparent hover:border-emerald-500/20 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{team.name}</p>
                {isDoubles && team.players.length > 1 && (
                  <div className="flex gap-1 mt-1">
                    {team.players.map((p) => (
                      <Badge key={p.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {p.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
