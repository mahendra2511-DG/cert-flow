export type CatalogProvider = {
  slug: string;
  name: string;
  description: string;
};

export type CatalogCertification = {
  slug: string;
  code: string;
  name: string;
  summary: string;
  description: string;
  level: string;
  durationMin: number;
  providerSlug: string;
};

export type CatalogPracticeTest = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  questionCount: number;
  timeLimitMin: number;
  passingScore: number;
  pricePaise: number;
  certificationSlug: string;
};

export const providers: CatalogProvider[] = [
  {
    slug: "amazon-web-services",
    name: "Amazon Web Services",
    description: "Cloud architecture, operations, and security tracks.",
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    description: "Azure, security, and productivity certifications.",
  },
  {
    slug: "comptia",
    name: "CompTIA",
    description: "Vendor-neutral foundations for infrastructure and security.",
  },
  {
    slug: "google-cloud",
    name: "Google Cloud",
    description: "Engineer and architect paths on Google Cloud.",
  },
];

export const certifications: CatalogCertification[] = [
  {
    slug: "aws-solutions-architect-associate",
    code: "SAA-C03",
    name: "AWS Solutions Architect Associate",
    summary: "Design resilient, cost-aware architectures on AWS.",
    description:
      "This PrepHarbor path covers well-architected design, networking, storage, and identity. Questions are original scenarios written for study, not a copy of any vendor exam.",
    level: "Associate",
    durationMin: 130,
    providerSlug: "amazon-web-services",
  },
  {
    slug: "azure-fundamentals",
    code: "AZ-900",
    name: "Azure Fundamentals",
    summary: "Core Azure services, pricing, and shared responsibility.",
    description:
      "A first-pass practice set for people new to Azure. Each item includes a short explanation so you can see why an option is stronger than the others.",
    level: "Fundamentals",
    durationMin: 45,
    providerSlug: "microsoft",
  },
  {
    slug: "security-plus",
    code: "SY0-701",
    name: "Security+",
    summary: "Threats, architecture, operations, and governance basics.",
    description:
      "Scenario-driven items that check whether you can choose a control, not just recall a definition. Built for timed practice and later review.",
    level: "Intermediate",
    durationMin: 90,
    providerSlug: "comptia",
  },
  {
    slug: "google-cloud-associate-engineer",
    code: "ACE",
    name: "Associate Cloud Engineer",
    summary: "Deploy, monitor, and operate workloads on Google Cloud.",
    description:
      "Practice covering IAM, Compute Engine, GKE basics, and operations. Original wording, mapped to publicly documented skill areas.",
    level: "Associate",
    durationMin: 120,
    providerSlug: "google-cloud",
  },
];

export const practiceTests: CatalogPracticeTest[] = [
  {
    slug: "saa-c03-full-length",
    title: "SAA-C03 Full-Length Practice Exam",
    summary: "65 original scenario questions with explanations.",
    description:
      "Sit a timed exam that mirrors the pacing of the associate architect test. After submit, you get a score breakdown and per-question rationale.",
    questionCount: 65,
    timeLimitMin: 130,
    passingScore: 72,
    pricePaise: 149900,
    certificationSlug: "aws-solutions-architect-associate",
  },
  {
    slug: "az-900-core-drill",
    title: "AZ-900 Core Concepts Drill",
    summary: "40 mixed items across cloud concepts and Azure services.",
    description:
      "A shorter set for a first pass. Purchase unlocks unlimited retakes and explanation review.",
    questionCount: 40,
    timeLimitMin: 45,
    passingScore: 70,
    pricePaise: 79900,
    certificationSlug: "azure-fundamentals",
  },
  {
    slug: "sy0-701-security-lab",
    title: "SY0-701 Security Operations Lab",
    summary: "50 items on controls, incidents, and architecture.",
    description:
      "Practice choosing the next action in a security scenario. Explanations call out why similar options fail.",
    questionCount: 50,
    timeLimitMin: 75,
    passingScore: 75,
    pricePaise: 129900,
    certificationSlug: "security-plus",
  },
  {
    slug: "ace-ops-practice",
    title: "ACE Operations Practice Set",
    summary: "55 questions on deploy, monitor, and IAM.",
    description:
      "A full practice sitting for Associate Cloud Engineer skills, with timed mode and a review notebook after purchase.",
    questionCount: 55,
    timeLimitMin: 120,
    passingScore: 70,
    pricePaise: 119900,
    certificationSlug: "google-cloud-associate-engineer",
  },
];

export function providerBySlug(slug: string) {
  return providers.find((item) => item.slug === slug);
}

export function certificationBySlug(slug: string) {
  return certifications.find((item) => item.slug === slug);
}

export function practiceTestBySlug(slug: string) {
  return practiceTests.find((item) => item.slug === slug);
}

export function testsForCertification(slug: string) {
  return practiceTests.filter((item) => item.certificationSlug === slug);
}

export function searchCatalog(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { certifications, practiceTests };
  }

  return {
    certifications: certifications.filter((item) =>
      [item.name, item.code, item.summary, item.providerSlug].some((value) =>
        value.toLowerCase().includes(q),
      ),
    ),
    practiceTests: practiceTests.filter((item) =>
      [item.title, item.summary, item.slug].some((value) =>
        value.toLowerCase().includes(q),
      ),
    ),
  };
}
