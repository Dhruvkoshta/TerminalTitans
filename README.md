# ProctoAI - AI-Powered Proctoring System

![ProctoAI](./apps/web/public/images/logo.png)

## 🎯 Mission

ProctoAI is a comprehensive, AI-powered proctoring system designed to ensure academic integrity while maintaining student privacy and accessibility. We believe that everyone deserves a fair and accessible education—our platform provides secure, transparent proctoring that respects learner rights.

## ✨ Key Features

### 🔒 **Secure Proctoring**
- Real-time face recognition and verification
- Room scanning and environmental monitoring
- Screen capture and monitoring
- Browser lock to prevent tab switching
- Copy/paste and external resource prevention
- ID verification with document scanning

### 🎓 **Instructor Dashboard**
- Create and manage exams with flexible scheduling
- Set comprehensive proctoring rules
- Monitor live exam sessions in real-time
- Review student responses with verification artifacts
- Access face verification photos and room scan videos
- Detailed exam analytics and reporting

### 💻 **Student Experience**
- Clean, intuitive exam interface
- Support for multiple question types:
  - Multiple Choice Questions (MCQ)
  - Short Answer Questions
  - **LeetCode-style Coding Challenges** (split layout with Monaco Editor)
- Easy submission and response tracking
- Transparent proctoring rule display

### 🛡️ **Privacy First**
- End-to-end encrypted data transmission
- Secure cloud storage for verification artifacts
- GDPR-compliant data handling
- Student consent and transparency controls

## 🏗️ Architecture

```
ProctoAI/
├── apps/
│   └── web/              # Next.js 16 Fullstack App
│       ├── src/
│       │   ├── app/      # App Router Pages
│       │   ├── components/   # Reusable UI Components
│       │   ├── lib/      # Utilities & Helpers
│       │   └── utils/    # Configuration
│       └── public/       # Static Assets
├── packages/
│   ├── api/              # tRPC API Routes & Business Logic
│   ├── auth/             # Better-Auth Configuration
│   └── db/               # Drizzle ORM & Database Schema
└── README.md
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui Components |
| **API** | tRPC, End-to-end type safety |
| **Database** | PostgreSQL, Drizzle ORM |
| **Auth** | Better-Auth with JWT |
| **Code Editor** | Monaco Editor with syntax highlighting |
| **Storage** | Vercel Blob Storage for artifacts |
| **UI Components** | shadcn/ui, Radix UI primitives |

## 🎨 Design System

### Color Palette
- **Primary:** `#0FA4AF` - Main CTA and interactive elements
- **Background:** `#003135` - Deep dark background
- **Foreground:** `#AFDDE5` - Light text on dark backgrounds
- **Card:** `#024950` - Card and secondary backgrounds
- **Accent:** `#0FA4AF` - Highlights and emphasis
- **Destructive:** `#964734` - Error states

### UI Components
- Custom themed buttons with hover states
- Card-based layouts with subtle shadows
- Responsive data tables with sorting
- Modal dialogs and dropdowns
- Form inputs with validation feedback
- Status badges and indicators

## 📸 Platform Screenshots

### Dashboard
![Dashboard](./apps/web/public/images/dashboard.png)

### Exam Interface
![Exam](./apps/web/public/images/exam.png)

