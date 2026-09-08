import type { CatalogFaq, CatalogTestimonial } from "@/lib/catalog/types";

export type SeedVendor = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
};

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  accent: string;
  href: string;
};

export type SeedPracticeTest = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  questionCount: number;
  timeLimitMin: number;
  passingScore: number;
  pricePaise: number;
  ratingAverage: number;
  ratingCount: number;
  isPopular: boolean;
};

export type SeedExam = {
  slug: string;
  vendorSlug: string;
  categorySlugs: string[];
  code: string;
  name: string;
  summary: string;
  description: string;
  level: string;
  durationMin: number;
  passingScore: number;
  language: string;
  examFormat: string;
  isPopular: boolean;
  seoTitle: string;
  seoDescription: string;
  outcomes: string[];
  faqs: CatalogFaq[];
  tests: SeedPracticeTest[];
};

export const seedVendors: SeedVendor[] = [
  {
    slug: "microsoft",
    name: "Microsoft",
    description: "Azure, identity, and Microsoft 365 certification tracks.",
    longDescription:
      "PrepHarbor’s Microsoft catalog covers Azure fundamentals and administration plus Microsoft 365 literacy. Practice items are original scenarios written against publicly documented skill areas—not vendor exam dumps.",
  },
  {
    slug: "aws",
    name: "AWS",
    description: "Architecture, operations, and cloud practitioner paths.",
    longDescription:
      "Amazon Web Services practice on PrepHarbor focuses on well-architected decisions, billing literacy, and operational trade-offs. Sit a timed test, then review why a cheaper or more available option wins.",
  },
  {
    slug: "google-cloud",
    name: "Google Cloud",
    description: "Engineer and operations tracks on Google Cloud.",
    longDescription:
      "Google Cloud practice here emphasizes IAM, compute, Kubernetes basics, and operations. Explanations call out the product that actually fits the constraint in the prompt.",
  },
  {
    slug: "cisco",
    name: "Cisco",
    description: "Campus networking and enterprise infrastructure exams.",
    longDescription:
      "Cisco practice on PrepHarbor is built around campus forwarding, wireless, and automation basics. Items ask for a next hop or protocol choice, then explain the near-miss.",
  },
  {
    slug: "comptia",
    name: "CompTIA",
    description: "Vendor-neutral security, networking, and operations.",
    longDescription:
      "CompTIA tracks on PrepHarbor stay vendor-neutral. Security+ and Network+ sets check whether you can pick a control or a troubleshooting step, not recite a glossary.",
  },
  {
    slug: "cloud-native",
    name: "Cloud Native",
    description: "Kubernetes and platform engineering credentials.",
    longDescription:
      "Cloud Native practice currently centers on Certified Kubernetes Administrator concepts: scheduling, networking, and recovery. It is conceptual prep to sit beside a hands-on lab day.",
  },
];

export const seedCategories: SeedCategory[] = [
  {
    slug: "azure",
    name: "Azure",
    description: "Core services, administration, and shared responsibility.",
    accent: "from-blue-100 to-white",
    href: "/certifications?category=azure",
  },
  {
    slug: "aws",
    name: "AWS",
    description: "Architecture, cost, and operational scenario practice.",
    accent: "from-amber-100 to-white",
    href: "/certifications/aws",
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    description: "Identity, Microsoft 365, and cross-cloud fundamentals.",
    accent: "from-sky-100 to-white",
    href: "/certifications/microsoft",
  },
  {
    slug: "google-cloud",
    name: "Google Cloud",
    description: "Deploy, observe, and operate workloads on GCP.",
    accent: "from-emerald-100 to-white",
    href: "/certifications/google-cloud",
  },
  {
    slug: "cisco",
    name: "Cisco",
    description: "Routing, switching, and campus network design.",
    accent: "from-cyan-100 to-white",
    href: "/certifications/cisco",
  },
  {
    slug: "comptia",
    name: "CompTIA",
    description: "Security, networking, and operations foundations.",
    accent: "from-rose-100 to-white",
    href: "/certifications/comptia",
  },
  {
    slug: "kubernetes",
    name: "Other providers",
    description: "Kubernetes and platform exams beyond the big three clouds.",
    accent: "from-violet-100 to-white",
    href: "/certifications/cloud-native",
  },
  {
    slug: "fundamentals",
    name: "Fundamentals",
    description: "First-pass credentials for people new to a platform.",
    accent: "from-stone-100 to-white",
    href: "/certifications?category=fundamentals",
  },
  {
    slug: "security",
    name: "Security",
    description: "Controls, incidents, and governance practice.",
    accent: "from-red-100 to-white",
    href: "/certifications?category=security",
  },
  {
    slug: "networking",
    name: "Networking",
    description: "Connectivity, forwarding, and troubleshooting.",
    accent: "from-teal-100 to-white",
    href: "/certifications?category=networking",
  },
];

