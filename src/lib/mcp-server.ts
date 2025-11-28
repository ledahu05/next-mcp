/**
 * MCP Calculation Tools
 * Pure, isolated calculation tools compatible with Vercel AI SDK 5.x
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { CalculationResult } from './types';

/**
 * Schema for calculation arguments
 * Both numbers must be finite
 */
const calculationArgsSchema = z.object({
  a: z.number().finite().describe('First number'),
  b: z.number().finite().describe('Second number'),
});

type CalculationArgs = z.infer<typeof calculationArgsSchema>;

/**
 * Add two numbers together
 */
export const addTool = tool<CalculationArgs, CalculationResult>({
  description: 'Add two numbers together and return the sum. Use this when the user wants to add, sum, plus, or combine numbers.',
  inputSchema: calculationArgsSchema,
  execute: async ({ a, b }) => {
    return {
      result: a + b,
      operation: 'add',
      operands: [a, b],
    };
  },
});

/**
 * Subtract the second number from the first
 */
export const subtractTool = tool<CalculationArgs, CalculationResult>({
  description: 'Subtract the second number from the first number. Use this when the user wants to subtract, minus, or find the difference between numbers.',
  inputSchema: calculationArgsSchema,
  execute: async ({ a, b }) => {
    return {
      result: a - b,
      operation: 'subtract',
      operands: [a, b],
    };
  },
});

/**
 * Multiply two numbers together
 */
export const multiplyTool = tool<CalculationArgs, CalculationResult>({
  description: 'Multiply two numbers together and return the product. Use this when the user wants to multiply, times, or find the product of numbers.',
  inputSchema: calculationArgsSchema,
  execute: async ({ a, b }) => {
    return {
      result: a * b,
      operation: 'multiply',
      operands: [a, b],
    };
  },
});

/**
 * Divide the first number by the second
 * Handles division by zero gracefully
 */
export const divideTool = tool<CalculationArgs, CalculationResult>({
  description: 'Divide the first number by the second number. Use this when the user wants to divide, split, or find the quotient of numbers. Returns an error if dividing by zero.',
  inputSchema: calculationArgsSchema,
  execute: async ({ a, b }) => {
    if (b === 0) {
      return {
        result: 0,
        operation: 'divide',
        operands: [a, b],
        error: 'Division by zero is undefined. Please provide a non-zero divisor.',
      };
    }
    return {
      result: a / b,
      operation: 'divide',
      operands: [a, b],
    };
  },
});

/**
 * All calculation tools bundled for use with streamText
 */
export const calculationTools = {
  add: addTool,
  subtract: subtractTool,
  multiply: multiplyTool,
  divide: divideTool,
};
