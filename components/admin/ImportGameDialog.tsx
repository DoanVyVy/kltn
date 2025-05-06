"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, FileJson } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

interface ImportGameDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onImportSuccess?: () => void;
}

export default function ImportGameDialog({
  isOpen,
  setIsOpen,
  onImportSuccess,
}: ImportGameDialogProps) {
  const { toast } = useToast();
  const [importMethod, setImportMethod] = useState<"csv">("csv");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState("");
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Game import mutation
  const importGameMutation = trpc.games.importGames.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Import successful",
        description: `${data.imported} games were imported successfully.`,
      });
      setIsOpen(false);
      resetForm();
      if (onImportSuccess) {
        onImportSuccess();
      }
    },
    onError: (err) => {
      setError(`Import failed: ${err.message}`);
      toast({
        title: "Import failed",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsImporting(false);
    },
  });

  const handleImport = async () => {
    setError("");
    setIsImporting(true);

    try {
      if (importMethod === "csv" && csvFile) {
        // Parse CSV file
        const result = await new Promise<any>((resolve, reject) => {
          Papa.parse(csvFile, {
            header: true,
            complete: (results) => resolve(results),
            error: (error) => reject(error),
          });
        });

        if (result.errors && result.errors.length > 0) {
          throw new Error(`CSV parsing error: ${result.errors[0].message}`);
        }

        importGameMutation.mutate({
          games: result.data,
          format: "csv",
        });
      } else {
        throw new Error("Please select a file or enter valid JSON content");
      }
    } catch (err) {
      setError((err as Error).message);
      toast({
        title: "Import error",
        description: (err as Error).message,
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setCsvFile(null);
    setJsonContent("");
    setError("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Game Data</DialogTitle>
          <DialogDescription>
            Import game data using CSV file or JSON format
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={importMethod}
          onValueChange={(value) => setImportMethod(value as "csv")}
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with game data. The file should contain
                columns matching the game structure.
              </p>
              <div className="flex flex-col gap-1.5">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCsvFile(e.target.files[0]);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Required columns: type, title, description, difficulty
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="font-medium text-blue-700 mb-1">
                CSV Format Guide:
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li>
                  For <strong>word-guess</strong>: Include "words" column with
                  comma-separated words
                </li>
                <li>
                  For <strong>sentence-scramble</strong>: Include "original"
                  column with sentences
                </li>
                <li>
                  For <strong>word-association</strong>: Include "word" and
                  "association" columns
                </li>
                <li>
                  For <strong>idiom-challenge</strong>: Include "idiom",
                  "meaning", and "explanation" columns
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              isImporting ||
              (importMethod === "csv" && !csvFile) ||
              (importMethod === "json" && !jsonContent)
            }
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isImporting ? "Importing..." : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
