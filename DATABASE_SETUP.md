# Database Setup Guide for Crime Detection System

This guide will help you set up a NeonDB PostgreSQL database with Prisma for the crime detection system.

## 🚀 Quick Setup

### 1. Create a NeonDB Account

1. Go to [NeonDB](https://neon.tech/)
2. Sign up for a free account
3. Create a new project
4. Copy your database connection string

### 2. Set Up Environment Variables

1. Copy `env.example` to `.env.local`
2. Update the following variables:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (NeonDB PostgreSQL)
DATABASE_URL="postgresql://your_username:your_password@ep-xyz-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 6. Start the Development Server

```bash
npm run dev
```

## 📊 Database Schema

The system uses the following main tables:

- **users**: User accounts and roles
- **crime_reports**: Main crime report data
- **ai_analyses**: AI analysis results
- **human_verifications**: Human verification decisions

## 🔧 Database Operations

### View Database in Prisma Studio

```bash
npx prisma studio
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

### Deploy to Production

```bash
npx prisma migrate deploy
```

## 🌐 NeonDB Features

- **Serverless**: Auto-scales based on usage
- **Branching**: Create development branches
- **Connection Pooling**: Built-in connection management
- **Backups**: Automatic daily backups
- **Monitoring**: Built-in performance monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed**: Check your DATABASE_URL format
2. **Migration Errors**: Ensure your schema is valid
3. **Permission Denied**: Verify your database credentials

### Reset Everything

```bash
# Remove existing migrations
rm -rf prisma/migrations

# Reset database
npx prisma migrate reset

# Create fresh migration
npx prisma migrate dev --name init
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | NeonDB connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSyC...` |

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use environment-specific connection strings
- Enable SSL for production connections
- Regularly rotate database credentials

## 📚 Additional Resources

- [NeonDB Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
