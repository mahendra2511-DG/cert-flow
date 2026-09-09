function escapePdf(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text: string, width = 90) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function buildStudyPdf(input: {
  title: string;
  examCode: string;
  examName: string;
  version: string;
  questionCount: number;
}) {
  const paragraphs = [
    input.title,
    `${input.examCode} · ${input.examName}`,
    `Version ${input.version} · ${input.questionCount} practice items in the companion bank`,
    "This PDF is original PrepHarbor study material. It is not an official vendor exam, dump, or leaked item set.",
    "Use it after you purchase premium access. Pair the notes with timed sittings and explanation review.",
    "Domains to revisit: identity, networking, storage, operations, and shared responsibility.",
    "Study loop: sit a timed set, write why near-miss options fail, then retake only the weak domains.",
    `Generated for licensed PrepHarbor learners. Redistribution is not permitted.`,
  ];

  const lineOps: string[] = ["BT", "/F1 16 Tf", "72 760 Td", `(${escapePdf(paragraphs[0] ?? "")}) Tj`];
  lineOps.push("/F1 11 Tf", "0 -28 Td");
  for (const paragraph of paragraphs.slice(1)) {
    for (const line of wrap(paragraph)) {
      lineOps.push(`(${escapePdf(line)}) Tj`, "0 -16 Td");
    }
    lineOps.push("0 -10 Td");
  }
  lineOps.push("ET");
  const stream = lineOps.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n")];
  const offsets = [0];
  let cursor = chunks[0]!.length;
  objects.forEach((body, index) => {
    const object = `${index + 1} 0 obj\n${body}\nendobj\n`;
    const buf = Buffer.from(object);
    offsets.push(cursor);
    chunks.push(buf);
    cursor += buf.length;
  });
  const xrefStart = cursor;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  chunks.push(Buffer.from(xref), Buffer.from(trailer));
  return Buffer.concat(chunks);
}
