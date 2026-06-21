import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/db';
import { inferSixWThreeH } from './services/aiAgent.service';
import { extractAssumptions } from './services/assumptionExtractor.service';
import { generateMilestones } from './services/milestoneGenerator.service';
import { recommendFirstStep } from './services/firstStepRecommender.service';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Helper for session (simulated)
async function getUser() {
  let user = await db.user.findFirst();
  if (!user) {
    user = await db.user.create({
      data: {
        email: "founder@example.com",
        name: "Demo Founder",
      },
    });
  }
  return user;
}

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/session', async (_req, res) => {
  const user = await getUser();
  res.json({ user });
});

app.get('/api/roadmaps', async (_req, res) => {
  const user = await getUser();
  const roadmaps = await db.roadmap.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { assumptions: true, milestones: true } } }
  });
  if (roadmaps.length === 0) {
    res.status(404).json({ error: "No roadmaps" });
    return;
  }
  res.json({ roadmaps });
});

app.post('/api/intake', async (req, res) => {
  try {
    const user = await getUser();
    const { rawIdea, sixWThreeH } = req.body;
    
    // Agent 1: Infer gaps
    const finalSixW3H = await inferSixWThreeH(rawIdea, sixWThreeH ?? {});
    
    const roadmap = await db.roadmap.create({
      data: {
        userId: user.id,
        title: rawIdea.slice(0, 80),
        rawIdea,
        sixW3hSummary: JSON.stringify(finalSixW3H),
        status: "draft"
      }
    });
    res.json({ roadmap });
  } catch (error) {
    console.error("Intake Error:", error);
    res.status(500).json({ error: "Failed to process intake" });
  }
});

app.get('/api/intake/:id', async (req, res) => {
  const roadmap = await db.roadmap.findUnique({ where: { id: req.params.id } });
  if (!roadmap) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ roadmap });
});

app.get('/api/assumptions/:id', async (req, res) => {
  const assumptions = await db.assumption.findMany({
    where: { roadmapId: req.params.id },
    orderBy: { createdAt: "desc" }
  });
  res.json({ assumptions });
});

app.post('/api/assumptions/:id/generate', async (req, res) => {
  try {
    const roadmap = await db.roadmap.findUnique({ where: { id: req.params.id } });
    if (!roadmap) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    const inferred = await extractAssumptions(roadmap.rawIdea, roadmap.sixW3hSummary);
    
    await db.assumption.createMany({
      data: inferred.map(a => ({
        roadmapId: roadmap.id,
        statement: a.statement,
        riskLevel: a.riskLevel,
        isValidated: "pending"
      }))
    });
    
    const created = await db.assumption.findMany({
      where: { roadmapId: roadmap.id },
      orderBy: { createdAt: "desc" }
    });
    
    await db.roadmap.update({ where: { id: roadmap.id }, data: { status: "assumptions" } });
    res.json({ assumptions: created });
  } catch (error) {
    console.error("Assumptions Error:", error);
    res.status(500).json({ error: "Failed to generate assumptions" });
  }
});

app.patch('/api/assumptions/validate/:id', async (req, res) => {
  try {
    const assumption = await db.assumption.update({
      where: { id: req.params.id },
      data: { isValidated: req.body.state }
    });
    res.json({ assumption });
  } catch (error) {
    console.error("Assumption Validate Error:", error);
    res.status(500).json({ error: "Failed to validate assumption" });
  }
});

app.get('/api/milestones/:id', async (req, res) => {
  const milestones = await db.milestone.findMany({
    where: { roadmapId: req.params.id },
    orderBy: [{ dayBucket: 'asc' }, { orderIndex: 'asc' }]
  });
  res.json({ milestones });
});

app.post('/api/milestones/:id/generate', async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const roadmap = await db.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    const generated = await generateMilestones(
      roadmap.rawIdea,
      roadmap.sixW3hSummary
    );
    
    await db.milestone.createMany({
      data: generated.map((m, i) => ({
        roadmapId,
        title: m.title,
        description: m.description,
        dayBucket: m.dayBucket,
        orderIndex: i,
        isAccepted: false
      }))
    });
    
    const created = await db.milestone.findMany({
      where: { roadmapId },
      orderBy: [{ dayBucket: 'asc' }, { orderIndex: 'asc' }]
    });
    
    await db.roadmap.update({ where: { id: roadmapId }, data: { status: "milestones" } });
    res.json({ milestones: created });
  } catch (error) {
    console.error("Milestones Error:", error);
    res.status(500).json({ error: "Failed to generate milestones" });
  }
});

app.patch('/api/milestones/:id/accept', async (req, res) => {
  const milestone = await db.milestone.update({
    where: { id: req.params.id },
    data: { isAccepted: true, acceptedAt: new Date() }
  });
  res.json({ milestone });
});

app.get('/api/first-step/:id', async (req, res) => {
  const firstSteps = await db.firstStep.findMany({
    where: { roadmapId: req.params.id },
    orderBy: { createdAt: "desc" },
    take: 1
  });
  res.json({ firstStep: firstSteps[0] || null });
});

app.post('/api/first-step/:id/recommend', async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const roadmap = await db.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const milestones = await db.milestone.findMany({ where: { roadmapId } });
    
    const recommended = await recommendFirstStep(
      roadmap.rawIdea,
      milestones
    );
    
    const step = await db.firstStep.create({
      data: {
        roadmapId,
        action: recommended.action,
        rationale: recommended.rationale,
        estimatedTimeHours: recommended.estimatedTimeHours
      }
    });
    
    await db.roadmap.update({ where: { id: roadmapId }, data: { status: "complete" } });
    res.json({ firstStep: step });
  } catch (error) {
    console.error("First Step Error:", error);
    res.status(500).json({ error: "Failed to recommend first step" });
  }
});

app.delete('/api/roadmaps/:id', async (req, res) => {
  try {
    await db.roadmap.delete({ where: { id: req.params.id } });
    res.json({ deleted: true, id: req.params.id });
  } catch (_error) {
    res.status(404).json({ error: "Roadmap not found" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
