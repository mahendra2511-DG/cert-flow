import type { ExamDetail, VendorDetail } from "@/lib/catalog/repository";

export function vendorStudyCopy(vendor: VendorDetail) {
  const examCount = vendor.exams.length;
  const examLabel = examCount === 1 ? "one published exam" : `${examCount} published exams`;
  return `Use this catalog after you have read ${vendor.name}’s current public skill outline. Certiva currently lists ${examLabel} for this provider. Each sitting is original practice: timed questions, a score, and explanations—not a vendor credential.`;
}

export function examAudienceCopy(exam: ExamDetail) {
  return `This practice is for ${exam.level.toLowerCase()} candidates who already have a first pass at ${exam.vendorName}’s public ${exam.code} outline. The sitting is ${exam.durationMin} minutes in ${exam.language}, in a ${exam.examFormat.toLowerCase()} format, with a ${exam.passingScore}% pass mark on Certiva.`;
}

export function examPrepCopy(exam: ExamDetail) {
  return `Work through the skill areas below, then sit the timed test to see which distinctions you still mix up. Certiva explanations compare close options; they are not a substitute for ${exam.vendorName} documentation.`;
}

export function practiceSittingCopy(input: {
  code: string;
  vendorName: string;
  timeLimitMin: number;
  passingScore: number;
  questionCount: number;
}) {
  return `The ${input.code} practice test is a single timed sitting: ${input.questionCount} questions, ${input.timeLimitMin} minutes, pass mark ${input.passingScore}%. Start it when you can stay uninterrupted. After submit you get a score and per-question explanations on this account.`;
}
