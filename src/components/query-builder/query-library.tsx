"use client";

import { useState } from "react";
import { Clock, Save, Trash2 } from "lucide-react";

import {
  selectQueryHistory,
  selectSavedPresets,
  useQueryBuilderStore,
} from "@/features/query-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type QueryLibraryProps = {
  onLoadQuery?: () => void;
};

export function QueryLibrary({ onLoadQuery }: QueryLibraryProps) {
  const [presetName, setPresetName] = useState("");

  const queryHistory = useQueryBuilderStore(selectQueryHistory);
  const savedPresets = useQueryBuilderStore(selectSavedPresets);
  const saveCurrentQueryAsPreset = useQueryBuilderStore(
    (state) => state.saveCurrentQueryAsPreset,
  );
  const loadQueryTree = useQueryBuilderStore((state) => state.loadQueryTree);
  const deleteSavedPreset = useQueryBuilderStore(
    (state) => state.deleteSavedPreset,
  );
  const clearQueryHistory = useQueryBuilderStore(
    (state) => state.clearQueryHistory,
  );

  function handleSavePreset() {
    saveCurrentQueryAsPreset(presetName);
    setPresetName("");
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Query Library</p>
        <p className="text-sm leading-6 text-muted-foreground">
          Reuse recent query runs or save named presets for later.
        </p>
      </div>

      <Tabs defaultValue="history" className="mt-4">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline">{queryHistory.length} recent</Badge>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={queryHistory.length === 0}
              onClick={clearQueryHistory}
            >
              Clear History
            </Button>
          </div>

          {queryHistory.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Run a query to add it to history.
            </div>
          ) : (
            <div className="space-y-2">
              {queryHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <p className="text-sm font-medium">
                        {formatDateTime(entry.executedAt)}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Schema: {entry.schemaId}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadQueryTree(entry.schemaId, entry.queryTree);
                      onLoadQuery?.();
                    }}
                  >
                    Load
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="presets" className="mt-4 space-y-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={presetName}
              placeholder="Preset name"
              onChange={(event) => setPresetName(event.target.value)}
            />

            <Button
              type="button"
              variant="outline"
              disabled={presetName.trim() === ""}
              onClick={handleSavePreset}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Current
            </Button>
          </div>

          {savedPresets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No saved presets yet. Save the current query to reuse it later.
            </div>
          ) : (
            <div className="space-y-2">
              {savedPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{preset.name}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Schema: {preset.schemaId} • Saved{" "}
                      {formatDateTime(preset.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadQueryTree(preset.schemaId, preset.queryTree);
                        onLoadQuery?.();
                      }}
                    >
                      Load
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Delete preset ${preset.name}`}
                      onClick={() => deleteSavedPreset(preset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}