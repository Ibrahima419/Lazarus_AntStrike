import { Search, Bell, User, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
// Import SVG from public directory - Vite serves public files directly
const logoIcon = './AnStrikes.svg';

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
        
        <div className="hidden sm:flex items-center gap-2">
          <img src={logoIcon} alt="AntStrike" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(17%) sepia(94%) saturate(7500%) hue-rotate(356deg) brightness(91%) contrast(118%)' }} />
          <span className="font-semibold text-sm">ANTSRIKE</span>
        </div>
        
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search threats, indicators, entities..." 
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0">
            3
          </Badge>
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">Admin User</div>
            <div className="text-xs text-muted-foreground">administrator</div>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}