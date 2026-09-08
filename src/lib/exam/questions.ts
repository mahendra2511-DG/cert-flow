import type { ExamQuestion } from "@/lib/exam/types";
import { seedExams } from "@/lib/catalog/seed-catalog";

function option(
  testSlug: string,
  order: number,
  label: string,
  body: string,
  isCorrect: boolean,
) {
  return {
    id: `${testSlug}-q${order}-${label}`,
    label,
    body,
    isCorrect,
  };
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

function multi(
  testSlug: string,
  order: number,
  prompt: string,
  explanation: string,
  choices: Array<[string, boolean]>,
): ExamQuestion {
  const labels = ["A", "B", "C", "D", "E"];
  return {
    id: `${testSlug}-q${order}`,
    order,
    type: "MULTIPLE_CHOICE",
    prompt,
    explanation,
    options: choices.map(([body, isCorrect], index) =>
      option(testSlug, order, labels[index] ?? String(index + 1), body, isCorrect),
    ),
  };
}

const saa = "saa-c03-full-length";
const az900 = "az-900-core-drill";
const sy0 = "sy0-701-security-lab";

const authoredBanks: Record<string, ExamQuestion[]> = {
  [saa]: [
    single(
      saa,
      1,
      "A payments API must stay available if a single Availability Zone fails. Which design meets that requirement at the lowest operational complexity?",
      "Spreading compute across at least two AZs in one Region keeps the service up when one AZ is lost, without the latency and failover complexity of a second Region.",
      [
        ["Run all instances in one AZ and take hourly AMI snapshots", false],
        ["Deploy the API across at least two Availability Zones in the same Region", true],
        ["Replicate the stack to a second Region and fail over manually each week", false],
        ["Pin the database to a single host and increase instance size", false],
      ],
    ),
    single(
      saa,
      2,
      "An analytics team reads the same objects thousands of times per day. Which storage class is the most cost-effective default for those objects?",
      "Standard (or Intelligent-Tiering for unknown access) is appropriate for frequent reads. Glacier classes add restore delay that analytics queries cannot wait for.",
      [
        ["S3 Glacier Deep Archive", false],
        ["S3 Standard", true],
        ["S3 One Zone-Infrequent Access for all objects", false],
        ["Instance store on a single analytics node", false],
      ],
    ),
    multi(
      saa,
      3,
      "A workload must encrypt data at rest and restrict which principals can decrypt it. Which TWO controls should you combine?",
      "KMS customer-managed keys with key policies, plus encryption on the data store, limit who can decrypt without putting plaintext keys on disk.",
      [
        ["Use a customer-managed KMS key with a least-privilege key policy", true],
        ["Enable encryption on the data store (for example S3 or EBS)", true],
        ["Disable CloudTrail to hide decrypt events", false],
        ["Share the same IAM user access keys across all teams", false],
      ],
    ),
    single(
      saa,
      4,
      "Users in an office need private access to an S3 bucket without traversing the public internet. What should you introduce?",
      "A gateway VPC endpoint for S3 keeps traffic on the AWS network and can be locked down with endpoint policies.",
      [
        ["An internet gateway and a public IP on each client", false],
        ["A VPC gateway endpoint for S3", true],
        ["A NAT instance in a public subnet with port 80 open to the world", false],
        ["Disable bucket policies entirely", false],
      ],
    ),
    single(
      saa,
      5,
      "A queue-backed worker fleet should scale with backlog without over-provisioning at night. What is the most direct signal to scale on?",
      "Approximate number of visible messages (queue depth) tracks work waiting, which is a better scale signal than CPU when work arrives in bursts.",
      [
        ["CPU utilization of a single bastion host", false],
        ["Approximate number of messages visible in the queue", true],
        ["Number of IAM users in the account", false],
        ["The age of the newest AMI", false],
      ],
    ),
    single(
      saa,
      6,
      "A relational database needs automatic failover across Availability Zones with minimal application change. Which service model fits?",
      "A Multi-AZ relational service (for example RDS Multi-AZ) provides synchronous standby failover without rewriting the application.",
      [
        ["Self-managed MySQL on one EC2 instance", false],
        ["A Multi-AZ managed relational database", true],
        ["Storing JSON files in S3 and querying with grep", false],
        ["An Elastic IP moved by a cron job", false],
      ],
    ),
    multi(
      saa,
      7,
      "Which TWO practices reduce blast radius when a deploy fails?",
      "Isolated accounts or environments and least-privilege roles limit how far a bad change can travel.",
      [
        ["Separate production from non-production environments", true],
        ["Grant every engineer AdministratorAccess in production", false],
        ["Use least-privilege IAM roles for deploy tooling", true],
        ["Store secrets in world-readable object storage", false],
      ],
    ),
    single(
      saa,
      8,
      "Static assets are read globally and change a few times per week. What should sit in front of the origin to cut latency?",
      "A CDN caches at edge locations so most readers never hit the origin bucket or load balancer.",
      [
        ["A single NAT gateway in one AZ", false],
        ["A content delivery network in front of the origin", true],
        ["Disabling HTTPS to save handshake time", false],
        ["An SMTP relay", false],
      ],
    ),
  ],
  [az900]: [
    single(
      az900,
      1,
      "Who is responsible for physical datacenter security in the public cloud shared responsibility model?",
      "The cloud provider secures facilities and hardware. The customer still configures identity, data, and access.",
      [
        ["The customer’s on-call engineer", false],
        ["The cloud provider", true],
        ["The domain registrar", false],
        ["The CDN vendor only", false],
      ],
    ),
    single(
      az900,
      2,
      "A finance team wants to estimate monthly cost before deploying a VM. Which Azure capability should they use first?",
      "The pricing calculator (or Cost Management estimates) models SKU and region cost before you deploy.",
      [
        ["Azure Policy to deny all SKUs", false],
        ["The Azure pricing calculator", true],
        ["Deleting resource groups at random", false],
        ["Enabling every Azure service in a subscription", false],
      ],
    ),
    multi(
      az900,
      3,
      "Which TWO statements describe Azure resource groups?",
      "A resource group is a lifecycle and permission boundary. Resources live in one group; groups do not nest.",
      [
        ["A resource belongs to exactly one resource group", true],
        ["Resource groups can apply lifecycle and access boundaries", true],
        ["A virtual machine must exist in every resource group in the tenant", false],
        ["Resource groups replace Azure Active Directory", false],
      ],
    ),
    single(
      az900,
      4,
      "You need a private network space in Azure for VMs. Which resource do you create?",
      "A virtual network (VNet) is the private address space. NSGs and subnets live inside it.",
      [
        ["A storage account", false],
        ["A virtual network", true],
        ["An Azure AD tenant", false],
        ["A public IP prefix used as a subnet", false],
      ],
    ),
    single(
      az900,
      5,
      "Which option is an example of platform as a service (PaaS)?",
      "Azure SQL Database or App Service are PaaS: you manage data and app code, not the OS patching of the host.",
      [
        ["A VM you patch yourself", false],
        ["Azure SQL Database", true],
        ["Buying a rack in a colocation cage", false],
        ["A USB drive in a drawer", false],
      ],
    ),
    single(
      az900,
      6,
      "A company wants to stop a development VM at night to save money. Which feature supports that?",
      "You can deallocate or auto-shutdown VMs so compute billing stops while disks may still incur storage cost.",
      [
        ["Deallocate / auto-shutdown the VM outside business hours", true],
        ["Move the VM to a new tenant every night", false],
        ["Disable billing alerts", false],
        ["Convert the VM to a public IP", false],
      ],
    ),
    single(
      az900,
      7,
      "Which Azure service is primarily used to create and manage users and groups for cloud identity?",
      "Microsoft Entra ID (Azure AD) is the identity plane for users, groups, and app registrations.",
      [
        ["Azure Blob Storage", false],
        ["Microsoft Entra ID (Azure AD)", true],
        ["Azure CDN", false],
        ["Azure Backup vault tags", false],
      ],
    ),
    multi(
      az900,
      8,
      "Select TWO valid reasons to choose a region.",
      "Data residency and latency to users are primary region drivers. Trivia about office furniture is not.",
      [
        ["Data residency requirements", true],
        ["Proximity to users for latency", true],
        ["The color of the Azure portal theme", false],
        ["Whether the subscription display name contains a number", false],
      ],
    ),
  ],
  [sy0]: [
    single(
      sy0,
      1,
      "A help desk ticket asks a user for their password to “unlock payroll.” What is this?",
      "Social engineering / phishing (or pretexting) tricks a person into handing over secrets. Technical controls do not excuse the request.",
      [
        ["A legitimate break-glass procedure", false],
        ["Social engineering", true],
        ["A certificate pinning failure", false],
        ["A VLAN hop", false],
      ],
    ),
    single(
      sy0,
      2,
      "Which control is preventive rather than detective?",
      "A locked door or deny-by-default firewall rule stops the event. A camera log records it after the fact.",
      [
        ["A SIEM alert after a breach", false],
        ["A deny-by-default firewall rule", true],
        ["A post-incident report", false],
        ["A monthly access review that happens after the quarter ends", false],
      ],
    ),
    multi(
      sy0,
      3,
      "Which TWO actions belong in an incident response process after confirmation?",
      "Containment and evidence preservation come before blaming individuals or wiping logs.",
      [
        ["Contain the affected systems", true],
        ["Preserve evidence according to policy", true],
        ["Delete all logs so attackers cannot read them", false],
        ["Post credentials in a public chat for speed", false],
      ],
    ),
    single(
      sy0,
      4,
      "A laptop is stolen. Disk encryption was on. What risk is most reduced?",
      "Full-disk encryption reduces confidentiality loss if the drive is removed. It does not stop the thief from using a logged-in session if the device was unlocked.",
      [
        ["Availability of the office Wi-Fi", false],
        ["Confidentiality of data at rest on the disk", true],
        ["Integrity of SaaS configurations in another tenant", false],
        ["Physical safety of the building generators", false],
      ],
    ),
    single(
      sy0,
      5,
      "Which authentication factor is “something you have”?",
      "A hardware token or phone-based one-time code is possession. A password is knowledge. A fingerprint is inherence.",
      [
        ["A password", false],
        ["A hardware OTP token", true],
        ["Your mother’s middle name", false],
        ["A favorite color", false],
      ],
    ),
    single(
      sy0,
      6,
      "Developers store API keys in a public Git repository. What should happen first?",
      "Rotate/revoke the exposed keys immediately, then remove them from history and introduce a secret store.",
      [
        ["Leave the keys; security through obscurity is enough", false],
        ["Revoke and rotate the exposed keys", true],
        ["Grant the keys AdministratorAccess so rotation is unnecessary", false],
        ["Disable MFA on the related accounts", false],
      ],
    ),
    single(
      sy0,
      7,
      "Which backup strategy best survives ransomware that encrypts primary file shares?",
      "Immutable or offline copies that the malware cannot overwrite are the recovery path. More local copies of the same share do not help.",
      [
        ["A second folder on the same encrypted volume", false],
        ["Offline or immutable backups tested for restore", true],
        ["Emailing ZIP files to a personal account", false],
        ["Disabling logs to save disk", false],
      ],
    ),
    multi(
      sy0,
      8,
      "Select TWO examples of least privilege.",
      "Roles limited to the job and time-bound elevation beat standing admin for everyone.",
      [
        ["A support role that can reset passwords but not change billing", true],
        ["Just-in-time elevation for production changes", true],
        ["A shared root password on a sticky note", false],
        ["Domain admin for every intern on day one", false],
      ],
    ),
  ],
};

function generatedBank(testSlug: string, examName: string, examCode: string): ExamQuestion[] {
  return [
    single(
      testSlug,
      1,
      `For ${examCode}, which study habit most improves recall under time pressure?`,
      "Timed sittings plus reviewing why wrong options fail transfer better than rereading notes alone.",
      [
        ["Only reread the vendor outline the night before", false],
        ["Sit a timed practice set and review missed explanations", true],
        ["Memorize forum dumps word for word", false],
        ["Skip practice because the real exam will feel easier", false],
      ],
    ),
    single(
      testSlug,
      2,
      `A question on ${examName} offers two similar controls. How should you choose?`,
      "Pick the option that matches the constraint in the prompt (cost, blast radius, or operational effort)—not the most famous brand name.",
      [
        ["Always pick the most expensive product", false],
        ["Match the option to the constraint stated in the scenario", true],
        ["Pick the longest answer", false],
        ["Skip every scenario question", false],
      ],
    ),
    multi(
      testSlug,
      3,
      `Select TWO practices that keep ${examCode} prep aligned with publicly documented skills.`,
      "Use the official outline and original practice items. Recycled dumps are not a skill map.",
      [
        ["Study the public skill outline", true],
        ["Use original practice questions with explanations", true],
        ["Paste live exam content into a shared chat", false],
        ["Ignore domain weights entirely", false],
      ],
    ),
    single(
      testSlug,
      4,
      "You are unsure between two remaining options. What is the better next step in a timed sitting?",
      "Flag, pick the better-supported option, and return if time remains. Blank answers score the same as wrong ones.",
      [
        ["Leave it blank to be safe", false],
        ["Flag it, choose the better-supported option, continue", true],
        ["End the exam immediately", false],
        ["Change every previous answer at random", false],
      ],
    ),
    single(
      testSlug,
      5,
      `Which outcome indicates you are ready to sit ${examCode}?`,
      "Stable timed scores at or above the practice pass mark, with explanations you can restate, beat a single lucky high score.",
      [
        ["One untimed 100% with notes open", false],
        ["Repeated timed scores at or above the pass mark", true],
        ["Finishing in under five minutes", false],
        ["Never reviewing explanations", false],
      ],
    ),
    single(
      testSlug,
      6,
      "A scenario mentions a compliance boundary and a cheaper non-compliant service. What should you pick?",
      "When the prompt requires a compliance or isolation boundary, the cheaper option that violates it is wrong.",
      [
        ["The cheaper service that crosses the boundary", false],
        ["The option that satisfies the stated compliance constraint", true],
        ["Neither; leave it unanswered", false],
        ["Both; select every checkbox", false],
      ],
    ),
    multi(
      testSlug,
      7,
      "Select TWO things a score report is useful for after a PrepHarbor sitting.",
      "Use the report to find weak domains and restudy those explanations. It is not a vendor certificate.",
      [
        ["Identifying weak domains", true],
        ["Guiding a second sitting on missed items", true],
        ["Proving an official vendor pass", false],
        ["Sharing live exam questions", false],
      ],
    ),
    single(
      testSlug,
      8,
      `After missing a ${examName} item, what should you write down?`,
      "Write why the near-miss failed. That note is what you review before the next sitting.",
      [
        ["Only the question number", false],
        ["Why the near-miss option failed", true],
        ["The vendor’s trademarked slogan", false],
        ["Nothing; move on forever", false],
      ],
    ),
  ];
}

export function getBaseQuestionsForTest(testSlug: string): ExamQuestion[] {
  if (authoredBanks[testSlug]) {
    return authoredBanks[testSlug];
  }
  const exam = seedExams.find((item) => item.tests.some((test) => test.slug === testSlug));
  const test = exam?.tests.find((item) => item.slug === testSlug);
  return generatedBank(testSlug, exam?.name ?? "this certification", exam?.code ?? test?.title ?? "exam");
}

export function getQuestionsForTest(testSlug: string): ExamQuestion[] {
  return getBaseQuestionsForTest(testSlug);
}

export function getQuestionById(testSlug: string, questionId: string) {
  return getQuestionsForTest(testSlug).find((item) => item.id === questionId);
}

export function toPublicQuestion(question: ExamQuestion) {
  return {
    id: question.id,
    order: question.order,
    type: question.type,
    prompt: question.prompt,
    options: question.options.map(({ isCorrect: _isCorrect, ...option }) => option),
  };
}
