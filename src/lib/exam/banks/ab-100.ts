import type { ExamQuestion } from "@/lib/exam/types";

function option(testSlug: string, order: number, label: string, body: string, isCorrect: boolean) {
  return { id: `${testSlug}-q${order}-${label}`, label, body, isCorrect };
}

function single(
  testSlug: string,
  order: number,
  prompt: string,
  explanation: string,
  choices: Array<[string, boolean]>,
): ExamQuestion {
  const labels = ["A", "B", "C", "D"];
  return {
    id: `${testSlug}-q${order}`,
    order,
    type: "SINGLE_CHOICE",
    prompt,
    explanation,
    options: choices.map(([body, isCorrect], index) =>
      option(testSlug, order, labels[index] ?? String(index + 1), body, isCorrect),
    ),
  };
}

const stems: Array<{ prompt: string; explanation: string; correct: string; wrong: [string, string, string] }> = [
  {
    prompt: "A hospital chatbot must refuse to invent drug dosages. Which principle should the team prioritize?",
    explanation: "Safety and human oversight beat a fluent but fabricated dosage. Keep a clinician in the loop.",
    correct: "Require human review before any clinical recommendation is shown",
    wrong: ["Maximize fluency even if facts are guessed", "Disable logging to protect speed", "Train only on social media comments"],
  },
  {
    prompt: "A retailer wants product-image captions generated at scale. Which service style fits that workload?",
    explanation: "Vision captioning is an image-understanding job, not a speech-to-text or search-index job.",
    correct: "An image analysis / computer-vision captioning API",
    wrong: ["A telephony voice gateway", "A packet capture appliance", "A hardware TPM only"],
  },
  {
    prompt: "A model scores loan applications. What is the most responsible next step before launch?",
    explanation: "Measure disparate impact and document the decision policy. Shipping untested scoring is not responsible AI.",
    correct: "Evaluate fairness metrics and document human appeal paths",
    wrong: ["Hide the model from auditors", "Use only the highest-risk features", "Skip monitoring after go-live"],
  },
  {
    prompt: "Users dictate notes on a factory floor. Which capability matches the constraint?",
    explanation: "Speech-to-text is the matching service when the input is audio and the output is text.",
    correct: "Speech-to-text transcription",
    wrong: ["Offline tape backup only", "A content delivery network", "A barcode printer"],
  },
  {
    prompt: "A support bot must not reveal another customer’s ticket. Which control is essential?",
    explanation: "Authorization and data isolation prevent cross-tenant leakage, even if the model is fluent.",
    correct: "Enforce tenant-scoped retrieval before the model answers",
    wrong: ["Increase temperature for creativity", "Share one prompt cache across all tenants", "Disable authentication"],
  },
  {
    prompt: "A team wants to classify support emails into billing vs. outage. What is the simplest fit?",
    explanation: "Text classification maps labeled categories. It is not a video indexer or a DNS change.",
    correct: "A text classification model with labeled examples",
    wrong: ["A GPU reservation with no labels", "Changing MX records", "A 3D renderer"],
  },
  {
    prompt: "Which statement about training data is true for a workplace copilot?",
    explanation: "You need rights to the data and a path to remove sensitive records. Scraping random web pages is not a license.",
    correct: "Use data you are licensed to process and filter secrets before training",
    wrong: ["Copy a competitor’s private corpus", "Ignore retention policies", "Store passwords in the prompt"],
  },
  {
    prompt: "An app translates product manuals into five languages. Which capability is the match?",
    explanation: "Document or text translation is the dedicated capability; a firewall is not.",
    correct: "A translation service for text or documents",
    wrong: ["A BGP peer", "A SAN switch", "A raster plotter"],
  },
  {
    prompt: "A model might output copyrighted lyrics. What should the product do?",
    explanation: "Block or cite restricted content and keep a human appeal path. Silent regurgitation is a risk.",
    correct: "Apply content filters and refuse copyrighted verbatim output",
    wrong: ["Always recite the training excerpt", "Turn filters off for engagement", "Email the full training set to users"],
  },
  {
    prompt: "Which metric best tracks whether a classifier is guessing a rare class?",
    explanation: "Precision/recall on the rare class beats overall accuracy when the set is imbalanced.",
    correct: "Precision and recall for the rare class",
    wrong: ["Only overall accuracy", "GPU temperature", "CDN cache hit ratio"],
  },
  {
    prompt: "A kiosk reads handwritten forms. Which Azure-style capability applies?",
    explanation: "OCR / document intelligence extracts print and handwriting. A load balancer does not.",
    correct: "Optical character recognition on the form image",
    wrong: ["SMTP relay", "Anycast DNS", "A RAID controller"],
  },
  {
    prompt: "Stakeholders ask why a model denied a claim. What should you provide?",
    explanation: "An explanation of features and a human review path. “The neural net said so” is not enough.",
    correct: "A documented rationale plus a human appeal",
    wrong: ["A screenshot of GPU graphs", "The raw private training row", "No record of the decision"],
  },
  {
    prompt: "A chatbot must stay on-policy for a regulated bank. Which pattern helps?",
    explanation: "Ground answers in approved retrieval sources and refuse when sources are missing.",
    correct: "Retrieval from an approved knowledge base with refusal on gaps",
    wrong: ["Unconstrained web browsing for every answer", "Higher temperature by default", "Shared admin tokens in the prompt"],
  },
  {
    prompt: "Which data class should never be pasted into an unmanaged prompt?",
    explanation: "Secrets, government IDs, and health records need a governed path, not a public playground.",
    correct: "Credentials, government IDs, and protected health details",
    wrong: ["Public marketing slogans", "The office street address", "A published blog URL"],
  },
  {
    prompt: "A team detects drift after a catalog change. What is the first operational step?",
    explanation: "Monitor, compare against a baseline, and re-evaluate. Ignoring drift lets quality decay.",
    correct: "Compare live metrics to a baseline and re-evaluate the model",
    wrong: ["Delete monitoring to save cost", "Ship without logs", "Retrain on a single outlier"],
  },
  {
    prompt: "You need to extract key-value pairs from invoices. Which capability fits?",
    explanation: "Document intelligence / form extraction is built for invoices. A CDN is not.",
    correct: "Form or document field extraction",
    wrong: ["A syslog forwarder", "A spanning-tree tweak", "A color profile"],
  },
  {
    prompt: "Which human-in-the-loop design is appropriate for refund decisions over a threshold?",
    explanation: "High-impact money movement should pause for a reviewer. Full automation of large refunds is risky.",
    correct: "Queue high-value refunds for a human approver",
    wrong: ["Auto-approve every refund instantly", "Hide the decision from finance", "Store PAN data in chat logs"],
  },
  {
    prompt: "A voice agent must detect a wake phrase in noisy audio. What is the matching skill?",
    explanation: "Keyword spotting / speech recognition with noise handling, not a packet sniffer.",
    correct: "Speech recognition with a custom keyword model",
    wrong: ["Port mirroring", "NTP authentication", "A plotter driver"],
  },
  {
    prompt: "What is a valid reason to decline generating an image of a real private individual?",
    explanation: "Likeness and consent. Public clip-art of objects is a different case.",
    correct: "Missing consent to reproduce a real person’s likeness",
    wrong: ["The prompt used complete sentences", "The GPU was idle", "The user is on a laptop"],
  },
  {
    prompt: "A search experience should rank internal wiki pages. Which pattern applies?",
    explanation: "Semantic or hybrid search over your corpus, with access control, is the fit.",
    correct: "Authenticated semantic search over the wiki index",
    wrong: ["Open recursive DNS", "Public anonymous FTP", "A BIOS update"],
  },
  {
    prompt: "Which practice reduces prompt injection from untrusted documents?",
    explanation: "Treat retrieved text as data, not instructions, and isolate tool permissions.",
    correct: "Separate untrusted content from system instructions and limit tools",
    wrong: ["Concatenate every document into the system prompt", "Grant the model production admin", "Disable output filters"],
  },
  {
    prompt: "A dashboard should show sentiment of public reviews. What is the matching task?",
    explanation: "Sentiment analysis on text. It is not a SAN snapshot.",
    correct: "Sentiment classification of the review text",
    wrong: ["Fibre Channel zoning", "PXE boot", "A CRL publish"],
  },
  {
    prompt: "Which logging choice supports an audit of AI decisions?",
    explanation: "Store prompts, retrieval IDs, model version, and actor with retention controls—not raw secrets.",
    correct: "Log model version, retrieval IDs, and actor with secret redaction",
    wrong: ["Log full passwords in plaintext", "Log nothing", "Overwrite logs every minute"],
  },
  {
    prompt: "A factory camera should flag empty shelves. Which modality is this?",
    explanation: "Computer vision / object detection on video frames.",
    correct: "Object detection on shelf images",
    wrong: ["SMTP greylisting", "BGP communities", "A toner reset"],
  },
  {
    prompt: "When should you pick a smaller specialized model over a giant general model?",
    explanation: "When latency, cost, or a narrow task (classification) dominate, a smaller specialist often wins.",
    correct: "When the task is narrow and latency or cost is constrained",
    wrong: ["Always, even for open-ended research with no budget", "Never; bigger is always required", "Only when GPUs are overheating"],
  },
  {
    prompt: "A user asks the bot for another employee’s salary. What should it do?",
    explanation: "Refuse and point to HR policy. Payroll is not a public retrieval source.",
    correct: "Refuse and direct the user to the official HR process",
    wrong: ["Guess a number to be helpful", "Search personal drives without auth", "Post the answer in a public channel"],
  },
  {
    prompt: "Which evaluation set is healthiest before launch?",
    explanation: "Held-out labeled cases covering rare failures beat testing only on the training rows.",
    correct: "A held-out labeled set that includes rare failure cases",
    wrong: ["Only the rows used for training", "A single happy-path demo", "Production traffic with no labels"],
  },
  {
    prompt: "You must summarize long policies for employees. What grounding approach is safest?",
    explanation: "Retrieve the current policy version and cite it. Uncited free generation can drift.",
    correct: "Retrieve the current policy and cite the source in the summary",
    wrong: ["Invent a friendlier policy", "Train on a 2014 PDF only", "Disable citations to save tokens"],
  },
  {
    prompt: "A multilingual call center needs real-time captions. Which pairing fits?",
    explanation: "Speech-to-text plus translation. A plotter queue does not.",
    correct: "Streaming speech recognition with translation",
    wrong: ["Batch payroll export", "iSCSI login", "A color lookup table"],
  },
  {
    prompt: "Which statement is true about PrepHarbor AB-100 practice items?",
    explanation: "They are original study scenarios. They are not official Microsoft exam dumps.",
    correct: "They are original PrepHarbor scenarios for study, not official exam content",
    wrong: ["They are leaked live exam items", "They replace a vendor certification", "They must be shared on forums"],
  },
];

export function ab100Questions(): ExamQuestion[] {
  const slug = "ab-100-ai-drill";
  return stems.map((item, index) =>
    single(slug, index + 1, item.prompt, item.explanation, [
      [item.wrong[0], false],
      [item.correct, true],
      [item.wrong[1], false],
      [item.wrong[2], false],
    ]),
  );
}