### Student Review
![Review](./apps/web/public/images/review.png)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- PostgreSQL database
- Vercel account (for Blob Storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/proctoai.git
   cd proctoai
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   
   Create `.env` file in `apps/web/`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/proctoai
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3001
   VERCEL_BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
   ```

4. **Setup database**
   ```bash
   bun db:push
   ```

5. **Start development server**
   ```bash
   bun dev
   ```

   Open [http://localhost:3001](http://localhost:3001) in your browser

## 📚 Core Features Explained

### 📝 Exam Creation
Instructors can create exams with:
- Custom exam codes for easy access
- Flexible start and end times
- Variable duration settings
- Multiple question types
- Detailed proctoring rules configuration

### 🎯 Question Types

#### Multiple Choice Questions (MCQ)
- Support for multiple correct answers
- Clear option display
- Instant validation

#### Short Answer
- Free-form text responses
- Character limit control
- Word count tracking

#### Coding Challenges (LeetCode Style)
- Split-panel layout for optimal coding experience
- Left panel: Problem description & test cases
- Right panel: Full-featured Monaco Editor
- Syntax highlighting, auto-completion, debugging
- Direct code execution support

### 👁️ Real-time Proctoring
- Live face detection and tracking
- Environmental monitoring via webcam
- Continuous screen capture
- Session recording and playback
- Incident flagging and review

### 📋 Response Analysis
- Detailed student responses with timestamps
- Verification artifacts (photos, videos, IDs)
- Instructor annotation tools
- Comparative analytics
- Export capabilities

## 📊 Database Schema Highlights

### Key Tables
- `users` - Student and instructor accounts
- `exams` - Exam definitions and settings
- `questions` - Question content and metadata
- `responses` - Student exam responses
- `verificationArtifacts` - Proctoring evidence (photos, videos, documents)
- `sessions` - Active exam sessions

## 🔄 API Structure

tRPC endpoints organized by routers:

```
/api/trpc/
├── exams.*
│   ├── create
│   ├── getById
│   ├── listByInstructor
│   └── submit
├── questions.*
│   ├── create
│   ├── update
│   └── delete
├── responses.*
│   ├── submit
│   ├── getByStudent
│   └── getByExam
└── verification.*
    ├── uploadArtifact
    └── getArtifacts
```

## 🎓 User Flows

### Instructor Flow
1. Sign up / Login
2. Create exam with questions
3. Configure proctoring rules
4. Publish exam and share code
5. Monitor live sessions
6. Review student responses
7. Provide feedback

### Student Flow
1. Sign up / Login
2. Enter exam code
3. Verify identity and environment
4. Start exam session
5. Answer questions (MCQ/Short/Coding)
6. Submit responses
7. View results and feedback

## 🔐 Security Features

✅ **Data Protection**
- HTTPS/TLS encryption in transit
- AES-256 encryption at rest
- Secure token-based authentication

✅ **Proctoring Integrity**
- Browser lock prevents tab switching
- Screen monitoring with alerts
- Face recognition with liveness detection
- Copy/paste prevention

✅ **Privacy Compliance**
- GDPR-ready data handling
- User consent management
- Transparent data usage
- Right to deletion support

## 🤝 Team

Meet the minds behind ProctoAI:


- **Dhruv Kumar Koshta** - Founder & CEO
- **Rohan Kumar** - CTO
- **Aayush Ranjan** - Head of Product
- **Navit Mathur** - Lead ML Engineer

## 📖 Available Commands

```bash
# Development
bun dev              # Start dev server on port 3001
bun dev --open       # Open browser automatically

# Building
bun build            # Build all applications
bun build:prod       # Production build

# Database
bun db:push          # Apply schema changes to database
bun db:studio        # Open Drizzle Studio UI

# Type Safety
bun check-types      # TypeScript type checking

# Linting
bun lint             # Run ESLint
bun format           # Format code with Prettier
```

## 🚧 Roadmap

- [ ] Mobile app for iOS/Android
- [ ] Advanced ML-based proctoring
- [ ] Plagiarism detection
- [ ] AI-powered question generation
- [ ] Peer review system
- [ ] Integration with LMS platforms
- [ ] Multi-language support

## 📝 License

This project is proprietary and developed by ProctoAI team.

## 💬 Support & Feedback

For issues, feature requests, or feedback:
- 📧 Email: support@proctoai.com
- 🐛 Issues: [GitHub Issues](https://github.com/proctoai/issues)
- 💡 Discussions: [GitHub Discussions](https://github.com/proctoai/discussions)

## 🙏 Acknowledgments

- Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)
- UI Components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide Icons](https://lucide.dev)
- Code editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

**Made with ❤️ by the ProctoAI Team | Ensuring Integrity in Every Exam**
