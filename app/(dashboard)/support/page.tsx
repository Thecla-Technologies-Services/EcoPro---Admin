"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { SupportTicketTable } from "@/components/dashboard/support/ticket-table";
import { FeatureSuggestionTable } from "@/components/dashboard/support/feature-suggestion-table";
import { FaqEditor } from "@/components/dashboard/support/faq-editor";

const TABS = [
  { value: "tickets", label: "Support Tickets" },
  { value: "suggestions", label: "Feature Suggestions" },
  { value: "faq", label: "FAQ" },
];

/**
 * The three things the admin API's `/support` endpoints cover.
 *
 * Grouped on one page because they are three views of the same inbox rather
 * than three modules: tickets and suggestions are what users sent in, and the
 * FAQ is the standing answer to the questions that keep arriving.
 */
export default function SupportPage() {
  return (
    <div className="w-full space-y-6">
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>Support</PageHeader.Title>
          <PageHeader.Description>
            Handle reported issues, read what users are asking for, and maintain
            the help centre
          </PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      <Tabs defaultValue="tickets">
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList className="mb-6 h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="tickets">
          <SupportTicketTable />
        </TabsContent>
        <TabsContent value="suggestions">
          <FeatureSuggestionTable />
        </TabsContent>
        <TabsContent value="faq">
          <FaqEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