const sharedExamFaqs: CatalogFaq[] = [
  {
    question: "Is this an official vendor exam?",
    answer:
      "No. PrepHarbor sells independent practice tests. Passing a PrepHarbor sitting does not confer a vendor credential.",
  },
  {
    question: "What does a purchase include?",
    answer:
      "Online exam access, retakes, a score report, and per-question explanations. Tests run in the browser.",
  },
];

export const seedExams: SeedExam[] = [
  {
    slug: "az-900",
    vendorSlug: "microsoft",
    categorySlugs: ["azure", "microsoft", "fundamentals"],
    code: "AZ-900",
    name: "Azure Fundamentals",
    summary: "Cloud concepts, Azure services, and pricing models.",
    description:
      "Original scenario items for people new to Azure. Explanations compare similar options so you learn the distinction, not a memorized phrase. Mapped to publicly documented fundamentals skill areas.",
    level: "Fundamentals",
    durationMin: 45,
    passingScore: 70,
    language: "English",
    examFormat: "Multiple choice, single and multiple response",
    isPopular: true,
    seoTitle: "AZ-900 Azure Fundamentals practice test",
    seoDescription:
      "Timed AZ-900 practice with original questions, explanations, and INR checkout on PrepHarbor.",
    outcomes: [
      "Describe cloud concepts and shared responsibility",
      "Identify core Azure services and management tools",
      "Compare pricing, SLA, and lifecycle choices",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "az-900-core-drill",
        title: "AZ-900 Core Concepts Drill",
        summary: "A first-pass Azure fundamentals sitting.",
        description:
          "Forty mixed items across cloud concepts and Azure services. Purchase unlocks retakes and explanation review.",
        questionCount: 40,
        timeLimitMin: 45,
        passingScore: 70,
        pricePaise: 79900,
        ratingAverage: 4.6,
        ratingCount: 268,
        isPopular: true,
      },
    ],
  },
  {
    slug: "az-104",
    vendorSlug: "microsoft",
    categorySlugs: ["azure", "microsoft"],
    code: "AZ-104",
    name: "Azure Administrator",
    summary: "Identity, compute, storage, and virtual networking.",
    description:
      "Practice choosing the next admin action in a working Azure environment. Items are written for study, not copied from any vendor exam.",
    level: "Associate",
    durationMin: 120,
    passingScore: 70,
    language: "English",
    examFormat: "Multiple choice and scenario sets",
    isPopular: true,
    seoTitle: "AZ-104 Azure Administrator practice test",
    seoDescription:
      "Associate-level Azure admin practice covering identity, networking, and storage, with timed review.",
    outcomes: [
      "Manage identities and governance",
      "Implement storage and virtual networks",
      "Monitor and back up Azure resources",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "az-104-admin-practice",
        title: "AZ-104 Administrator Practice Set",
        summary: "Identity, networking, and storage operations.",
        description:
          "Associate-level admin scenarios with a 120-minute timer and domain-level scoring.",
        questionCount: 60,
        timeLimitMin: 120,
        passingScore: 70,
        pricePaise: 159900,
        ratingAverage: 4.7,
        ratingCount: 191,
        isPopular: true,
      },
    ],
  },
  {
    slug: "ms-900",
    vendorSlug: "microsoft",
    categorySlugs: ["microsoft", "fundamentals"],
    code: "MS-900",
    name: "Microsoft 365 Fundamentals",
    summary: "Cloud productivity, security, and compliance basics.",
    description:
      "A first-pass set covering service families and when to recommend Microsoft 365 versus competing suites.",
    level: "Fundamentals",
    durationMin: 60,
    passingScore: 70,
    language: "English",
    examFormat: "Multiple choice",
    isPopular: false,
    seoTitle: "MS-900 Microsoft 365 Fundamentals practice",
    seoDescription:
      "Practice Microsoft 365 fundamentals with original PrepHarbor questions and explanations.",
    outcomes: [
      "Describe Microsoft 365 apps and services",
      "Explain security, compliance, and privacy options",
      "Compare licensing and support models",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "ms-900-foundations",
        title: "MS-900 Foundations Practice",
        summary: "Service families, security, and licensing literacy.",
        description: "A 45-minute first sitting for Microsoft 365 fundamentals.",
        questionCount: 40,
        timeLimitMin: 45,
        passingScore: 70,
        pricePaise: 74900,
        ratingAverage: 4.3,
        ratingCount: 84,
        isPopular: false,
      },
    ],
  },
  {
    slug: "saa-c03",
    vendorSlug: "aws",
    categorySlugs: ["aws"],
    code: "SAA-C03",
    name: "AWS Solutions Architect Associate",
    summary: "Resilient, cost-aware architectures on AWS.",
    description:
      "Well-architected design, networking, storage, and identity. Questions are original scenarios mapped to publicly documented skill areas.",
    level: "Associate",
    durationMin: 130,
    passingScore: 72,
    language: "English",
    examFormat: "Multiple choice and multiple response",
    isPopular: true,
    seoTitle: "SAA-C03 AWS Solutions Architect practice test",
    seoDescription:
      "Full-length SAA-C03 practice with timed scenarios, explanations, and INR pricing.",
    outcomes: [
      "Design resilient multi-tier architectures",
      "Select storage, compute, and networking for cost and availability",
      "Apply IAM and encryption patterns",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "saa-c03-full-length",
        title: "SAA-C03 Full-Length Practice Exam",
        summary: "Timed architect scenarios with a full explanation set.",
        description:
          "Sit a paced exam that matches associate architect stamina. After submit, review a score breakdown and per-question rationale.",
        questionCount: 65,
        timeLimitMin: 130,
        passingScore: 72,
        pricePaise: 149900,
        ratingAverage: 4.8,
        ratingCount: 412,
        isPopular: true,
      },
    ],
  },
  {
    slug: "clf-c02",
    vendorSlug: "aws",
    categorySlugs: ["aws", "fundamentals"],
    code: "CLF-C02",
    name: "AWS Cloud Practitioner",
    summary: "Cloud value, billing, and core AWS services.",
    description:
      "A shorter catalog for a first AWS sitting. Useful before moving into associate architect practice.",
    level: "Foundational",
    durationMin: 90,
    passingScore: 70,
    language: "English",
    examFormat: "Multiple choice",
    isPopular: false,
    seoTitle: "CLF-C02 AWS Cloud Practitioner practice",
    seoDescription:
      "Foundational AWS practice covering billing, shared responsibility, and core services.",
    outcomes: [
      "Explain the AWS value proposition and pricing models",
      "Identify core services by use case",
      "Describe security and compliance shared responsibility",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "clf-c02-foundations",
        title: "CLF-C02 Cloud Foundations",
        summary: "Billing, shared responsibility, and core services.",
        description:
          "A shorter AWS sitting for a first attempt. Pairs well with the architect practice exam later.",
        questionCount: 50,
        timeLimitMin: 90,
        passingScore: 70,
        pricePaise: 89900,
        ratingAverage: 4.5,
        ratingCount: 176,
        isPopular: false,
      },
    ],
  },
  {
    slug: "ace",
    vendorSlug: "google-cloud",
    categorySlugs: ["google-cloud"],
    code: "ACE",
    name: "Associate Cloud Engineer",
    summary: "Deploy, monitor, and operate workloads on Google Cloud.",
    description:
      "IAM, Compute Engine, GKE basics, and operations. Original wording with timed practice and review.",
    level: "Associate",
    durationMin: 120,
    passingScore: 70,
    language: "English",
    examFormat: "Multiple choice",
    isPopular: true,
    seoTitle: "Google Cloud Associate Cloud Engineer practice",
    seoDescription:
      "ACE practice covering deploy, IAM, and operations with timed review on PrepHarbor.",
    outcomes: [
      "Set up projects, billing, and IAM",
      "Deploy and monitor compute workloads",
      "Operate storage and basic Kubernetes resources",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "ace-ops-practice",
        title: "ACE Operations Practice Set",
        summary: "Deploy, monitor, and IAM on Google Cloud.",
        description:
          "A full practice sitting for Associate Cloud Engineer skills, with timed mode and a review notebook after purchase.",
        questionCount: 55,
        timeLimitMin: 120,
        passingScore: 70,
        pricePaise: 119900,
        ratingAverage: 4.5,
        ratingCount: 154,
        isPopular: true,
      },
    ],
  },
  {
    slug: "200-301",
    vendorSlug: "cisco",
    categorySlugs: ["cisco", "networking"],
    code: "200-301",
    name: "Cisco Certified Network Associate",
    summary: "Switching, routing, wireless, and automation basics.",
    description:
      "Campus network scenarios that ask you to pick a protocol or next hop, then explain why the near-miss options fail.",
    level: "Associate",
    durationMin: 120,
    passingScore: 80,
    language: "English",
    examFormat: "Multiple choice and simulation-style scenarios",
    isPopular: true,
    seoTitle: "CCNA 200-301 practice test",
    seoDescription:
      "Campus networking practice for CCNA 200-301 with original scenarios and explanations.",
    outcomes: [
      "Forward frames and packets in a campus design",
      "Choose wireless and IP services appropriately",
      "Recognize basic automation and security controls",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "ccna-campus-practice",
        title: "CCNA Campus Networking Practice",
        summary: "Switching, routing, and wireless decision items.",
        description:
          "Original campus scenarios with diagrams described in text. Built for a 120-minute sitting.",
        questionCount: 70,
        timeLimitMin: 120,
        passingScore: 80,
        pricePaise: 139900,
        ratingAverage: 4.6,
        ratingCount: 221,
        isPopular: true,
      },
    ],
  },
  {
    slug: "sy0-701",
    vendorSlug: "comptia",
    categorySlugs: ["comptia", "security"],
    code: "SY0-701",
    name: "Security+",
    summary: "Threats, architecture, operations, and governance.",
    description:
      "Scenario-driven items that check whether you can choose a control, not just recall a definition.",
    level: "Intermediate",
    durationMin: 90,
    passingScore: 75,
    language: "English",
    examFormat: "Multiple choice and performance-style scenarios",
    isPopular: true,
    seoTitle: "CompTIA Security+ SY0-701 practice test",
    seoDescription:
      "SY0-701 practice covering controls, incidents, and architecture with instant scoring.",
    outcomes: [
      "Select preventive and detective controls",
      "Respond to a described incident",
      "Apply governance and risk language in context",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "sy0-701-security-lab",
        title: "SY0-701 Security Operations Lab",
        summary: "Controls, incidents, and architecture choices.",
        description:
          "Practice choosing the next action in a security scenario. Explanations call out why similar options fail.",
        questionCount: 50,
        timeLimitMin: 75,
        passingScore: 75,
        pricePaise: 129900,
        ratingAverage: 4.9,
        ratingCount: 337,
        isPopular: true,
      },
    ],
  },
  {
    slug: "n10-009",
    vendorSlug: "comptia",
    categorySlugs: ["comptia", "networking"],
    code: "N10-009",
    name: "Network+",
    summary: "Connectivity, troubleshooting, and network operations.",
    description:
      "Practice diagnosing a broken path and choosing the least-invasive fix. Built for timed sittings and later review.",
    level: "Intermediate",
    durationMin: 90,
    passingScore: 72,
    language: "English",
    examFormat: "Multiple choice and troubleshooting scenarios",
    isPopular: false,
    seoTitle: "CompTIA Network+ N10-009 practice test",
    seoDescription:
      "Network+ practice for connectivity and troubleshooting with original PrepHarbor items.",
    outcomes: [
      "Trace a path across L2 and L3",
      "Choose a troubleshooting step with least disruption",
      "Describe common WAN and wireless options",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "n10-009-path-lab",
        title: "N10-009 Path Troubleshooting Lab",
        summary: "Connectivity and operations scenarios.",
        description: "A 75-minute Network+ sitting focused on diagnosing broken paths.",
        questionCount: 48,
        timeLimitMin: 75,
        passingScore: 72,
        pricePaise: 119900,
        ratingAverage: 4.4,
        ratingCount: 102,
        isPopular: false,
      },
    ],
  },
  {
    slug: "cka",
    vendorSlug: "cloud-native",
    categorySlugs: ["kubernetes"],
    code: "CKA",
    name: "Certified Kubernetes Administrator",
    summary: "Cluster architecture, workloads, and troubleshooting.",
    description:
      "Scenario practice for scheduling, networking, and recovery. Written for conceptual prep, not as a dump of lab tasks.",
    level: "Professional",
    durationMin: 120,
    passingScore: 66,
    language: "English",
    examFormat: "Scenario multiple choice (conceptual prep)",
    isPopular: false,
    seoTitle: "CKA conceptual practice test",
    seoDescription:
      "Certified Kubernetes Administrator conceptual practice with explanations on PrepHarbor.",
    outcomes: [
      "Reason about scheduling and workload placement",
      "Describe cluster networking and services",
      "Plan recovery from a failed control-plane or node event",
    ],
    faqs: sharedExamFaqs,
    tests: [
      {
        slug: "cka-cluster-review",
        title: "CKA Cluster Concepts Review",
        summary: "Scheduling, networking, and recovery scenarios.",
        description:
          "Conceptual Kubernetes practice to sit before a hands-on lab day. Includes explanation-first review.",
        questionCount: 45,
        timeLimitMin: 90,
        passingScore: 66,
        pricePaise: 169900,
        ratingAverage: 4.4,
        ratingCount: 98,
        isPopular: false,
      },
    ],
  },
];

