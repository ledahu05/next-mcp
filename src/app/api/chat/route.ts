/**
 * Chat API Route
 * Handles multimodal input (text, audio, documents) and streams responses
 */

import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { calculationTools } from '@/lib/mcp-server';
import type { ErrorResponse } from '@/lib/types';

// Initialize Google Gemini provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// System prompt instructing the agent on how to handle calculations
const SYSTEM_PROMPT = `You are a helpful AI calculator assistant. Your primary job is to help users perform mathematical calculations.

IMPORTANT INSTRUCTIONS:
1. When the user asks for a calculation (add, subtract, multiply, divide), you MUST use the appropriate calculation tool.
2. For AUDIO/VOICE input:
   - Listen to the audio carefully
   - Transcribe what the user is saying
   - Extract the numbers and mathematical operation from the speech
   - Use the appropriate calculation tool to perform the operation
   - Confirm what you heard (e.g., "I heard you say 'add 5 and 3'")
3. For DOCUMENT/IMAGE input:
   - Carefully analyze the image or PDF document
   - Extract ALL numbers visible in the document (prices, quantities, totals, etc.)
   - List the numbers you found and their context
   - If the user asks a specific question (e.g., "What is the total?"), perform the appropriate calculation
   - If no specific question is asked, summarize the numbers found and ask what calculation they'd like
   - For invoices/receipts: identify line items, subtotals, taxes, and totals
   - Use the calculation tools to perform any requested math operations
4. Always explain what operation you performed and show the calculation steps.
5. If division by zero is attempted, explain that it's undefined.
6. For non-mathematical queries, respond conversationally without using the tools.

Available operations:
- add: Add two numbers (sum, plus, combine, what is X plus Y)
- subtract: Subtract second from first (minus, difference, take away)
- multiply: Multiply two numbers (times, product, multiplied by)
- divide: Divide first by second (quotient, split, divided by)

Always be helpful and explain your calculations clearly.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    console.log('[API] Received messages:', JSON.stringify(messages, null, 2));

    // Convert UIMessage[] from client to ModelMessage[] for streamText
    const modelMessages = convertToModelMessages(messages);
    console.log('[API] Converted to model messages:', JSON.stringify(modelMessages, null, 2));

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools: calculationTools,
      stopWhen: stepCountIs(5), // Allow up to 5 steps for tool execution
      onFinish: ({ text, toolCalls, toolResults, steps }) => {
        console.log('[API] Stream finished');
        console.log('[API] Text:', text);
        console.log('[API] Steps:', steps.length);
        console.log('[API] Tool calls:', JSON.stringify(toolCalls, null, 2));
        console.log('[API] Tool results:', JSON.stringify(toolResults, null, 2));
      },
    });

    const response = result.toUIMessageStreamResponse();
    console.log('[API] Returning UI message stream response');
    return response;
  } catch (error) {
    console.error('Chat API error:', error);

    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'PROCESSING_ERROR',
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
