"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface LogbookFormProps {
  onClose: () => void;
}

export default function LogbookForm({ onClose }: LogbookFormProps) {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entry = formData.get('entry') as string;

    if (entry.trim()) {
      console.log("New Logbook Entry:", entry);
      toast({
        title: "Logbook Updated",
        description: "Your entry has been successfully recorded.",
      });
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Logbook entry cannot be empty.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <Textarea
        name="entry"
        placeholder="Describe the event or incident..."
        className="min-h-[120px]"
        required
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add Entry</Button>
      </div>
    </form>
  );
}
