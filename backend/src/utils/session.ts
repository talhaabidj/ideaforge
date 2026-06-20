import { db } from "./db";

// The teammate's backend assumed an authenticated `userId` on every intake
// POST. The sandbox has no auth provider, so we lazily provision a single
// default "founder" user and hand its id back to the frontend as a session.
// This keeps the API contract identical (intake still requires a userId)
// while removing the auth burden for the hackathon demo.

const DEFAULT_EMAIL = "founder@ideaforge.local";

export const getOrCreateDefaultUser = async () => {
  const existing = await db.user.findFirst({
    where: { email: DEFAULT_EMAIL },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return db.user.create({
    data: {
      email: DEFAULT_EMAIL,
      name: "Founder",
    },
  });
};
