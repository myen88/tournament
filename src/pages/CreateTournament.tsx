import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTournamentStore } from '@/store';
import type { Player, TournamentFormat, MatchType } from '@/types';
import { formatLabel } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Users,
  GitBranch,
  BarChart3,
  Shuffle,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  UsersRound,
} from 'lucide-react';

const FORMAT_OPTIONS: {
  value: TournamentFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'round_robin',
    label: 'Round Robin',
    description: 'Every team plays against every other team',
    icon: <Users className="h-6 w-6" />,
  },
  {
    value: 'single_elim',
    label: 'Single Elimination',
    description: 'Lose once and you\'re out. Last team standing wins.',
    icon: <GitBranch className="h-6 w-6" />,
  },
  {
    value: 'double_elim',
    label: 'Double Elimination',
    description: 'Two losses to be eliminated. Winners & losers brackets.',
    icon: <Trophy className="h-6 w-6" />,
  },
  {
    value: 'league',
    label: 'League Play',
    description: 'Season-style play with points. Home & away rounds.',
    icon: <BarChart3 className="h-6 w-6" />,
  },
];

export default function CreateTournament() {
  const navigate = useNavigate();
  const createTournament = useTournamentStore((s) => s.createTournament);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<TournamentFormat>('round_robin');
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('doubles');
  const [randomizePerRound, setRandomizePerRound] = useState(false);
  const [pointsForWin, setPointsForWin] = useState(3);
  const [pointsForDraw, setPointsForDraw] = useState(1);
  const [pointsForLoss, setPointsForLoss] = useState(0);
  const [pointsForCloseGame, setPointsForCloseGame] = useState(1);
  const [closeGameThreshold, setCloseGameThreshold] = useState(3);

  const addPlayer = () => {
    if (playerName.trim()) {
      setPlayers([...players, { id: uuidv4(), name: playerName.trim() }]);
      setPlayerName('');
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleCreate = () => {
    const t = createTournament({
      name,
      description,
      format,
      date,
      players,
      matchType,
      randomizePerRound: format === 'league' ? randomizePerRound : false,
      pointsForWin,
      pointsForDraw,
      pointsForLoss,
      pointsForCloseGame: format === 'league' || format === 'round_robin' ? pointsForCloseGame : 0,
      closeGameThreshold,
    });
    navigate(`/tournament/${t.id}`);
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return name.trim().length > 0;
      case 1:
        return true;
      case 2: {
        const minPlayers = matchType === 'doubles' ? 4 : 2;
        const needsEven = matchType === 'doubles';
        return players.length >= minPlayers && (!needsEven || players.length % 2 === 0);
      }
      case 3:
        return true;
      default:
        return false;
    }
  };

  const steps = ['Info', 'Format', 'Players', 'Review'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                i < step
                  ? 'bg-emerald-500 text-white'
                  : i === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`ml-2 text-sm hidden sm:inline ${
                i === step ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-2 ${
                  i < step ? 'bg-emerald-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-500" />
              Tournament Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Spring Pickleball Championship"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Format */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Format</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FORMAT_OPTIONS.map((opt) => (
              <Card
                key={opt.value}
                className={`cursor-pointer transition-all hover:border-emerald-500/50 ${
                  format === opt.value
                    ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                    : ''
                }`}
                onClick={() => setFormat(opt.value)}
              >
                <CardContent className="pt-6 space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        format === opt.value
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {opt.icon}
                    </div>
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm text-muted-foreground">{opt.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(format === 'round_robin' || format === 'league') && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-medium">Point System</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="pfw">Win</Label>
                    <Input
                      id="pfw"
                      type="number"
                      min={0}
                      value={pointsForWin}
                      onChange={(e) => setPointsForWin(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pfd">Draw</Label>
                    <Input
                      id="pfd"
                      type="number"
                      min={0}
                      value={pointsForDraw}
                      onChange={(e) => setPointsForDraw(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pfl">Loss</Label>
                    <Input
                      id="pfl"
                      type="number"
                      min={0}
                      value={pointsForLoss}
                      onChange={(e) => setPointsForLoss(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">Close Game Bonus</h4>
                    <Badge variant="outline" className="text-xs">Losing team</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Award bonus points to the losing team when the score differential is less than the threshold
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="pfcg">Bonus Pts</Label>
                      <Input
                        id="pfcg"
                        type="number"
                        min={0}
                        value={pointsForCloseGame}
                        onChange={(e) => setPointsForCloseGame(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cgt">Threshold ({'<'} diff)</Label>
                      <Input
                        id="cgt"
                        type="number"
                        min={1}
                        value={closeGameThreshold}
                        onChange={(e) => setCloseGameThreshold(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {format === 'league' && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shuffle className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Randomize Teams Per Round</p>
                    <p className="text-xs text-muted-foreground">
                      Shuffle players into new random teams before each round
                    </p>
                  </div>
                  <button
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      randomizePerRound ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    }`}
                    onClick={() => setRandomizePerRound(!randomizePerRound)}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        randomizePerRound ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Players */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              Add Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                autoFocus
              />
              <Button onClick={addPlayer} size="icon" variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Match Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    matchType === 'singles'
                      ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                      : 'border-border hover:border-emerald-500/30'
                  }`}
                  onClick={() => setMatchType('singles')}
                >
                  <div className={`p-2 rounded-lg ${matchType === 'singles' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Singles</p>
                    <p className="text-xs text-muted-foreground">1 vs 1</p>
                  </div>
                </button>
                <button
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    matchType === 'doubles'
                      ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                      : 'border-border hover:border-emerald-500/30'
                  }`}
                  onClick={() => setMatchType('doubles')}
                >
                  <div className={`p-2 rounded-lg ${matchType === 'doubles' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Doubles</p>
                    <p className="text-xs text-muted-foreground">2 vs 2</p>
                  </div>
                </button>
              </div>
            </div>

            {players.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {players.length} player{players.length !== 1 ? 's' : ''} added
                </p>
                <div className="flex flex-wrap gap-2">
                  {players.map((p) => (
                    <Badge
                      key={p.id}
                      variant="secondary"
                      className="gap-1 pr-1 text-sm"
                    >
                      {p.name}
                      <button
                        onClick={() => removePlayer(p.id)}
                        className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {players.length < (matchType === 'doubles' ? 4 : 2) && (
              <p className="text-sm text-amber-500">
                Add at least {matchType === 'doubles' ? '4' : '2'} players to continue
              </p>
            )}
            {matchType === 'doubles' && players.length % 2 !== 0 && players.length >= 4 && (
              <p className="text-sm text-amber-500">
                Add an even number of players for doubles
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Format</p>
                <Badge variant="outline">{formatLabel(format)}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Players</p>
                <p className="font-medium">{players.length}</p>
              </div>
              {matchType === 'doubles' && (
                <div className="col-span-2">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    <UsersRound className="h-3 w-3 mr-1" />
                    Doubles (2v2)
                  </Badge>
                </div>
              )}
              {matchType === 'singles' && (
                <div className="col-span-2">
                  <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30">
                    <User className="h-3 w-3 mr-1" />
                    Singles (1v1)
                  </Badge>
                </div>
              )}
              {randomizePerRound && format === 'league' && (
                <div className="col-span-2">
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                    <Shuffle className="h-3 w-3 mr-1" />
                    Randomize Teams Per Round
                  </Badge>
                </div>
              )}
            </div>
            {description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step === 0 ? navigate('/') : setStep(step - 1))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        )}
      </div>
    </div>
  );
}
