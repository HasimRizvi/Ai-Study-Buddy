const User = require('../models/User');
const Material = require('../models/Material');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');
const connectDB = require('../config/db');
const { logActivity } = require('../controllers/authController');

const SAMPLE = {
  title: 'Photosynthesis - Biology',
  subject: 'Biology',
  content: `Photosynthesis is the process by which green plants, algae and some bacteria convert light energy into chemical energy stored as glucose. The process takes place mainly in the chloroplasts of plant cells, which contain the green pigment chlorophyll.

The overall balanced equation of photosynthesis is 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2. Carbon dioxide enters the leaf through stomata, which are tiny pores on the leaf surface controlled by guard cells.

Photosynthesis occurs in two main stages. The light-dependent reaction takes place in the thylakoid membrane. Chlorophyll absorbs photons of light, exciting electrons. These electrons pass through the electron transport chain, and water molecules are split to release oxygen as a by-product. ATP and NADPH are produced as energy carriers.

The light-independent reaction, also called the Calvin cycle, occurs in the stroma of the chloroplast. It does not require light directly but depends on ATP and NADPH from the light reaction. The enzyme RuBisCO fixes carbon dioxide onto ribulose-1,5-bisphosphate, producing glyceraldehyde-3-phosphate, which is used to build glucose.

The rate of photosynthesis is affected by several limiting factors: light intensity, carbon dioxide concentration, temperature and water availability. The relationship with light intensity follows a curve that rises steeply, plateaus when light is no longer the limiting factor, and then falls when excess light causes photoinhibition.

Limiting factors follow Blackman's law of the minimum, which states that a process is limited by the factor in shortest supply. Photosynthetic efficiency in crop plants can be improved through greenhouse management, CO2 enrichment and the use of LED grow lights in vertical farming.

Understanding photosynthesis is essential for agriculture, ecology and renewable energy research. Artificial photosynthesis aims to reproduce these natural reactions using catalysts, which could provide clean fuel for the future.`,
};

const connect = async () => {
  await connectDB();
  console.log('[Seed] Connected to MongoDB');

  const email = process.env.SEED_ADMIN_EMAIL || 'hasim@mohamedsathak.edu.in';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Hasim@2026';

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: 'Hasim Rizvi',
      email,
      password,
      role: 'admin',
      department: 'B.Sc. Computer Science',
      year: '3rd Year',
      college: 'Mohamed Sathak College of Arts and Science',
    });
    console.log(`[Seed] Admin created: ${email} / ${password}`);
  } else {
    console.log(`[Seed] Admin already exists: ${email}`);
  }

  let material = await Material.findOne({ userId: admin._id, title: SAMPLE.title });
  if (!material) {
    material = await Material.create({ userId: admin._id, ...SAMPLE });
    console.log(`[Seed] Sample material created: ${material.title}`);
  }

  const { generateSummary, generateFlashcards, generateQuiz } = require('./gemini');

  if ((await Summary.countDocuments({ materialId: material._id })) === 0) {
    const r = await generateSummary(material.title, material.subject, material.content);
    await Summary.create({
      userId: admin._id,
      materialId: material._id,
      summary: r.summary,
      keyPoints: r.keyPoints || [],
      generatedBy: r.generatedBy,
    });
    material.aiUsage.summary = true;
    await material.save();
    console.log('[Seed] Sample summary generated');
  }

  if ((await Flashcard.countDocuments({ materialId: material._id })) === 0) {
    const r = await generateFlashcards(material.title, material.subject, material.content, 8);
    if (r.cards && r.cards.length) {
      await Flashcard.insertMany(
        r.cards.map((c) => ({
          userId: admin._id,
          materialId: material._id,
          question: c.question,
          answer: c.answer,
          difficulty: c.difficulty || 'Medium',
        }))
      );
    }
    material.aiUsage.flashcards = 8;
    await material.save();
    console.log('[Seed] Sample flashcards generated');
  }

  if ((await Quiz.countDocuments({ materialId: material._id })) === 0) {
    const r = await generateQuiz(material.title, material.subject, material.content, 5);
    if (r.questions && r.questions.length) {
      await Quiz.create({
        userId: admin._id,
        materialId: material._id,
        title: `${material.subject} - ${material.title} Quiz`,
        questions: r.questions,
        generatedBy: r.generatedBy,
      });
    }
    material.aiUsage.quiz = true;
    await material.save();
    console.log('[Seed] Sample quiz generated');
  }

  const plan = await StudyPlan.create({
    userId: admin._id,
    subject: 'Biology',
    examDate: new Date(Date.now() + 7 * 86400000),
    availableHoursPerDay: 3,
    weakAreas: ['Light-independent reactions', 'Limiting factors'],
    studyPlan:
      'SUBJECT: Biology\nEXAM DATE: +7 days\n\n=== WEEK 1 (Day 1-4) ===\nFoundation: chloroplast structure, equation balancing\n\n=== WEEK 2 (Day 5-7) ===\nDeep revision: limiting factors and Blackmans law\n\n=== EXAM DAY ===\nRevise the summary only in the final hour.',
    dailyTasks: [
      { day: 1, focus: 'Photosynthesis basics', tasks: ['Read the material once', 'Write 5 flashcards'], duration: '3 hours' },
      { day: 2, focus: 'Light-dependent reaction', tasks: ['Diagram the thylakoid pathway', 'Attempt a 10 question quiz'], duration: '3 hours' },
    ],
    generatedBy: 'demo',
  });
  await logActivity(admin._id, 'CREATE_STUDY_PLAN', plan.subject, { seeded: true });

  console.log('\n==============================================');
  console.log(' Seed complete. Login credentials:');
  console.log(`   Email    : ${email}`);
  console.log(`   Password : ${password}`);
  console.log('==============================================\n');

  process.exit(0);
};

connect().catch((error) => {
  console.error(`[Seed] Failed: ${error.message}`);
  process.exit(1);
});
