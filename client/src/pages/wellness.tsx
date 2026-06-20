import { FormEvent, useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, BookOpenText, HeartHandshake, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useCompanion, useCreateJournal, useJournals, useStressTriggers } from "@/hooks/use-wellness";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export default function Wellness() {
  const [entry, setEntry] = useState("");
  const [message, setMessage] = useState("");
  const [crisisSupportRequired, setCrisisSupportRequired] = useState(false);
  const journals = useJournals();
  const triggers = useStressTriggers();
  const createJournal = useCreateJournal();
  const companion = useCompanion();

  const triggerSummary = useMemo(() => {
    const counts = new Map<string, { count: number; totalIntensity: number }>();
    for (const trigger of triggers.data ?? []) {
      const current = counts.get(trigger.label) ?? { count: 0, totalIntensity: 0 };
      counts.set(trigger.label, { count: current.count + 1, totalIntensity: current.totalIntensity + trigger.intensity });
    }
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, count: value.count, intensity: Math.round(value.totalIntensity / value.count) }))
      .sort((a, b) => b.count - a.count);
  }, [triggers.data]);

  async function submitJournal(event: FormEvent) {
    event.preventDefault();
    if (entry.trim().length < 10) return;
    const result = await createJournal.mutateAsync(entry.trim());
    setCrisisSupportRequired(result.crisisSupportRequired);
    setEntry("");
  }

  async function submitMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    const result = await companion.mutateAsync(message.trim());
    setCrisisSupportRequired(result.crisisSupportRequired);
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="max-w-3xl space-y-2">
        <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Private reflection space</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Mental wellness</h1>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Notice patterns in study stress, write without a rigid rating scale, and take one manageable next step.
        </p>
      </header>

      {crisisSupportRequired && (
        <Alert role="alert" className="border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-50">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Get immediate human support</AlertTitle>
          <AlertDescription className="mt-2 leading-relaxed">
            This app cannot provide emergency care. Contact local emergency services now, move near a trusted person, and tell them clearly that you need immediate support. Do not stay alone with an immediate safety risk.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpenText className="h-5 w-5 text-blue-600" /> Daily journal</CardTitle>
              <CardDescription>What affected your energy, focus, or mood today?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitJournal} className="space-y-3">
                <label htmlFor="journal-entry" className="text-sm font-medium text-slate-800 dark:text-slate-100">Your reflection</label>
                <Textarea
                  id="journal-entry"
                  value={entry}
                  onChange={(event) => setEntry(event.target.value)}
                  rows={6}
                  maxLength={5000}
                  placeholder="For example: I felt overwhelmed after the mock exam and could not focus after lunch..."
                  aria-describedby="journal-help"
                />
                <div id="journal-help" className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>Supportive pattern detection only; this is not a medical diagnosis.</span>
                  <span>{entry.length}/5000</span>
                </div>
                {createJournal.error && <p role="alert" className="text-sm text-rose-700">{createJournal.error.message}</p>}
                <Button type="submit" disabled={entry.trim().length < 10 || createJournal.isPending} className="min-h-11">
                  {createJournal.isPending ? "Analyzing..." : "Save and reflect"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent reflections</CardTitle><CardDescription>Your latest journal entries and locally detected patterns.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {journals.isLoading && <p className="text-sm text-slate-500">Loading reflections...</p>}
              {journals.error && <p role="alert" className="text-sm text-rose-700">Could not load reflections.</p>}
              {journals.data?.length === 0 && <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">Your saved reflections will appear here.</p>}
              {journals.data?.slice(0, 6).map((journal) => (
                <article key={journal.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{journal.primaryEmotion}</Badge>
                    <Badge variant={journal.burnoutRisk ? "destructive" : "secondary"}>{journal.burnoutRisk ? "Burnout signals" : "No strong burnout signal"}</Badge>
                    <time className="ml-auto text-xs text-slate-500">{journal.createdAt ? format(new Date(journal.createdAt), "dd MMM, h:mm a") : "Recently"}</time>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{journal.content}</p>
                </article>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-600" /> Stress patterns</CardTitle><CardDescription>Last 30 days, based on your journal language.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {triggerSummary.length === 0 && <p className="text-sm text-slate-500">Add a reflection to begin seeing patterns.</p>}
              {triggerSummary.map((trigger) => (
                <div key={trigger.label} className="space-y-2">
                  <div className="flex justify-between gap-4 text-sm"><span className="font-medium">{trigger.label}</span><span className="text-slate-500">{trigger.count} mention{trigger.count === 1 ? "" : "s"}</span></div>
                  <Progress value={trigger.intensity * 10} aria-label={`${trigger.label} average intensity ${trigger.intensity} out of 10`} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><HeartHandshake className="h-5 w-5 text-emerald-600" /> Guided companion</CardTitle><CardDescription>Short coping prompts informed by recent themes.</CardDescription></CardHeader>
            <CardContent>
              {companion.data?.reply && <div aria-live="polite" className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50">{companion.data.reply}</div>}
              <form onSubmit={submitMessage} className="space-y-3">
                <label htmlFor="companion-message" className="text-sm font-medium">What feels hardest right now?</label>
                <Textarea id="companion-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={4} maxLength={2000} />
                {companion.error && <p role="alert" className="text-sm text-rose-700">{companion.error.message}</p>}
                <Button type="submit" disabled={!message.trim() || companion.isPending} className="min-h-11 w-full">
                  <Send className="mr-2 h-4 w-4" /> {companion.isPending ? "Responding..." : "Get a grounding step"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
