import React from "react";
import { Activity } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="border-b bg-background p-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Healthcare Document Analysis</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Hospital Network</p>
        </div>
      </div>
    </header>
  );
};

export default Header; 