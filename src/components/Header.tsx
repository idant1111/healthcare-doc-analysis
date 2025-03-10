import React from "react";

const Header: React.FC = () => {
  return (
    <header className="border-b bg-background p-4">
      <div className="mx-auto flex flex-col items-center max-w-4xl">
        <img 
          src="/MRKZGalil.png" 
          alt="Medical Center Galil Logo" 
          className="h-16 w-auto mb-3"
        />
        <div className="w-full flex items-center justify-between">
          <h1 className="text-xl font-bold">Healthcare Document Analysis</h1>
          <div className="text-sm text-muted-foreground">
            <p>Hospital Network</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 