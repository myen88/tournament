# 🏓 BreakfastClub

A tournament organizer app built for pickleball — manage round robins, brackets, league play, and more.

## Features

- **Multiple Formats** — Round Robin, Single Elimination, Double Elimination, League Play
- **Singles & Doubles** — Choose 1v1 or 2v2 with automatic partner randomization
- **Live Scoring** — Click any match to enter scores with instant standings updates
- **Close Game Bonus** — Award bonus points for competitive losses within a configurable threshold
- **Standings Table** — Auto-calculated with W/D/L, goal differential, and medal rankings
- **Visual Brackets** — Bracket tree view for elimination formats with auto-advancement
- **Shuffle Per Round** — Optionally re-randomize teams before each league round
- **Local Persistence** — All data saved in localStorage via Zustand
- **Dark Mode UI** — Premium dark theme with shadcn/ui components

## Tech Stack

| Layer     | Tech                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| Runtime   | [Bun](https://bun.sh)                                                           |
| Framework | [React](https://react.dev) + [TypeScript](https://typescriptlang.org)           |
| Build     | [Vite](https://vite.dev)                                                        |
| UI        | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| State     | [Zustand](https://zustand.docs.pmnd.rs) (localStorage persistence)              |
| Routing   | [React Router](https://reactrouter.com)                                         |
| Deploy    | [Vercel](https://vercel.com)                                                    |

## Getting Started

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Build for production
bun run build
```

## Project Structure

```
src/
├── assets/          # Logo and static images
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── BracketView  # Elimination bracket visualization
│   ├── MatchCard    # Match card with score entry dialog
│   ├── StandingsTable # League standings with medals
│   └── PartnerRandomizer # Team shuffle display
├── pages/
│   ├── Dashboard    # Home with tournament cards
│   ├── CreateTournament # Multi-step creation wizard
│   └── TournamentDetail # Tournament view with tabs
├── store.ts         # Zustand store (CRUD, scoring, standings)
├── types.ts         # TypeScript interfaces
└── utils.ts         # Tournament engines (scheduling, brackets)
```

## License

MIT
