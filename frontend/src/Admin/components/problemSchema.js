import { z } from "zod";

export const problemSchema = z.object({
  id: z.string().min(1, "Problem ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  input_description: z.string().min(1, "Input description is required"),
  output_description: z.string().min(1, "Output description is required"),
  sample_input: z.string().optional(),
  sample_output: z.string().optional(),
  time_limit_ms: z.number().int().positive().default(1000),
  memory_limit_mb: z.number().int().positive().default(64),
  test_cases: z.array(z.object({
    input: z.string(),
    output: z.string(),
    is_sample: z.boolean().default(false)
  })).optional()
});
