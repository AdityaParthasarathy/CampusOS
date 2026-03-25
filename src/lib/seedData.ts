/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
export const SEED_EVENTS = [
  {
    title: "AI & ML Mega Hackathon 2026",
    date: "2026-04-15",
    location: "Main Lab Block, RIT",
    organizer: "AI Club RIT",
    category: "Tech",
    desc: "A 36-hour hackathon focused on solving real-world campus problems using GenAI and Machine Learning. Prizes worth ₹50,000!",
    organizerId: "system-seed",
    createdAt: new Date().toISOString(),
    registeredUsers: []
  },
  {
    title: "Cloud Computing Workshop",
    date: "2026-03-28",
    location: "Seminar Hall 1",
    organizer: "AWS Student Community",
    category: "Workshop",
    desc: "Hands-on session on AWS Lambda, S3, and DynamoDB. Perfect for beginners looking to build scalable apps.",
    organizerId: "system-seed",
    createdAt: new Date().toISOString(),
    registeredUsers: []
  },
  {
    title: "Eco-Friendly Tech Expo",
    date: "2026-04-05",
    location: "Campus Ground",
    organizer: "Sustainability Hub",
    category: "Social",
    desc: "Showcase your green tech projects and win the RIT Sustainability Award. Open to all departments.",
    organizerId: "system-seed",
    createdAt: new Date().toISOString(),
    registeredUsers: []
  },
  {
    title: "UI/UX Design Masterclass",
    date: "2026-04-10",
    location: "Design Studio, Block A",
    organizer: "Creative Arts Club",
    category: "Skills",
    desc: "Learn the secrets of glassmorphism and modern web aesthetics from industry professionals.",
    organizerId: "system-seed",
    createdAt: new Date().toISOString(),
    registeredUsers: []
  },
  {
    title: "Annual Cultural Fest - Rhythms",
    date: "2026-05-20",
    location: "Open Air Theatre",
    organizer: "Cultural Committee",
    category: "Cultural",
    desc: "The biggest cultural event of the year! Music, dance, drama, and a night to remember at RIT.",
    organizerId: "system-seed",
    createdAt: new Date().toISOString(),
    registeredUsers: []
  }
];

export const SEED_PROJECTS = [
  {
    title: "Campus Ride Sharing",
    desc: "A peer-to-peer carpooling app for students and faculty commuting to RIT, reducing carbon footprint and travel costs.",
    stack: ["React Native", "Firebase", "Google Maps API"],
    creatorName: "Seeded User",
    creatorId: "system-seed",
    createdAt: new Date().toISOString(),
    members: ["Aditya P", "Rahul S"],
    status: "Active",
    applicants: []
  },
  {
    title: "Smart Library Assistant",
    desc: "An IoT-enabled system to track book availability and noise levels in the RIT library in real-time.",
    stack: ["Node.js", "MQTT", "ESP32", "Next.js"],
    creatorName: "Seeded User",
    creatorId: "system-seed",
    createdAt: new Date().toISOString(),
    members: ["Sneha Rao"],
    status: "Recruiting",
    applicants: []
  },
  {
    title: "Blockchain E-Voting",
    desc: "A secure and transparent voting system for campus elections using Ethereum smart contracts.",
    stack: ["Solidity", "Hardhat", "Ether.js", "React"],
    creatorName: "Seeded User",
    creatorId: "system-seed",
    createdAt: new Date().toISOString(),
    members: ["Karthik M", "Priya K"],
    status: "Active",
    applicants: []
  },
  {
    title: "AR Campus Tour",
    desc: "An Augmented Reality app that provides interactive navigation and history for every building on the RIT campus.",
    stack: ["Unity", "ARCore", "C#"],
    creatorName: "Seeded User",
    creatorId: "system-seed",
    createdAt: new Date().toISOString(),
    members: ["Meera Iyer"],
    status: "Active",
    applicants: []
  },
  {
    title: "Automatic Attendance AI",
    desc: "Facial recognition-based attendance system using cameras installed in classrooms to automate student tracking.",
    stack: ["Python", "FastAPI", "OpenCV", "TensorFlow"],
    creatorName: "Seeded User",
    creatorId: "system-seed",
    createdAt: new Date().toISOString(),
    members: ["Vikram S"],
    status: "Recruiting",
    applicants: []
  }
];

export const SEED_MARKETPLACE = [
  {
    title: "Engineering Graphics Kit",
    price: "750",
    description: "Full set including mini-drafter, compass, and scale. Used for only one semester, like new.",
    seller: "Rahul S",
    sellerId: "system-seed",
    icon: "📐",
    category: "Other",
    createdAt: new Date().toISOString()
  },
  {
    title: "Data Structures Textbook",
    price: "400",
    description: "CLRS 3rd Edition. Very helpful for second-year CS students. Minimal highlighting.",
    seller: "Sneha Reddy",
    sellerId: "system-seed",
    icon: "📖",
    category: "Books",
    createdAt: new Date().toISOString()
  },
  {
    title: "Raspberry Pi 4 (4GB)",
    price: "3500",
    description: "Perfect for IoT projects. Includes case, fan, and 32GB SD card pre-loaded with Raspbian.",
    seller: "Karthik M",
    sellerId: "system-seed",
    icon: "💻",
    category: "Electronics",
    createdAt: new Date().toISOString()
  },
  {
    title: "Physics Lab Manual (SEM 1)",
    price: "150",
    description: "Completed lab manual with all observations checked. Save time on your rituals!",
    seller: "Priya K",
    sellerId: "system-seed",
    icon: "🔬",
    category: "Study Material",
    createdAt: new Date().toISOString()
  },
  {
    title: "Scientific Calculator (fx-991EX)",
    price: "900",
    description: "Casio Classwiz calculator. Essential for all engineering exams. 1 year old.",
    seller: "Arjun Vyas",
    sellerId: "system-seed",
    icon: "🔢",
    category: "Electronics",
    createdAt: new Date().toISOString()
  }
];

export const SEED_TEAM_POSTS = [
  {
    role: "Full Stack Developer",
    skills: ["Next.js", "Tailwind", "Supabase"],
    description: "Looking to build a SaaS product for student notes sharing. Need a designer and a mobile dev.",
    posterId: "system-seed",
    posterName: "Rahul Sharma",
    createdAt: new Date().toISOString(),
    applicants: []
  },
  {
    role: "Flutter Pro",
    skills: ["Dart", "Firebase", "State Management"],
    description: "Building a fintech app for RIT students to manage club funds. Need a backend dev with Firebase experience.",
    posterId: "system-seed",
    posterName: "Sneha Reddy",
    createdAt: new Date().toISOString(),
    applicants: []
  },
  {
    role: "AI/ML Enthusiast",
    skills: ["Python", "Scikit-Learn", "Numpy"],
    description: "Interested in developing a recommendation engine for the RIT library. Seeking someone with data engineering skills.",
    posterId: "system-seed",
    posterName: "Karthik Murali",
    createdAt: new Date().toISOString(),
    applicants: []
  },
  {
    role: "Graphic Designer",
    skills: ["Illustrator", "Photoshop", "Canva"],
    description: "Available to design posters and social media assets for campus clubs and events.",
    posterId: "system-seed",
    posterName: "Priya Krishnan",
    createdAt: new Date().toISOString(),
    applicants: []
  },
  {
    role: "Documentation Specialist",
    skills: ["Technical Writing", "Latex", "Markdown"],
    description: "Help you structure your project reports and whitepapers for publication. 3 years experience.",
    posterId: "system-seed",
    posterName: "Arjun Vyas",
    createdAt: new Date().toISOString(),
    applicants: []
  }
];
