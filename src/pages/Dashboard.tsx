import { Link } from 'react-router-dom';
import { useTournamentStore } from '@/store';
import { formatLabel } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Plus,
  Calendar,
  Users,
  Trash2,
} from 'lucide-react';

export default function Dashboard() {
  const tournaments = useTournamentStore((s) => s.tournaments);
  const deleteTournament = useTournamentStore((s) => s.deleteTournament);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tournaments</h1>
          <p className="text-muted-foreground">
            Manage and track your tournaments
          </p>
        </div>
        <Link to="/create">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Tournament
          </Button>
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-4 rounded-full bg-emerald-500/10">
              <Trophy className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No tournaments yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Create your first tournament to start managing brackets,
                round robin groups, and league play.
              </p>
            </div>
            <Link to="/create">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link key={t.id} to={`/tournament/${t.id}`}>
              <Card className="group hover:border-emerald-500/50 transition-all cursor-pointer h-full">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-emerald-500 transition-colors">
                        {t.name}
                      </h3>
                      {t.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm('Delete this tournament?')) {
                          deleteTournament(t.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{formatLabel(t.format)}</Badge>
                    <Badge
                      variant={
                        t.status === 'completed'
                          ? 'secondary'
                          : t.status === 'in_progress'
                            ? 'default'
                            : 'outline'
                      }
                      className={
                        t.status === 'in_progress'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : t.status === 'completed'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : ''
                      }
                    >
                      {t.status === 'in_progress'
                        ? 'In Progress'
                        : t.status === 'completed'
                          ? 'Completed'
                          : 'Upcoming'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {t.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {t.players.length} players
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {t.matches.filter((m) => m.status === 'completed').length}/
                        {t.matches.length} matches
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{
                          width: `${
                            t.matches.length > 0
                              ? (t.matches.filter((m) => m.status === 'completed').length /
                                  t.matches.length) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
