import type { Standing } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal } from 'lucide-react';

interface StandingsTableProps {
  standings: Standing[];
  teams: { id: string; name: string }[];
}

export default function StandingsTable({ standings, teams }: StandingsTableProps) {
  const getTeamName = (id: string) => teams.find((t) => t.id === id)?.name || 'Unknown';

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">#</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center w-12">P</TableHead>
            <TableHead className="text-center w-12">W</TableHead>
            <TableHead className="text-center w-12">D</TableHead>
            <TableHead className="text-center w-12">L</TableHead>
            <TableHead className="text-center w-16">GF</TableHead>
            <TableHead className="text-center w-16">GA</TableHead>
            <TableHead className="text-center w-16">GD</TableHead>
            <TableHead className="text-center w-16 font-bold">PTS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((s, i) => (
            <TableRow
              key={s.teamId}
              className={
                i === 0
                  ? 'bg-emerald-500/5'
                  : i <= 2
                    ? 'bg-emerald-500/[0.02]'
                    : ''
              }
            >
              <TableCell className="font-medium">
                <div className="flex items-center justify-center">
                  {i === 0 ? (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  ) : i === 1 ? (
                    <Medal className="h-4 w-4 text-gray-400" />
                  ) : i === 2 ? (
                    <Medal className="h-4 w-4 text-amber-700" />
                  ) : (
                    <span className="text-muted-foreground">{i + 1}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={i === 0 ? 'font-semibold text-emerald-500' : 'font-medium'}>
                  {getTeamName(s.teamId)}
                </span>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">{s.played}</TableCell>
              <TableCell className="text-center">{s.wins}</TableCell>
              <TableCell className="text-center text-muted-foreground">{s.draws}</TableCell>
              <TableCell className="text-center text-muted-foreground">{s.losses}</TableCell>
              <TableCell className="text-center">{s.scored}</TableCell>
              <TableCell className="text-center text-muted-foreground">{s.conceded}</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={
                    s.differential > 0
                      ? 'text-emerald-500 border-emerald-500/30'
                      : s.differential < 0
                        ? 'text-red-400 border-red-400/30'
                        : ''
                  }
                >
                  {s.differential > 0 ? '+' : ''}
                  {s.differential}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span className="font-bold text-lg">{s.points}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
