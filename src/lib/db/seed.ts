import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import crypto from "crypto";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

async function main() {
  console.log("Seeding database with updated IELTS practice tests...");
  const connection = await mysql.createConnection(connectionString!);
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // 1. Clean existing records (foreign keys cascade or we delete child tables first)
    console.log("Cleaning old data...");
    await db.delete(schema.readingQuestions);
    await db.delete(schema.readingSubmissions);
    await db.delete(schema.readingPassages);

    await db.delete(schema.listeningQuestions);
    await db.delete(schema.listeningSubmissions);
    await db.delete(schema.listeningTests);

    await db.delete(schema.speakingSubmissions);
    await db.delete(schema.speakingTests);

    await db.delete(schema.writingSubmissions);
    await db.delete(schema.writingTests);

    console.log("Inserting new IELTS data...");

    // ─── 1. SEED WRITING TESTS (8 Tests: Task 1 & Task 2) ──────────────────────────
    const wtIds = Array.from({ length: 8 }, () => crypto.randomUUID());

    await db.insert(schema.writingTests).values([
      {
        id: wtIds[0],
        title: "Energy Consumption in the UK (Task 1)",
        task: "task1",
        prompt: "The graph below shows energy consumption by fuel type in the United Kingdom from 1981 to 2008. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
        imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
        timeMinutes: 20,
        difficulty: "medium",
        isPublished: true,
      },
      {
        id: wtIds[1],
        title: "Should Higher Education be Free? (Task 2)",
        task: "task2",
        prompt: "Some people believe that university education should be free for everyone, regardless of their income level. Others argue that students should pay for their tuition fees as they are the ones who benefit from it. Discuss both views and give your opinion. Write at least 250 words.",
        timeMinutes: 40,
        difficulty: "hard",
        isPublished: true,
      },
      {
        id: wtIds[2],
        title: "NYC Airport Visitors 1995-2000 (Task 1)",
        task: "task1",
        prompt: "The chart below shows the number of travelers using three major airports in New York City (John F. Kennedy, LaGuardia, Newark) between 1995 and 2000. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
        imageUrl: "https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&w=800&q=80",
        timeMinutes: 20,
        difficulty: "easy",
        isPublished: true,
      },
      {
        id: wtIds[3],
        title: "Working From Home vs. Office (Task 2)",
        task: "task2",
        prompt: "Nowadays, many employers allow their employees to work from home instead of coming to the office. Do the advantages of this trend outweigh the disadvantages? Support your opinion with reasons and examples. Write at least 250 words.",
        timeMinutes: 40,
        difficulty: "medium",
        isPublished: true,
      },
      {
        id: wtIds[4],
        title: "Global Temperature Anomalies (Task 1)",
        task: "task1",
        prompt: "The table below shows global temperature changes relative to the historical average across five continents over three decades (1980s, 1990s, and 2000s). Summarize the information by selecting and reporting the main features. Write at least 150 words.",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        timeMinutes: 20,
        difficulty: "hard",
        isPublished: true,
      },
      {
        id: wtIds[5],
        title: "Impact of Social Media on Teenagers (Task 2)",
        task: "task2",
        prompt: "Many people claim that social media platforms have a negative effect on teenagers' social development and mental health. To what extent do you agree or disagree with this statement? Give specific reasons and examples to support your view. Write at least 250 words.",
        timeMinutes: 40,
        difficulty: "medium",
        isPublished: true,
      },
      {
        id: wtIds[6],
        title: "Water Consumption in Different Sectors (Task 1)",
        task: "task1",
        prompt: "The pie charts show the share of global water consumption among three sectors: agriculture, industry, and domestic use, in 1900 and 2000. Summarize the main features and make comparisons. Write at least 150 words.",
        imageUrl: "https://images.unsplash.com/photo-1518173946687-a4c8a383392f?auto=format&fit=crop&w=800&q=80",
        timeMinutes: 20,
        difficulty: "medium",
        isPublished: true,
      },
      {
        id: wtIds[7],
        title: "Government Spending on Arts vs. Sciences (Task 2)",
        task: "task2",
        prompt: "Some people argue that governments should spend more money on funding scientific research rather than supporting the arts. Discuss both views and give your opinion. Write at least 250 words.",
        timeMinutes: 40,
        difficulty: "hard",
        isPublished: true,
      }
    ]);
    console.log("✓ 8 Writing tests seeded.");

    // ─── 2. SEED SPEAKING TESTS (8 Tests: Part 1, Part 2, Part 3) ─────────────────
    const stIds = Array.from({ length: 8 }, () => crypto.randomUUID());

    await db.insert(schema.speakingTests).values([
      {
        id: stIds[0],
        title: "Speaking Part 1: Hometown and Hobbies",
        part: "part1",
        questions: [
          "Let's talk about your hometown. Where is your hometown located?",
          "What do you like most about your hometown?",
          "Let's move on to talk about hobbies. What do you do in your free time?",
          "Do you prefer spending your free time alone or with friends?"
        ],
        speakingTime: 120,
        difficulty: "easy",
        isPublished: true,
      },
      {
        id: stIds[1],
        title: "Speaking Part 2: Describe a Useful Book",
        part: "part2",
        questions: [],
        cueCard: "Describe a book you have read recently that you found useful.\n\nYou should say:\n- What the book is\n- Who wrote it\n- What it is about\n- And explain why you found it useful.",
        preparationTime: 60,
        speakingTime: 120,
        difficulty: "medium",
        isPublished: true,
      },
      {
        id: stIds[2],
        title: "Speaking Part 3: Reading Habits and Technology",
        part: "part3",
        questions: [
          "Do you think paper books will be completely replaced by e-books in the future?",
          "What are the benefits of reading compared to watching videos for children?",
          "Should governments invest in public libraries in the digital era?"
        ],
        speakingTime: 180,
        difficulty: "hard",
        isPublished: true,
      },
      {
        id: stIds[3],
        title: "Speaking Part 1: Food and Dining Habits",
        part: "part1",
        questions: [
          "What is your favorite food and why?",
          "Do you prefer cooking at home or eating out at restaurants?",
          "How has your diet changed since you were a child?",
          "Is fast food popular in your country?"
        ],
        speakingTime: 120,
        difficulty: "easy",
        isPublished: true,
      },
      {
        id: stIds[4],
        title: "Speaking Part 2: Describe a Memorable Journey",
        part: "part2",
        questions: [],
        cueCard: "Describe a memorable journey you went on.\n\nYou should say:\n- Where you went\n- How you traveled there\n- Who you traveled with\n- And explain why this journey was so memorable to you.",
        preparationTime: 60,
        speakingTime: 120,
        difficulty: "medium",
        isPublished: true,
      },
      {
        id: stIds[5],
        title: "Speaking Part 3: Tourism and Infrastructure",
        part: "part3",
        questions: [
          "How does tourism affect local economies in developing nations?",
          "What can governments do to promote eco-friendly and sustainable tourism?",
          "Do you think international travel builds better relationships between countries?"
        ],
        speakingTime: 180,
        difficulty: "hard",
        isPublished: true,
      },
      {
        id: stIds[6],
        title: "Speaking Part 1: Technology and Apps",
        part: "part1",
        questions: [
          "What is your favorite mobile application and how often do you use it?",
          "Has technology made your daily schedule easier or more complicated?",
          "Do you think kids spend too much time on smartphones nowadays?"
        ],
        speakingTime: 120,
        difficulty: "easy",
        isPublished: true,
      },
      {
        id: stIds[7],
        title: "Speaking Part 2: Describe a Person You Admire",
        part: "part2",
        questions: [],
        cueCard: "Describe a person you admire or look up to.\n\nYou should say:\n- Who this person is\n- How you know them\n- What their character is like\n- And explain why you admire them so much.",
        preparationTime: 60,
        speakingTime: 120,
        difficulty: "medium",
        isPublished: true,
      }
    ]);
    console.log("✓ 8 Speaking tests seeded.");

    // ─── 3. SEED READING PASSAGES & QUESTIONS (10 Passages) ──────────────────────
    const rpIds = Array.from({ length: 10 }, () => crypto.randomUUID());

    const passages: (typeof schema.readingPassages.$inferInsert)[] = [
      {
        id: rpIds[0],
        title: "William Henry Perkin and Synthetic Dyes",
        passage: "William Henry Perkin was a British chemist who is best known for his accidental discovery of the first synthetic dye, which he named 'mauveine'. Born on March 12, 1838, in London, Perkin showed an early interest in science and began conducting chemistry experiments in his makeshift laboratory at home. At the age of 15, he entered the Royal College of Chemistry, where he studied under the renowned chemist August Wilhelm von Hofmann.\n\nIn 1856, while working on a project to synthesize quinine (a treatment for malaria), Perkin accidentally produced a dark purple residue. Curious about this unexpected result, he realized it could be used as a dye for fabrics. This discovery led to the creation of mauveine, which revolutionized the textile industry, making vibrant purple clothing affordable and accessible to the wider public.\n\nPerkin patented his discovery and established a factory to produce mauveine on a commercial scale. This laid the foundation for the modern chemical industry and proved that laboratory research could yield enormous commercial and practical applications.",
        difficulty: "medium",
        timeMinutes: 20,
        isPublished: true,
      },
      {
        id: rpIds[1],
        title: "The Threat of Climate Change to Forest Biodiversity",
        passage: "Forests are home to over 80% of the world's terrestrial biodiversity, hosting a vast array of plants, animals, and microorganisms. However, rapid changes in global temperatures and precipitation patterns are threatening these ecosystems. As temperatures rise, many species are forced to migrate towards higher altitudes or latitudes to find suitable habitats. For species with limited mobility, such as certain amphibians and flightless insects, these migration routes are often blocked by human infrastructure, leading to localized extinctions.\n\nIn addition to temperature shifts, climate change is altering the frequency and intensity of natural disturbances, such as forest fires and pest outbreaks. Warmer winters allow insect pests like bark beetles to survive and reproduce in greater numbers, causing widespread devastation to coniferous forests in North America. These dead trees then act as fuel for massive wildfires, which further degrade the habitat and release stored carbon dioxide into the atmosphere, accelerating the greenhouse effect.\n\nConservationists argue that protecting existing forest ecosystems is crucial, but not sufficient. Active forest management strategies, such as establishing wildlife corridors and assisting species migration, are becoming increasingly necessary to preserve global biodiversity. By creating continuous pathways of natural habitat, scientists hope to enable vulnerable species to adapt to the changing climate naturally.",
        difficulty: "medium",
        timeMinutes: 20,
        isPublished: true,
      },
      {
        id: rpIds[2],
        title: "The History and Cultivation of Tea",
        passage: "Tea is the world's most consumed beverage after water, with its origins tracing back to ancient China. According to legend, Emperor Shen Nung discovered tea in 2737 BC when wild leaves drifted into his boiling water. Cultivation of the tea plant, Camellia sinensis, became widespread during the Tang Dynasty, developing into a complex cultural ritual. By the 17th century, tea reached Europe through Dutch merchants, where it quickly became a luxury item among the aristocracy.\n\nToday, tea is grown in tropical and subtropical regions worldwide, primarily in China, India, Kenya, and Sri Lanka. The characteristics of the tea are determined by the soil quality, altitude, and processing methods. Leaves are harvested by hand and undergo varying degrees of oxidation to produce white, green, oolong, or black tea. As awareness of its health benefits grows, international consumption continues to climb.",
        difficulty: "easy",
        timeMinutes: 15,
        isPublished: true,
      },
      {
        id: rpIds[3],
        title: "The Neurobiology of Human Sleep",
        passage: "Sleep is a vital physiological process characterized by altered consciousness and inhibited sensory activity. Modern sleep research identifies two primary categories: REM (Rapid Eye Movement) and NREM (Non-Rapid Eye Movement) sleep. NREM sleep is further divided into three distinct stages, spanning from light slumber to deep slow-wave sleep. During deep sleep, the body undergoes critical cellular repair and growth hormone release.\n\nREM sleep is the stage most closely associated with vivid dreaming. Brain activity during REM spikes to levels similar to waking hours, yet the body experience muscle paralysis to prevent the physical acting out of dreams. Disruptions in sleep cycles are linked to cognitive decline, metabolic disorders, and weakened immune responses. Understanding these neurological systems helps scientists develop therapies for chronic sleep disorders like insomnia and sleep apnea.",
        difficulty: "hard",
        timeMinutes: 20,
        isPublished: true,
      },
      {
        id: rpIds[4],
        title: "Evolution and Social Impact of the Bicycle",
        passage: "The bicycle is one of the most efficient transport inventions in history. Its early ancestor, the 'dandy horse' invented by Karl von Drais in 1817, lacked pedals and required riders to push off the ground with their feet. The mid-19th century introduced the 'boneshaker' with pedals attached directly to the front wheel, followed by the high-wheeled penny-farthing. The penny-farthing's massive front wheel allowed higher speeds but was notoriously unstable and dangerous.\n\nBy the late 1880s, the safety bicycle emerged, featuring equal-sized wheels, a chain drive, and pneumatic rubber tires. This design democratized travel, offering affordable, independent mobility to working classes, particularly women. It played a major role in early women's suffrage movements by increasing their freedom of movement and prompting changes in restrictive Victorian clothing standards.",
        difficulty: "easy",
        timeMinutes: 15,
        isPublished: true,
      },
      {
        id: rpIds[5],
        title: "Understanding Human Memory Consolidation",
        passage: "Memory consolidation is the neurological process by which temporary sensory impressions are transformed into stable, long-term memories. The hippocampus, located in the temporal lobe, acts as a temporary sorting center, registering new experiences. However, long-term retention requires these traces to be transferred to the neocortex, where they are integrated into existing cognitive frameworks.\n\nThis transfer primarily occurs during sleep, particularly slow-wave NREM sleep. Synaptic consolidation, happening within hours of learning, strengthens local neural paths, while systemic consolidation reorganizes brain networks over weeks or years. Interference during these critical periods—such as trauma, high stress, or sleep deprivation—can disrupt the consolidation process, leading to memory loss or distortion.",
        difficulty: "hard",
        timeMinutes: 20,
        isPublished: true,
      },
      {
        id: rpIds[6],
        title: "The Rise of Urban Farming in Modern Cities",
        passage: "Urban farming, the practice of cultivating crops within city boundaries, has transitioned from a niche hobby to a critical urban planning tool. Modern vertical farms utilize hydroponic and aeroponic systems to grow vegetables in stacked layers, completely eliminating the need for soil. These indoor facilities control temperature, humidity, and light spectra to optimize crop yield and reduce growth cycles.\n\nBy locating agricultural production closer to metropolitan consumer hubs, vertical farms eliminate emissions and logistics costs associated with long-distance food transport. Furthermore, closed-loop hydroponic systems use up to 95% less water than traditional open-field farming. However, critics point out the high electricity demands of continuous artificial LED lighting, arguing that the system remains commercially viable only for high-value leafy greens.",
        difficulty: "medium",
        timeMinutes: 20,
        isPublished: true,
      },
      {
        id: rpIds[7],
        title: "Deep-Sea Hydrothermal Vent Ecosystems",
        passage: "Hydrothermal vents are fissures on the seafloor that release geothermally heated water rich in dissolved minerals. Located miles below the ocean surface where sunlight cannot penetrate, these vents support complex communities of life that do not rely on photosynthesis. Instead, these ecosystems are fueled by chemosynthesis, a process in which specialized bacteria convert toxic hydrogen sulfide gas from the vents into usable organic energy.\n\nThese bacteria form the base of a food chain that supports giant tubeworms, vent crabs, and pale shrimp. Tubeworms, which grow up to eight feet long, have no mouth or digestive tract, relying entirely on a symbiotic relationship with chemosynthetic bacteria housed inside their bodies. Discoveries at these vents have revolutionized biology, suggesting that life on Earth may have originated in deep-sea environments and raising possibilities for extraterrestrial life on icy moons.",
        difficulty: "hard",
        timeMinutes: 20,
        isPublished: true,
      },
      {
        id: rpIds[8],
        title: "Artificial Intelligence in Medical Diagnostic Systems",
        passage: "Deep learning models have shown remarkable accuracy in diagnostic medicine, occasionally matching or exceeding the performance of human radiologists. By training neural networks on millions of clinical images, AI systems learn to recognize subtle patterns of tumors, fractures, or retinal decay that might escape human eyes. These applications drastically reduce diagnostic time, allowing doctors to identify diseases at much earlier stages.\n\nDespite these benefits, the integration of AI diagnostics faces hurdles. One main issue is the 'black box' problem, where deep learning algorithms generate correct outcomes but cannot explain their mathematical reasoning. This lack of transparency raises ethical and legal questions regarding accountability if a misdiagnosis occurs. Consequently, experts recommend using AI as a supportive decision-making tool rather than an autonomous diagnostic authority.",
        difficulty: "medium",
        timeMinutes: 20,
        isPublished: true,
      },
      {
        id: rpIds[9],
        title: "Architectural Evolution of the Italian Renaissance",
        passage: "Renaissance architecture, developing in Florence in the early 15th century, marked a conscious rejection of the complex, asymmetrical Gothic style. Led by figures like Filippo Brunelleschi and Leon Battista Alberti, architects sought inspiration in the symmetry, proportion, and geometry of classical Roman ruins. They revived the use of semicircular arches, hemispherical domes, and classical column arrangements.\n\nBrunelleschi's design for the dome of Florence Cathedral (Santa Maria del Fiore) represented a landmark engineering feat, constructing a massive double-walled octagonal dome without temporary wooden scaffolding. These designs emphasized human scale and rational layout, reflecting the broader intellectual shifts of Renaissance humanism which placed human reason and sensory experience at the center of cultural development.",
        difficulty: "medium",
        timeMinutes: 20,
        isPublished: true,
      }
    ];

    await db.insert(schema.readingPassages).values(passages);

    // Reading Questions
    const rqValues = [
      // Qs for Passage 0: William Henry Perkin
      {
        id: crypto.randomUUID(),
        passageId: rpIds[0],
        type: "true_false_not_given" as const,
        question: "Perkin entered the Royal College of Chemistry at the age of 15.",
        correctAnswer: "TRUE",
        explanation: "The passage states: 'At the age of 15, he entered the Royal College of Chemistry.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[0],
        type: "true_false_not_given" as const,
        question: "The passage states that Perkin’s discovery of mauveine made natural dyes more expensive.",
        correctAnswer: "FALSE",
        explanation: "The passage says mauveine made clothing affordable and accessible, and does not state it made natural dyes more expensive.",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[0],
        type: "true_false_not_given" as const,
        question: "William Henry Perkin received formal education in Germany.",
        correctAnswer: "FALSE",
        explanation: "The passage mentions he studied at the Royal College of Chemistry, which is in London, under August Wilhelm von Hofmann.",
        orderIndex: 2,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[0],
        type: "multiple_choice" as const,
        question: "What was Perkin trying to synthesize when he accidentally discovered mauveine?",
        options: [
          "A. Quinine for malaria treatment",
          "B. Synthetic dyes for silk fabric",
          "C. Pure carbon compounds",
          "D. Coal tar solutions"
        ],
        correctAnswer: "A",
        explanation: "The passage states: 'while working on a project to synthesize quinine (a treatment for malaria)...'",
        orderIndex: 3,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[0],
        type: "fill_blank" as const,
        question: "The accidental synthetic dye discovered by Perkin was named _________.",
        correctAnswer: "mauveine",
        explanation: "Paragraph 1 and 2 mention he named it 'mauveine'.",
        orderIndex: 4,
      },

      // Qs for Passage 1: Forest Biodiversity
      {
        id: crypto.randomUUID(),
        passageId: rpIds[1],
        type: "multiple_choice" as const,
        question: "According to the first paragraph, what is the main reason some forest species face localized extinction?",
        options: [
          "A. They are hunted by human populations.",
          "B. They cannot adapt to altitude changes.",
          "C. Human infrastructure prevents their migration to suitable habitats.",
          "D. Forest fires destroy their food sources."
        ],
        correctAnswer: "C",
        explanation: "Paragraph 1 mentions: 'For species with limited mobility... migration routes are often blocked by human infrastructure, leading to localized extinctions.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[1],
        type: "true_false_not_given" as const,
        question: "Bark beetles reproduction rate decreases during warmer winters.",
        correctAnswer: "FALSE",
        explanation: "Paragraph 2 states: 'Warmer winters allow insect pests like bark beetles to survive and reproduce in greater numbers.'",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[1],
        type: "fill_blank" as const,
        question: "To help vulnerable species adapt, scientists recommend establishing ___________ corridors.",
        correctAnswer: "wildlife",
        explanation: "Paragraph 3 mentions: 'Active forest management strategies, such as establishing wildlife corridors...'",
        orderIndex: 2,
      },

      // Qs for Passage 2: Tea History
      {
        id: crypto.randomUUID(),
        passageId: rpIds[2],
        type: "multiple_choice" as const,
        question: "According to Chinese legend, who discovered tea?",
        options: [
          "A. An unknown Tang Dynasty farmer",
          "B. Emperor Shen Nung",
          "C. Dutch merchants",
          "D. An aristocratic family"
        ],
        correctAnswer: "B",
        explanation: "The passage states: 'According to legend, Emperor Shen Nung discovered tea in 2737 BC.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[2],
        type: "fill_blank" as const,
        question: "The tea plant is scientifically known as Camellia _________.",
        correctAnswer: "sinensis",
        explanation: "The passage states: 'Cultivation of the tea plant, Camellia sinensis...'",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[2],
        type: "true_false_not_given" as const,
        question: "Tea was introduced to Europe by British merchants in the 17th century.",
        correctAnswer: "FALSE",
        explanation: "The passage states tea reached Europe through 'Dutch merchants', not British.",
        orderIndex: 2,
      },

      // Qs for Passage 3: Sleep
      {
        id: crypto.randomUUID(),
        passageId: rpIds[3],
        type: "true_false_not_given" as const,
        question: "Cellular repair mostly occurs during REM sleep.",
        correctAnswer: "FALSE",
        explanation: "The passage states: 'During deep sleep [NREM], the body undergoes critical cellular repair.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[3],
        type: "fill_blank" as const,
        question: "The sleep stage associated with dreaming is called _________ sleep.",
        correctAnswer: "REM",
        explanation: "The passage states: 'REM sleep is the stage most closely associated with vivid dreaming.'",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[3],
        type: "multiple_choice" as const,
        question: "Why doesn't the human body move or act out dreams during REM sleep?",
        options: [
          "A. The eyes move too rapidly.",
          "B. The brain experiences a complete lack of activity.",
          "C. The body undergoes temporary muscle paralysis.",
          "D. Hormones prevent any muscle contractions."
        ],
        correctAnswer: "C",
        explanation: "The passage states: 'yet the body experience muscle paralysis to prevent the physical acting out of dreams.'",
        orderIndex: 2,
      },

      // Qs for Passage 4: Bicycle
      {
        id: crypto.randomUUID(),
        passageId: rpIds[4],
        type: "multiple_choice" as const,
        question: "What did the earliest ancestor of the bicycle (dandy horse) lack?",
        options: [
          "A. Pedals",
          "B. Wheels",
          "C. Handlebars",
          "D. Seats"
        ],
        correctAnswer: "A",
        explanation: "The passage states the dandy horse 'lacked pedals and required riders to push off the ground.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[4],
        type: "true_false_not_given" as const,
        question: "Penny-farthing bicycles were popular because they were extremely safe.",
        correctAnswer: "FALSE",
        explanation: "The passage states the penny-farthing 'was notoriously unstable and dangerous.'",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[4],
        type: "fill_blank" as const,
        question: "The bicycle design with equal-sized wheels developed in late 1880s was the _________ bicycle.",
        correctAnswer: "safety",
        explanation: "The passage states: 'By the late 1880s, the safety bicycle emerged.'",
        orderIndex: 2,
      },

      // Qs for Passage 5: Memory Consolidation
      {
        id: crypto.randomUUID(),
        passageId: rpIds[5],
        type: "fill_blank" as const,
        question: "New sensory impressions are temporarily registered in the _________.",
        correctAnswer: "hippocampus",
        explanation: "The passage states: 'The hippocampus... acts as a temporary sorting center, registering new experiences.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[5],
        type: "true_false_not_given" as const,
        question: "Systemic memory consolidation occurs over a matter of hours.",
        correctAnswer: "FALSE",
        explanation: "The passage states systemic consolidation reorganizes brain networks 'over weeks or years.'",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[5],
        type: "multiple_choice" as const,
        question: "Under what state does system-level memory transfer primarily happen?",
        options: [
          "A. Active studying",
          "B. Deep NREM sleep",
          "C. High-stress environments",
          "D. Light REM sleep"
        ],
        correctAnswer: "B",
        explanation: "The passage states: 'This transfer primarily occurs during sleep, particularly slow-wave NREM sleep.'",
        orderIndex: 2,
      },

      // Qs for Passage 6: Urban Farming
      {
        id: crypto.randomUUID(),
        passageId: rpIds[6],
        type: "true_false_not_given" as const,
        question: "Vertical farms require large volumes of organic soil to function.",
        correctAnswer: "FALSE",
        explanation: "The passage states vertical farms 'utilize hydroponic and aeroponic systems... completely eliminating the need for soil.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[6],
        type: "fill_blank" as const,
        question: "Vertical farms eliminate emissions by producing food closer to urban _________ hubs.",
        correctAnswer: "consumer",
        explanation: "The passage states: 'By locating agricultural production closer to metropolitan consumer hubs...'",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[6],
        type: "multiple_choice" as const,
        question: "What is the primary criticism leveled against indoor vertical farming?",
        options: [
          "A. Massive water waste",
          "B. High electricity demand of LED lighting",
          "C. Slower growth cycles",
          "D. High shipping and logistics fees"
        ],
        correctAnswer: "B",
        explanation: "The passage states: 'critics point out the high electricity demands of continuous artificial LED lighting...'",
        orderIndex: 2,
      },

      // Qs for Passage 7: Hydrothermal Vents
      {
        id: crypto.randomUUID(),
        passageId: rpIds[7],
        type: "multiple_choice" as const,
        question: "What chemical process replaces photosynthesis in hydrothermal vent ecosystems?",
        options: [
          "A. Photosynthesis",
          "B. Chemosynthesis",
          "C. Hydrothermal synthesis",
          "D. Organic decay"
        ],
        correctAnswer: "B",
        explanation: "The passage states: 'Instead, these ecosystems are fueled by chemosynthesis...'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[7],
        type: "true_false_not_given" as const,
        question: "Giant tubeworms digest their food using a well-developed stomach and digestive tract.",
        correctAnswer: "FALSE",
        explanation: "The passage states: 'Tubeworms... have no mouth or digestive tract, relying entirely on a symbiotic relationship...'",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[7],
        type: "fill_blank" as const,
        question: "Chemosynthetic bacteria convert toxic _________ sulfide gas into usable energy.",
        correctAnswer: "hydrogen",
        explanation: "The passage states: 'bacteria convert toxic hydrogen sulfide gas from the vents...'",
        orderIndex: 2,
      },

      // Qs for Passage 8: AI Radiology
      {
        id: crypto.randomUUID(),
        passageId: rpIds[8],
        type: "true_false_not_given" as const,
        question: "AI medical tools consistently diagnose diseases slower than human radiologists.",
        correctAnswer: "FALSE",
        explanation: "The passage states: 'These applications drastically reduce diagnostic time.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[8],
        type: "fill_blank" as const,
        question: "The legal and ethical dilemma caused by AI's unexplained calculations is known as the _________ box problem.",
        correctAnswer: "black",
        explanation: "The passage refers to this as the 'black box' problem.",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[8],
        type: "multiple_choice" as const,
        question: "How do medical experts suggest that AI diagnostic tools be used in clinics?",
        options: [
          "A. As completely autonomous medical directors",
          "B. To completely replace human radiologists",
          "C. As supportive decision-making aids",
          "D. Only for administrative filing work"
        ],
        correctAnswer: "C",
        explanation: "The passage states: 'experts recommend using AI as a supportive decision-making tool rather than an autonomous diagnostic authority.'",
        orderIndex: 2,
      },

      // Qs for Passage 9: Italian Renaissance
      {
        id: crypto.randomUUID(),
        passageId: rpIds[9],
        type: "multiple_choice" as const,
        question: "Which architectural elements were revived during the Italian Renaissance?",
        options: [
          "A. Pointed arches and flying buttresses",
          "B. Semicircular arches and hemispherical domes",
          "C. Asymmetrical layouts and organic towers",
          "D. Modern glass walls and iron pillars"
        ],
        correctAnswer: "B",
        explanation: "The passage states: 'They revived the use of semicircular arches, hemispherical domes, and classical column arrangements.'",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[9],
        type: "true_false_not_given" as const,
        question: "Filippo Brunelleschi used massive wooden scaffolding to build Florence Cathedral's dome.",
        correctAnswer: "FALSE",
        explanation: "The passage states Brunelleschi constructed the dome 'without temporary wooden scaffolding.'",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        passageId: rpIds[9],
        type: "fill_blank" as const,
        question: "Renaissance design principles reflected the cultural shift toward Renaissance _________.",
        correctAnswer: "humanism",
        explanation: "The passage states: 'reflecting the broader intellectual shifts of Renaissance humanism...'",
        orderIndex: 2,
      }
    ];

    await db.insert(schema.readingQuestions).values(rqValues);
    console.log("✓ 10 Reading passages & questions seeded.");

    // ─── 4. SEED LISTENING TESTS & QUESTIONS (10 Tests) ──────────────────────────
    const ltIds = Array.from({ length: 10 }, () => crypto.randomUUID());

    const listeningTests: (typeof schema.listeningTests.$inferInsert)[] = [
      {
        id: ltIds[0],
        title: "L01. Hotel Room Service Inquiry",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        transcript: "Receptionist (Tess): Good evening! Room service. Tess speaking. How may I assist you?\nGuest (James): Hi Tess. I'd like to order some dinner to my room, please.\nReceptionist: Certainly, sir. What would you like to have?\nGuest: I would like a grilled chicken sandwich, some French fries, and a small side salad with ranch dressing on the side.\nReceptionist: Got that. Would you like anything to drink?\nGuest: Yes, a large glass of fresh orange juice, please.\nReceptionist: Perfect. What is your room number, sir?\nGuest: I am in room 640.\nReceptionist: Thank you, Mr. James. Your order will be delivered in about twenty minutes.",
        difficulty: "easy",
        timeMinutes: 10,
        isPublished: true,
      },
      {
        id: ltIds[1],
        title: "English Course Enrollment Inquiry",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        transcript: "Receptionist: Good morning! Welcome to the Royal Language School. How can I help you today?\nStudent: Good morning. I'd like to ask for some information about your general English courses. I want to study for 4 weeks.\nReceptionist: Excellent. We have intensive classes that run from 9 AM to 1 PM daily, or part-time options. Our next course starts on Monday, the 5th of July.\nStudent: Great, Monday suits me. How much is the tuition fee for 4 weeks?\nReceptionist: The fee is 320 pounds including course materials. We also offer accommodation in local home-stays for an additional 150 pounds per week.\nStudent: I think I'll arrange my own accommodation. I'd like to pay the tuition fee now, please.",
        difficulty: "easy",
        timeMinutes: 10,
        isPublished: true,
      },
      {
        id: ltIds[2],
        title: "Job Interview Scheduling",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        transcript: "HR Manager: Hello, is this Mark?\nCandidate: Yes, speaking. Good afternoon.\nHR Manager: Good afternoon Mark. I'm calling from Zenith Consulting regarding your application for the Junior Web Developer position. We would like to invite you for an interview.\nCandidate: That's wonderful! Thank you.\nHR Manager: We have openings next Tuesday at 10 AM, or Wednesday at 2 PM. Which suits you?\nCandidate: Wednesday at 2 PM would be perfect, as I have another commitment on Tuesday morning.\nHR Manager: Excellent. We are located on the 4th floor of the Tower Plaza, Room 402. Please bring a printed copy of your resume.\nCandidate: Understood. See you on Wednesday.",
        difficulty: "medium",
        timeMinutes: 12,
        isPublished: true,
      },
      {
        id: ltIds[3],
        title: "Library Membership Registration",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        transcript: "Librarian: Hello, how can I help you today?\nPatron: Hi, I'd like to sign up for a library card, please.\nLibrarian: Sure, I can help you with that. Are you a local resident?\nPatron: Yes, I moved to Greenview last month. My address is 14 Maple Street.\nLibrarian: Great. I'll need to see some proof of address. A utility bill or driver's license will do.\nPatron: Here is my water bill.\nLibrarian: Perfect. There is no charge for local residents. The library card is free and allows you to borrow up to 10 books at a time. The loan period is 3 weeks.",
        difficulty: "easy",
        timeMinutes: 8,
        isPublished: true,
      },
      {
        id: ltIds[4],
        title: "Car Rental Inquiry Dialogue",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        transcript: "Agent: Hello! Welcome to Swift Car Rentals. What type of vehicle are you looking for?\nCustomer: Hi. I need a compact car for a weekend trip. Just for myself and my husband.\nAgent: We have a hybrid sedan available for 45 dollars a day, or a standard hatchback for 35 dollars a day.\nCustomer: We'll go with the hybrid sedan. We want to save on gas.\nAgent: Excellent. Will you need GPS navigation or an additional driver insurance policy?\nCustomer: Yes, we would like GPS navigation added. My husband will do all the driving, so no extra insurance is needed.\nAgent: Great, let's process your credit card.",
        difficulty: "medium",
        timeMinutes: 10,
        isPublished: true,
      },
      {
        id: ltIds[5],
        title: "Travel Agency Booking Details",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        transcript: "Agent: Global Travels, good afternoon. How can I help you?\nTraveler: Hello, I'd like to book a flight to Tokyo for next month, leaving on the 12th.\nAgent: Let me check. We have a direct flight leaving at 8:30 AM with Nippon Airways, or a one-stop flight leaving at 11:00 AM with Pacific Airlines.\nTraveler: I prefer the direct flight. What is the baggage allowance?\nAgent: You are allowed one carry-on bag up to 7 kg, and two checked bags up to 23 kg each.\nTraveler: That's perfect. Please book that flight for me.",
        difficulty: "easy",
        timeMinutes: 10,
        isPublished: true,
      },
      {
        id: ltIds[6],
        title: "Academic Lecture: The Roman Road Network",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        transcript: "Professor: Today, we look at the engineering of Roman roads. The Romans constructed over 400,000 kilometers of roads to connect their vast empire. These roads were primarily built for the rapid movement of armies and military supplies. They were constructed in straight lines, bypassing natural obstacles with tunnels or bridges. The foundations were made of gravel and clay, covered by large, flat stone blocks. This layout allowed rainwater to drain off, keeping roads usable in all weather conditions.",
        difficulty: "hard",
        timeMinutes: 15,
        isPublished: true,
      },
      {
        id: ltIds[7],
        title: "Student Accommodation Request Form",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        transcript: "Officer: Good morning. Have you filled out the student housing application?\nStudent: Not yet. I had some questions about the room options. Is the single studio room still available?\nOfficer: Yes, we have studios in East Hall for 180 dollars a week, or shared double rooms in West Hall for 120 dollars a week. Utilities and high-speed internet are included in both rates.\nStudent: I prefer East Hall because I need a quiet space to study. Does it include parking?\nOfficer: Parking is an additional 25 dollars per month. You need to register your vehicle at the main office.",
        difficulty: "easy",
        timeMinutes: 10,
        isPublished: true,
      },
      {
        id: ltIds[8],
        title: "Museum Tour Guide Dialogue",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        transcript: "Guide: Welcome to the Science Museum. Before we start our tour, please note that flash photography is strictly prohibited inside the main halls to protect historical manuscripts. The museum has three floors. The Ground floor hosts the Space exhibit, the first floor is dedicated to the History of Computers, and the top floor features Robotics. The cafe is located next to the main entrance on the ground floor.",
        difficulty: "medium",
        timeMinutes: 12,
        isPublished: true,
      },
      {
        id: ltIds[9],
        title: "Tutoring Session: Essay Structure Feedback",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        transcript: "Tutor: Hi Sarah, let's look at your essay draft. Your arguments on environmental policy are solid, but you need to restructure your body paragraphs. Each paragraph must start with a clear topic sentence.\nStudent: Okay. Should I add more data to support my points?\nTutor: Yes, especially in paragraph three. You should reference the 2018 United Nations climate report. Also, ensure your conclusion summarizes your main points rather than introducing new concepts.",
        difficulty: "hard",
        timeMinutes: 15,
        isPublished: true,
      }
    ];

    await db.insert(schema.listeningTests).values(listeningTests);

    // Listening Questions
    const lqValues = [
      // Qs for L01
      {
        id: crypto.randomUUID(),
        testId: ltIds[0],
        type: "multiple_choice" as const,
        question: "Who is speaking at the front desk?",
        options: [
          "A. Tess",
          "B. James",
          "C. Anna"
        ],
        correctAnswer: "A",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[0],
        type: "multiple_choice" as const,
        question: "What kind of dressing does the man want with his salad?",
        options: [
          "A. Ranch",
          "B. Italian",
          "C. Balsamic"
        ],
        correctAnswer: "A",
        orderIndex: 1,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[0],
        type: "multiple_choice" as const,
        question: "What room number is James in?",
        options: [
          "A. 640",
          "B. 450",
          "C. 604"
        ],
        correctAnswer: "A",
        orderIndex: 2,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[0],
        type: "fill_blank" as const,
        question: "The guest ordered a side salad with dressing on the _________.",
        correctAnswer: "side",
        orderIndex: 3,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[0],
        type: "fill_blank" as const,
        question: "The guest wants a large glass of fresh _________ juice.",
        correctAnswer: "orange",
        orderIndex: 4,
      },

      // Qs for L02 (Enrollment)
      {
        id: crypto.randomUUID(),
        testId: ltIds[1],
        type: "multiple_choice" as const,
        question: "When does the student's next English course start?",
        options: [
          "A. Next Friday",
          "B. Monday, 5th of July",
          "C. Monday, 15th of July",
          "D. Next month"
        ],
        correctAnswer: "B",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[1],
        type: "fill_blank" as const,
        question: "The total fee for the 4-week general English course is ___________ pounds.",
        correctAnswer: "320",
        orderIndex: 1,
      },

      // Qs for L03 (Job Schedule)
      {
        id: crypto.randomUUID(),
        testId: ltIds[2],
        type: "multiple_choice" as const,
        question: "What job position did Mark apply for?",
        options: [
          "A. Senior Software Engineer",
          "B. Junior Web Developer",
          "C. Project Manager",
          "D. Human Resources Director"
        ],
        correctAnswer: "B",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[2],
        type: "fill_blank" as const,
        question: "The interview is scheduled on Wednesday at _________ PM.",
        correctAnswer: "2",
        orderIndex: 1,
      },

      // Qs for L04 (Library)
      {
        id: crypto.randomUUID(),
        testId: ltIds[3],
        type: "fill_blank" as const,
        question: "The patron's address is 14 _________ Street.",
        correctAnswer: "Maple",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[3],
        type: "multiple_choice" as const,
        question: "What is the maximum number of books a patron can borrow?",
        options: [
          "A. 5 books",
          "B. 10 books",
          "C. 15 books",
          "D. 20 books"
        ],
        correctAnswer: "B",
        orderIndex: 1,
      },

      // Qs for L05 (Car Rental)
      {
        id: crypto.randomUUID(),
        testId: ltIds[4],
        type: "multiple_choice" as const,
        question: "Which vehicle did the customer choose to rent?",
        options: [
          "A. Compact hatchback",
          "B. Hybrid sedan",
          "C. Full-size SUV",
          "D. Minivan"
        ],
        correctAnswer: "B",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[4],
        type: "fill_blank" as const,
        question: "The hybrid sedan rental costs _________ dollars per day.",
        correctAnswer: "45",
        orderIndex: 1,
      },

      // Qs for L06 (Travel Bookings)
      {
        id: crypto.randomUUID(),
        testId: ltIds[5],
        type: "multiple_choice" as const,
        question: "Which airline does the traveler book with?",
        options: [
          "A. Nippon Airways",
          "B. Pacific Airlines",
          "C. Global Travels",
          "D. Tokyo Express"
        ],
        correctAnswer: "A",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[5],
        type: "fill_blank" as const,
        question: "The checked baggage allowance is _________ kg per bag.",
        correctAnswer: "23",
        orderIndex: 1,
      },

      // Qs for L07 (Roman Roads)
      {
        id: crypto.randomUUID(),
        testId: ltIds[6],
        type: "fill_blank" as const,
        question: "Romans constructed over _________ kilometers of road networks.",
        correctAnswer: "400000",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[6],
        type: "multiple_choice" as const,
        question: "What was the primary purpose of the Roman roads?",
        options: [
          "A. Expanding civilian postal services",
          "B. Rapid movement of military troops and gear",
          "C. Enhancing trade with nearby countries",
          "D. Promoting travel of architects"
        ],
        correctAnswer: "B",
        orderIndex: 1,
      },

      // Qs for L08 (Accommodation)
      {
        id: crypto.randomUUID(),
        testId: ltIds[7],
        type: "multiple_choice" as const,
        question: "Where is the single studio room located?",
        options: [
          "A. West Hall",
          "B. East Hall",
          "C. South Square",
          "D. North Plaza"
        ],
        correctAnswer: "B",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[7],
        type: "fill_blank" as const,
        question: "Parking registration costs an additional _________ dollars per month.",
        correctAnswer: "25",
        orderIndex: 1,
      },

      // Qs for L09 (Museum Guide)
      {
        id: crypto.randomUUID(),
        testId: ltIds[8],
        type: "multiple_choice" as const,
        question: "What activity is strictly prohibited inside the museum?",
        options: [
          "A. Taking notes",
          "B. Flash photography",
          "C. Wearing bags",
          "D. Speaking loudly"
        ],
        correctAnswer: "B",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[8],
        type: "fill_blank" as const,
        question: "The exhibit on Computer History is located on the _________ floor.",
        correctAnswer: "first",
        orderIndex: 1,
      },

      // Qs for L10 (Essay Tutoring)
      {
        id: crypto.randomUUID(),
        testId: ltIds[9],
        type: "multiple_choice" as const,
        question: "What report should Sarah cite in paragraph three?",
        options: [
          "A. 2018 United Nations climate report",
          "B. 2020 Global energy index",
          "C. 2015 Environmental protection analysis",
          "D. 2019 Green ecology paper"
        ],
        correctAnswer: "A",
        orderIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        testId: ltIds[9],
        type: "fill_blank" as const,
        question: "The tutor advises that the conclusion should _________ the main ideas.",
        correctAnswer: "summarize",
        orderIndex: 1,
      }
    ];

    await db.insert(schema.listeningQuestions).values(lqValues);
    console.log("✓ 10 Listening tests & questions seeded.");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Failed to seed database:", error);
  } finally {
    await connection.end();
  }
}

main();
