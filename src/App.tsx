import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import CreateTournament from "@/pages/CreateTournament";
import TournamentDetail from "@/pages/TournamentDetail";
import { Home, PlusCircle } from "lucide-react";
import logo from "@/assets/logo.png";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-0.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <img src={logo} alt="Logo" className="h-11 w-11 invert" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Breakfast<span className="text-emerald-500">Club</span>
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/create"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/create"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Create
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-xl z-50">
        <div className="flex items-center justify-around py-2">
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === "/"
                ? "text-emerald-500"
                : "text-muted-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link
            to="/create"
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === "/create"
                ? "text-emerald-500"
                : "text-muted-foreground"
            }`}
          >
            <PlusCircle className="h-5 w-5" />
            Create
          </Link>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateTournament />} />
          <Route path="/tournament/:id" element={<TournamentDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
