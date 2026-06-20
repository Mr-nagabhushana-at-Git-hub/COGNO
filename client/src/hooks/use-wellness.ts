import { useMutation, useQuery } from "@tanstack/react-query";
import type { Journal, StressTrigger } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface JournalResult {
  journal: Journal;
  triggers: StressTrigger[];
  crisisSupportRequired: boolean;
}

interface CompanionResult {
  reply: string;
  crisisSupportRequired: boolean;
  source: string;
}

export function useJournals() {
  return useQuery<Journal[]>({ queryKey: ["/api/journals"] });
}

export function useStressTriggers() {
  return useQuery<StressTrigger[]>({ queryKey: ["/api/stress-triggers?days=30"] });
}

export function useCreateJournal() {
  return useMutation<JournalResult, Error, string>({
    mutationFn: async (content) => {
      const response = await apiRequest("POST", "/api/journals", { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stress-triggers?days=30"] });
    },
  });
}

export function useCompanion() {
  return useMutation<CompanionResult, Error, string>({
    mutationFn: async (message) => {
      const response = await apiRequest("POST", "/api/companion/chat", { message });
      return response.json();
    },
  });
}
