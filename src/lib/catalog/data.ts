import type {
  CatalogCategory,
  CatalogCertification,
  CatalogFaq,
  CatalogPracticeTest,
  CatalogProvider,
  CatalogTestimonial,
} from "@/lib/catalog/types";

/**
 * Static catalog used until PostgreSQL is connected.
 * Swap these arrays for Prisma queries in `src/lib/catalog/queries.ts`.
 */
export const providers: CatalogProvider[] = [
  {
    slug: "microsoft",
    name: "Microsoft",
    description: "Azure, security, and Microsoft 365 certification tracks.",
  },
  {
    slug: "amazon-web-services",
    name: "Amazon Web Services",
    description: "Architecture, operations, and cloud practitioner paths.",
  },
  {
    slug: "google-cloud",
    name: "Google Cloud",
    description: "Engineer and architect tracks on Google Cloud.",
  },
  {
    slug: "cisco",
    name: "Cisco",
    description: "Networking and enterprise infrastructure exams.",
  },
  {
    slug: "comptia",
    name: "CompTIA",
    description: "Vendor-neutral security, networking, and operations.",
  },
  {
    slug: "cloud-native",
    name: "Cloud Native",
    description: "Kubernetes and platform engineering credentials.",
  },
];

export const categories: CatalogCategory[] = [
  {
    slug: "microsoft",
    name: "Microsoft",
    description: "Identity, Microsoft 365, and cross-cloud fundamentals.",
    hrefQuery: "microsoft",
    accent: "from-sky-100 to-white",
  },
  {
    slug: "aws",
    name: "AWS",
    description: "Architecture, cost, and operational scenario practice.",
    hrefQuery: "aws",
    accent: "from-amber-100 to-white",
  },
  {
    slug: "azure",
    name: "Azure",
    description: "Core services, administration, and shared responsibility.",
    hrefQuery: "azure",
    accent: "from-blue-100 to-white",
  },
  {
    slug: "google-cloud",
    name: "Google Cloud",
    description: "Deploy, observe, and operate workloads on GCP.",
    hrefQuery: "google",
    accent: "from-emerald-100 to-white",
  },
  {
    slug: "cisco",
    name: "Cisco",
    description: "Routing, switching, and campus network design.",
    hrefQuery: "cisco",
    accent: "from-cyan-100 to-white",
  },
  {
    slug: "comptia",
    name: "CompTIA",
    description: "Security, networking, and operations foundations.",
    hrefQuery: "comptia",
    accent: "from-rose-100 to-white",
  },
  {
    slug: "other",
    name: "Other providers",
    description: "Kubernetes and platform exams beyond the big three clouds.",
    hrefQuery: "kubernetes",
    accent: "from-violet-100 to-white",
  },
];

