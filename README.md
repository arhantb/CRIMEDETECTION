# AI-Powered Crime Detection System

A comprehensive crime reporting system with intelligent AI analysis and human-in-the-loop verification using LangGraph, LangChain, and Gemini API.

## 🚀 Features

- **AI-Powered Analysis**: Uses Google's Gemini API for intelligent image and video analysis
- **Human-in-the-Loop**: Combines AI insights with human expertise for accurate verification
- **LangGraph Workflow**: Orchestrates complex AI workflows with state management
- **LangChain Integration**: Connects AI models and tools for intelligent processing
- **Media Support**: Handles both photo and video uploads with validation
- **Real-time Processing**: Immediate AI analysis with configurable review thresholds
- **Admin Dashboard**: Comprehensive reporting and verification interface
- **Responsive Design**: Modern UI built with Next.js and Tailwind CSS

## 🏗️ Architecture

### System Components

1. **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
2. **AI Analysis**: Gemini API for media content analysis
3. **Workflow Engine**: LangGraph for orchestrating AI processes
4. **Backend Services**: RESTful APIs for report management
5. **Storage**: In-memory storage (configurable for production databases)

### AI Workflow

```
User Upload → Media Processing → AI Analysis → Risk Assessment → Human Review → Final Decision
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **AI/ML**: LangGraph, LangChain, Google Gemini API
- **Backend**: Next.js API Routes
- **State Management**: React Hooks
- **File Handling**: Base64 encoding for media storage

## 📁 Project Structure

```
CRIMEDETECTION/
├── app/
│   ├── api/
│   │   ├── report/          # Crime report submission API
│   │   └── admin/           # Admin verification API
│   ├── report/              # Crime reporting page (/report)
│   ├── admin/               # Admin panel (/admin/checkrequest)
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── ui/                  # Reusable UI components
│   └── crime-report-nav.tsx # Navigation component
├── lib/
│   ├── services/            # Business logic services
│   │   ├── gemini-service.ts           # Gemini API integration
│   │   ├── crime-analysis-workflow.ts  # LangGraph workflow
│   │   └── crime-report-service.ts     # Report management
│   └── types/               # TypeScript type definitions
│       └── crime-report.ts  # Crime report types
├── package.json             # Dependencies
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRIMEDETECTION
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### For Users

1. **Navigate to `/report`**
2. **Upload media**: Select photos or videos (max 10MB each)
3. **Fill details**: Location, description, category, and priority
4. **Submit**: Report is automatically processed by AI
5. **Track status**: Monitor report processing and verification

### For Administrators

1. **Navigate to `/admin/checkrequest`**
2. **Review reports**: View all submitted reports with AI analysis
3. **Filter and search**: Use advanced filtering options
4. **Verify reports**: Review AI findings and provide human verification
5. **Analytics**: View statistics and trends

## 🔧 Configuration

### AI Analysis Thresholds

The system automatically determines when human review is required based on:

- **Confidence Level**: < 70% requires review
- **Severity Level**: High/Critical requires review
- **Risk Factors**: > 3 risk factors requires review

### Media Processing

- **Supported Formats**: JPEG, PNG, GIF, MP4, AVI, MOV, WMV
- **File Size Limit**: 10MB per file
- **Storage**: Base64 encoding (configurable for cloud storage)

## 🔒 Security Features

- **Input Validation**: Comprehensive form and file validation
- **File Type Restrictions**: Only allowed media formats
- **Size Limits**: Prevents abuse through large file uploads
- **Admin Authentication**: Secure admin panel access (configurable)

## 🚀 Production Deployment

### Database Integration

Replace the in-memory storage with a production database:

```typescript
// Example: PostgreSQL integration
import { Pool } from 'pg'

class CrimeReportStorage {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }

  async create(report: Omit<CrimeReport, 'id'>): Promise<CrimeReport> {
    const query = `
      INSERT INTO crime_reports (user_id, location, description, media_urls, ...)
      VALUES ($1, $2, $3, $4, ...)
      RETURNING *
    `
    // Implementation details...
  }
}
```

### File Storage

Integrate with cloud storage services:

```typescript
// Example: AWS S3 integration
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

class MediaStorageService {
  private s3Client: S3Client

  async uploadFile(file: File): Promise<string> {
    // Upload to S3 and return URL
  }
}
```

### Authentication

Add proper authentication middleware:

```typescript
// Example: JWT authentication
import { verify } from 'jsonwebtoken'

export function authMiddleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Verify token and extract user info
}
```

## 📊 API Endpoints

### POST `/api/report`
Submit a new crime report

**Request**: FormData with media files and report details
**Response**: Created report object

### GET `/api/report`
Retrieve all crime reports

### POST `/api/admin/verify`
Verify or reject a crime report

**Request**: JSON with report ID, admin ID, verification decision, and notes
**Response**: Updated report object

### GET `/api/admin/verify`
Retrieve reports with filtering options

**Query Parameters**: status, priority, category, search

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Real-time Notifications**: WebSocket integration for live updates
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Machine learning insights and predictions
- **Integration APIs**: Connect with law enforcement systems
- **Multi-language Support**: Internationalization support
- **Blockchain Verification**: Immutable audit trail for reports

## 📚 Additional Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://js.langchain.com/)
- [Google Gemini API](https://ai.google.dev/gemini-api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ using cutting-edge AI technology for safer communities.
updated readme
