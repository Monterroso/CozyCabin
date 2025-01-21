# Phase 6: AI Integration & Knowledge Management

Incorporating the AI features outlined in:
- @project-overview.md
- @user-flow.md

## Features & Tasks

1. OpenAI API Setup  
   - [Frontend] Add optional AI-suggested replies in the agent interface (toggle to show/hide AI suggestions).  
   - [Frontend] Display disclaimers or highlight that an AI-generated reply is suggested, not final.  
   - [Backend] Create an AWS Lambda function to handle calls to the OpenAI API; do not store any keys in the repo (.env usage only).  
   - [Backend] Validate the request payload to ensure no sensitive data is sent to the AI unless authorized.

2. RAG-Based Knowledge Access  
   - [Frontend] Add a knowledge base area where agents can see or edit references.  
   - [Frontend] Provide a UI to fetch AI suggestions with relevant doc snippets from knowledge.  
   - [Backend] Implement a knowledge base DB model in Supabase.  
   - [Backend] Use the RAG approach (Retrieve, Augment, Generate) within the Lambda function to find relevant docs, then call OpenAI.

3. AI Ticket Routing & Classification  
   - [Frontend] Let admins enable or disable "AI-based ticket classification."  
   - [Backend] Extend the Lambda or create another function that classifies incoming tickets by category or priority.  
   - [Backend] Integrate classification output into the existing routing rules (e.g., a "billing" classification sets the queue to Billing Team automatically).

4. AI Summaries & Admin Dashboards  
   - [Frontend] Display AI-generated summaries of system statuses or ticket clusters for Admins.  
   - [Backend] Use the same AI Lambda approach to query ticket data, then generate short summaries for oversight.  
   - [Backend] Implement caching or rate-limiting to avoid excessive OpenAI usage.

5. Testing & Monitoring  
   - [Frontend] Unit test the UI toggles for AI suggestions, ensuring fallback to manual replies if AI fails.  
   - [Backend] Test the Lambda function in isolation, verifying correct queries to the OpenAI API.  
   - [Backend] Monitor performance and error rates in Sentry or AWS CloudWatch logs to ensure stable AI integration.  
   - [Frontend + Backend] Check correctness of AI-based routing, ensuring tickets are assigned accurately. 