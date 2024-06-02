import z from "zod";

const postIdeaSchema = z.object({
  title: z.string(),
  format: z.string(),
  platform: z.string(),
  content: z.string(),
  visual: z.string().optional(),
});

export const brainstormPostIdeasResponseSchema = z.object({
  posts: z.array(
    z.object({
      commitMessage: z.string(),
      postIdeas: z.array(postIdeaSchema),
    })
  ),
});

export type BrainstormPostIdeasResponse = z.infer<
  typeof brainstormPostIdeasResponseSchema
>;