export const certifications: CatalogCertification[] = [
  {
    slug: "azure-fundamentals",
    code: "AZ-900",
    name: "Azure Fundamentals",
    summary: "Cloud concepts, Azure services, and pricing models.",
    description:
      "Original scenario items for people new to Azure. Explanations compare similar options so you learn the distinction, not a memorized phrase.",
    level: "Fundamentals",
    durationMin: 45,
    providerSlug: "microsoft",
    tags: ["azure", "microsoft", "fundamentals"],
  },
  {
    slug: "azure-administrator",
    code: "AZ-104",
    name: "Azure Administrator",
    summary: "Identity, compute, storage, and virtual networking.",
    description:
      "Practice choosing the next admin action in a working Azure environment. Items are written for study, not copied from any vendor exam.",
    level: "Associate",
    durationMin: 120,
    providerSlug: "microsoft",
    tags: ["azure", "microsoft", "administrator"],
  },
  {
    slug: "microsoft-365-fundamentals",
    code: "MS-900",
    name: "Microsoft 365 Fundamentals",
    summary: "Cloud productivity, security, and compliance basics.",
    description:
      "A first-pass set covering service families and when to recommend Microsoft 365 versus competing suites.",
    level: "Fundamentals",
    durationMin: 60,
    providerSlug: "microsoft",
    tags: ["microsoft", "365"],
  },
  {
    slug: "aws-solutions-architect-associate",
    code: "SAA-C03",
    name: "AWS Solutions Architect Associate",
    summary: "Resilient, cost-aware architectures on AWS.",
    description:
      "Well-architected design, networking, storage, and identity. Questions are original scenarios mapped to publicly documented skill areas.",
    level: "Associate",
    durationMin: 130,
    providerSlug: "amazon-web-services",
    tags: ["aws", "architect"],
  },
  {
    slug: "aws-cloud-practitioner",
    code: "CLF-C02",
    name: "AWS Cloud Practitioner",
    summary: "Cloud value, billing, and core AWS services.",
    description:
      "A shorter catalog for a first AWS sitting. Useful before moving into associate architect practice.",
    level: "Foundational",
    durationMin: 90,
    providerSlug: "amazon-web-services",
    tags: ["aws", "fundamentals"],
  },
  {
    slug: "google-cloud-associate-engineer",
    code: "ACE",
    name: "Associate Cloud Engineer",
    summary: "Deploy, monitor, and operate workloads on Google Cloud.",
    description:
      "IAM, Compute Engine, GKE basics, and operations. Original wording with timed practice and review.",
    level: "Associate",
    durationMin: 120,
    providerSlug: "google-cloud",
    tags: ["google", "gcp", "engineer"],
  },
  {
    slug: "ccna",
    code: "200-301",
    name: "Cisco Certified Network Associate",
    summary: "Switching, routing, wireless, and automation basics.",
    description:
      "Campus network scenarios that ask you to pick a protocol or next hop, then explain why the near-miss options fail.",
    level: "Associate",
    durationMin: 120,
    providerSlug: "cisco",
    tags: ["cisco", "networking"],
  },
  {
    slug: "security-plus",
    code: "SY0-701",
    name: "Security+",
    summary: "Threats, architecture, operations, and governance.",
    description:
      "Scenario-driven items that check whether you can choose a control, not just recall a definition.",
    level: "Intermediate",
    durationMin: 90,
    providerSlug: "comptia",
    tags: ["comptia", "security"],
  },
  {
    slug: "network-plus",
    code: "N10-009",
    name: "Network+",
    summary: "Connectivity, troubleshooting, and network operations.",
    description:
      "Practice diagnosing a broken path and choosing the least-invasive fix. Built for timed sittings and later review.",
    level: "Intermediate",
    durationMin: 90,
    providerSlug: "comptia",
    tags: ["comptia", "networking"],
  },
  {
    slug: "certified-kubernetes-administrator",
    code: "CKA",
    name: "Certified Kubernetes Administrator",
    summary: "Cluster architecture, workloads, and troubleshooting.",
    description:
      "Scenario practice for scheduling, networking, and recovery. Written for conceptual prep, not as a dump of lab tasks.",
    level: "Professional",
    durationMin: 120,
    providerSlug: "cloud-native",
    tags: ["kubernetes", "other", "cka"],
  },
];

export const practiceTests: CatalogPracticeTest[] = [
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
    certificationSlug: "aws-solutions-architect-associate",
    ratingAverage: 4.8,
    ratingCount: 412,
    isPopular: true,
  },
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
    certificationSlug: "azure-fundamentals",
    ratingAverage: 4.6,
    ratingCount: 268,
    isPopular: true,
  },
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
    certificationSlug: "azure-administrator",
    ratingAverage: 4.7,
    ratingCount: 191,
    isPopular: true,
  },
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
    certificationSlug: "security-plus",
    ratingAverage: 4.9,
    ratingCount: 337,
    isPopular: true,
  },
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
    certificationSlug: "google-cloud-associate-engineer",
    ratingAverage: 4.5,
    ratingCount: 154,
    isPopular: true,
  },
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
    certificationSlug: "ccna",
    ratingAverage: 4.6,
    ratingCount: 221,
    isPopular: true,
  },
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
    certificationSlug: "certified-kubernetes-administrator",
    ratingAverage: 4.4,
    ratingCount: 98,
    isPopular: false,
  },
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
    certificationSlug: "aws-cloud-practitioner",
    ratingAverage: 4.5,
    ratingCount: 176,
    isPopular: false,
  },
];

export const testimonials: CatalogTestimonial[] = [
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

export const faqs: CatalogFaq[] = [
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

  const matchesCert = (item: CatalogCertification) => {
    const provider = providerBySlug(item.providerSlug);
    return [item.name, item.code, item.summary, item.providerSlug, provider?.name, ...item.tags]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  };

  const matchedCerts = certifications.filter(matchesCert);
  const matchedSlugs = new Set(matchedCerts.map((item) => item.slug));

  return {
    certifications: matchedCerts,
    practiceTests: practiceTests.filter(
      (item) =>
        matchedSlugs.has(item.certificationSlug) ||
        [item.title, item.summary, item.slug].some((value) => value.toLowerCase().includes(q)),
    ),
  };
}
