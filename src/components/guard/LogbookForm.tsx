"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addLogbookEntry } from "@/app/actions";
import { Loader2 } from "lucide-react";

interface LogbookFormProps {
  onClose: () => void;
}

export default function LogbookForm({ onClose }: LogbookFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const entry = formData.get('entry') as string;

    const result = await addLogbookEntry(entry);

    if (result.success) {
      toast({
        title: "Logbook Updated",
        description: "Your entry has been successfully recorded.",
      });
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "An unexpected error occurred.",
      });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <Textarea
        name="entry"
        placeholder="Describe the event or incident..."
        className="min-h-[120px]"
        required
        disabled={isLoading}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Entry
        </Button>
      </div>
    </form>
  );
}
