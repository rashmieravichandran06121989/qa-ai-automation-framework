import { z } from 'zod';

// Committed contract schemas for the jsonplaceholder resources we
// exercise. Tests parse response bodies through these — if the shape
// drifts, parsing throws with a readable path, and you get a real
// contract failure instead of a "toMatchObject passed but the data
// is nonsense" false negative.

export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    suite: z.string().optional(),
    city: z.string(),
    zipcode: z.string().optional(),
    geo: z.object({ lat: z.string(), lng: z.string() }).optional(),
  }),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string().optional(),
    bs: z.string().optional(),
  }),
});

export const PostSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  title: z.string().min(1),
  body: z.string().min(1),
});

// Write-side echoes — POST/PUT/PATCH on jsonplaceholder return the
// payload back with (at least) a server-assigned id. Partial so PATCH
// responses that omit untouched fields still parse.
export const PostEchoSchema = PostSchema.partial().extend({
  id: z.number().int().positive(),
});

export type User = z.infer<typeof UserSchema>;
export type Post = z.infer<typeof PostSchema>;
