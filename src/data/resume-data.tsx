import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons";

export const RESUME_DATA = {
  name: "Nguyen Ton Minh",
  initials: "tonminhce",
  location: "Ho Chi Minh city, Vietnam",
  locationLink:
    "https://www.google.com/maps/place/H%E1%BB%93+Ch%C3%AD+Minh,+Th%C3%A0nh+ph%E1%BB%91+H%E1%BB%93+Ch%C3%AD+Minh",
  title: "Junior Full Stack Engineer",
  about:
    "Junior Full Stack Engineer focused on building products with extra attention to detail",
  summary:
    "As a Junior Full Stack Engineer, I am actively engaged in shaping a product from its inception, working collaboratively within a team that values learning and innovation. I am currently self-educating in DevOps technologies such as Kubernetes, AWS, and Azure to broaden my skill set and contribute more effectively to the infrastructure and deployment aspects of our projects.",
  personalWebsiteUrl: "https://tonminhce.site",
  contact: {
    email: "tonminhwork@gmail.com",
    tel: "+84707745461",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/tonminhce",
        icon: GitHubIcon,
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/nguyen-ton-minh/",
        icon: LinkedInIcon,
      },
    ],
  },
  education: [
    {
      school: "Ho Chi Minh University of Technology",
      degree:
        "Bachelor's Degree in Computer Engineering (Speciality in Modern Computing Systems)",
      start: "2020",
      end: "2024",
    },
  ],
  work: [
    {
      company: "GTG Software",
      link: "https://www.gtgsoft.com/",
      badges: ["On-site"],
      title: "Software Engineer Intern",
      start: "August 2023",
      end: "December 2023",
      description:
        "I contribute to real-world projects by developing new functionalities, troubleshooting tech issues, and providing tailored support to clients, utilizing technologies like React, Node.js, NestJS, Golang, and Docker to enhance our service offerings.",
    },
  ],
  skills: [
    "JavaScript",
    "TypeScript",
    "React/Next.js",
    "React Native",
    "Python",
    "Golang",
    "gRPC",
    "Node.js",
    "REST API",
    "OAuth2",
    "Docker",
    "NestJS",
  ],
  projects: [
    {
      title: "U-App",
      techStack: ["Full Stack Developer", "React Native", "Laravel"],
      description:
        "U-APP is a holistic wellness platform tailored for Asian communities, focusing on mental and overall well-being with utmost respect for user privacy.",
      link: {
        label: "u-app.com.sg",
        href: "https://www.u-app.com.sg/",
      },
    },
    {
      title: "tonminhce.site",
      techStack: ["Side Project", "Next.js"],
      description: "My personal website and blog. Built with Next.js",
      link: {
        label: "github.com",
        href: "https://tonminhce.site/",
      },
    },
    {
      title: "Datagma",
      techStack: [
        "Full Stack Developer",
        "Golang",
        "gRPC",
        "Docker",
        "Kubernetes",
      ],
      description:
        "A tool that provides real-time B2B data enrichment, email and phone number finding services.",
      link: {
        label: "datagma.com",
        href: "https://datagma.com/",
      },
    },
    {
      title: "Cursor Control with Facial Movements",
      techStack: ["Machine Learning", "OpenCV", "Python", "School Project"],
      description:
        "Application that using machine learning theory to control mouse with facial expressions",
      link: {
        label: "github.com",
        href: "https://github.com/tonminhce/machine-learning-project",
      },
    },
    {
      title: "Data Analysis Project",
      techStack: ["Python", "Data Science", "School Project"],
      description:
        "The project analyzes programming language trends and developer engagement through a Jupyter notebook using CSV datasets.",
      link: {
        label: "github.com",
        href: "https://github.com/tonminhce/data-analyst",
      },
    },
    {
      title: "UWC-2.0",
      techStack: ["School Project", "Firebase", "Node.js", "React"],
      description:
        "Application for Ho Chi Minh City Waste Handling System which help manage Janitor, Collector and Trucks and assign it to the place that have waste to pick up",
      link: {
        label: "github.com",
        href: "https://github.com/tonminhce/UWC-2.0",
      },
    },
  ],
} as const;
