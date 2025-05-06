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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

interface ImportGrammarDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onImportSuccess?: () => void;
}

export default function ImportGrammarDialog({
  isOpen,
  setIsOpen,
  onImportSuccess,
}: ImportGrammarDialogProps) {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Grammar import mutation
  const importGrammarMutation = trpc.grammarContent.importGrammar.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Import successful",
        description: `${data.imported} grammar items were imported successfully.`,
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
      if (csvFile) {
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

        importGrammarMutation.mutate({
          grammar: result.data,
        });
      } else {
        throw new Error("Please select a CSV file");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Grammar Data</DialogTitle>
          <DialogDescription>
            Import grammar content using CSV file format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with grammar data. The file should contain the
              required columns.
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
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <h3 className="font-medium text-blue-700 mb-1">
              CSV Format Guide:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
              <li>
                Required columns: <strong>title</strong>,{" "}
                <strong>content</strong>, <strong>level</strong>
              </li>
              <li>
                Optional columns: <strong>examples</strong> (comma-separated),{" "}
                <strong>note</strong>
              </li>
              <li>Level should be one of: beginner, intermediate, advanced</li>
              <li>The first row should be the header row with column names</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-3 rounded-md flex items-start gap-2">
            <FileSpreadsheet className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-700">
                Example CSV format:
              </h3>
              <p className="text-xs text-amber-600 font-mono">
                title,content,level,examples,note
                <br />
                Present Simple,Used for habits and routines,beginner,"I go to
                school, She works hard",Remember to add -s in third person
              </p>
            </div>
          </div>
        </div>

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
            disabled={isImporting || !csvFile}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isImporting ? (
              <>
                <span className="mr-2">Importing...</span>
                <div className="h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Grammar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
