import { createFileRoute } from '@tanstack/react-router'
import { serve } from "inngest/edge";

import { functions, inngest } from "@/inngest";

const handler = serve({ 
  client: inngest, 
  functions,
  servePath: "/api/inngest",
});

export const Route = createFileRoute('/api/inngest')({
  server: {
    handlers: {
        GET: async ({ request }) => {
            return handler(request);
        },
        POST: async ({ request }) => {
            return handler(request);
        },
        PUT: async ({ request }) => {
            return handler(request);
        },
    },
  },
});
