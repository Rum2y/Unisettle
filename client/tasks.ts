interface Task {
  title: string;
  recommended: string;
  description: string;
  router?: string;
}

export const tasks: Task[] = [
  {
    title: "Apply for SIN",
    recommended: "Within 1 week of arrival",
    description: "Go to Service Canada with your study permit and passport.",
    router: "/guides/sin",
  },
  {
    title: "Get Alberta ID",
    recommended: "Week 2",
    description: "Visit a registry office with your documents.",
    router: "/guides/alberta-id",
  },
  {
    title: "Open Bank Account",
    recommended: "First week",
    description: "Compare student accounts at RBC, TD, or Scotiabank.",
    router: "/guides/bank-account",
  },
  {
    title: "Register for Alberta Health Care",
    recommended: "Month 1",
    description: "Apply online or by mail for health coverage.",
    router: "/guides/alberta-health-card",
  },
  {
    title: "Learn about PGWP eligibility",
    recommended: "Month 9",
    description: "Check IRCC guidelines and collect transcripts early.",
  },
  {
    title: "Explore PR pathways",
    recommended: "Year 2",
    description: "Research Alberta PNP and Express Entry requirements.",
  },
];
