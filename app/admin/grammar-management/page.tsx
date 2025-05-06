"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import {
  FilePlus,
  FileSpreadsheet,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import ImportGrammarDialog from "@/components/admin/ImportGrammarDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GrammarManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const pageSize = 10;

  // Fetch grammar content with pagination and filtering
  const {
    data: grammarContent,
    isLoading,
    refetch,
  } = trpc.grammarContent.getAll.useQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    level: activeTab !== "all" ? activeTab : undefined,
  });

  // Delete grammar mutation
  const deleteGrammarMutation = trpc.grammarContent.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Grammar deleted",
        description: "The grammar content was deleted successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete grammar: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle delete grammar
  const handleDeleteGrammar = (id: number) => {
    if (confirm("Are you sure you want to delete this grammar content?")) {
      deleteGrammarMutation.mutate({ id });
    }
  };

  // Handle import completed
  const handleImportSuccess = () => {
    refetch();
    toast({
      title: "Import completed",
      description: "Grammar content imported successfully!",
      variant: "success",
    });
  };

  // Render level badge
  const renderLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return <Badge className="bg-green-500">Beginner</Badge>;
      case "intermediate":
        return <Badge className="bg-blue-500">Intermediate</Badge>;
      case "advanced":
        return <Badge className="bg-purple-500">Advanced</Badge>;
      default:
        return <Badge className="bg-gray-500">{level}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Grammar Management
            </h1>
            <p className="text-muted-foreground">
              Manage grammar content for English learning.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setImportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import Grammar
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Grammar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Grammar Content</CardTitle>
            <CardDescription>
              Browse, search, and manage all grammar content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for grammar content..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-fit"
                >
                  <TabsList>
                    <TabsTrigger value="all">All Levels</TabsTrigger>
                    <TabsTrigger value="beginner">Beginner</TabsTrigger>
                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Topics</TableHead>
                        <TableHead>Examples</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grammarContent?.items &&
                      grammarContent.items.length > 0 ? (
                        grammarContent.items.map((grammar) => (
                          <TableRow key={grammar.id}>
                            <TableCell className="font-medium">
                              {grammar.id}
                            </TableCell>
                            <TableCell>{grammar.title}</TableCell>
                            <TableCell>
                              {renderLevelBadge(grammar.level)}
                            </TableCell>
                            <TableCell>
                              {grammar.topic ? (
                                <span className="text-sm">
                                  {grammar.topic.name}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  No topic
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {grammar.examples ? (
                                <span className="text-sm">
                                  {grammar.examples.split(",").length} examples
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  No examples
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteGrammar(grammar.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No grammar content found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {grammarContent?.totalPages &&
                  grammarContent.totalPages > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {grammarContent.totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, grammarContent.totalPages)
                          )
                        }
                        disabled={currentPage === grammarContent.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Grammar Dialog */}
      <ImportGrammarDialog
        isOpen={importDialogOpen}
        setIsOpen={setImportDialogOpen}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
