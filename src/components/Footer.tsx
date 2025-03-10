import React from "react";
import { Mail, Phone, HelpCircle } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-background p-4 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>Support: Call us at: 05... </span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>Email: support@hospital.org</span>
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>Need help? Contact IT department</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 