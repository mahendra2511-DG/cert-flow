export type CatalogProvider = {
  slug: string;
  name: string;
  description: string;
};

export type CatalogCategory = {
  slug: string;
  name: string;
  description: string;
  hrefQuery: string;
  accent: string;
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
  tags: string[];
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
  ratingAverage: number;
  ratingCount: number;
  isPopular: boolean;
};

export type CatalogTestimonial = {
  quote: string;
  name: string;
  role: string;
  exam: string;
};

export type CatalogFaq = {
  question: string;
  answer: string;
};