export const seedTestimonials: CatalogTestimonial[] = [
  {
    quote:
      "The timer and explanation review changed how I studied. I stopped guessing and started writing down why the wrong options failed.",
    name: "Ananya R.",
    role: "Cloud engineer, Bengaluru",
    exam: "SAA-C03",
  },
  {
    quote:
      "I wanted original practice, not a recycled dump. PrepHarbor’s Azure set felt like work scenarios I actually see on the job.",
    name: "Marcus L.",
    role: "Systems administrator, Pune",
    exam: "AZ-104",
  },
  {
    quote:
      "Paying in INR and sitting the test in the browser kept the whole loop in one place. I retake missed domains the night before.",
    name: "Priya S.",
    role: "Security analyst, Hyderabad",
    exam: "SY0-701",
  },
];

export const seedSiteFaqs: CatalogFaq[] = [
  {
    question: "Are these the official vendor exams?",
    answer:
      "No. PrepHarbor sells independent practice tests written for study. We are not affiliated with Microsoft, Amazon, Google, Cisco, CompTIA, or the Cloud Native Computing Foundation.",
  },
  {
    question: "What do I receive after purchase?",
    answer:
      "Access to the online exam, retakes, a score report, and per-question explanations. Tests are taken in the browser—no PDF dump is required.",
  },
  {
    question: "How are questions kept current?",
    answer:
      "Authors refresh items when public skill outlines change. Each test shows a last-updated note once the database-backed catalog is live.",
  },
  {
    question: "Can I pay in Indian rupees?",
    answer:
      "Yes. Checkout uses Razorpay for INR payments. UPI, cards, and net banking are available once Razorpay keys are configured.",
  },
  {
    question: "Do you offer a pass guarantee?",
    answer:
      "We do not promise a vendor pass. Practice quality is the product: timed sittings, explanations, and progress you can review.",
  },
];

export function examPath(vendorSlug: string, examSlug: string) {
  return `/certifications/${vendorSlug}/${examSlug}`;
}

export function vendorPath(vendorSlug: string) {
  return `/certifications/${vendorSlug}`;
}

export function findPracticeTestBySlug(slug: string) {
  for (const exam of seedExams) {
    const test = exam.tests.find((item) => item.slug === slug);
    if (test) {
      return { exam, test, vendorSlug: exam.vendorSlug };
    }
  }
  return null;
}
