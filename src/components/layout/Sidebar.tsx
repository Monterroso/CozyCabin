import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
}

interface SidebarProps {
  items: NavItem[];
}

export function Sidebar({ items }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Icons.Logo className="h-6 w-6" />
          <span className="font-semibold">AIDesk</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = Icons[item.icon];
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 