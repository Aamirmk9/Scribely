# Scribely - AI-Powered Clinical Documentation Assistant

Scribely is an AI-powered clinical documentation assistant that leverages NLP and speech-to-text technology to reduce clinicians' note-taking time by up to 70%.

## Key Features

- Real-time speech-to-text transcription using AWS Transcribe Medical
- Custom NLP pipeline built with Hugging Face Transformers
- FHIR-compliant EHR integration with OAuth2/JWT security
- React.js + Tailwind dashboard for reviewing AI-generated SOAP notes

## Project Structure

```
scribely/
├── backend/               # FastAPI backend
│   ├── api/               # API routes
│   ├── core/              # Core configuration
│   ├── models/            # Data models
│   ├── nlp/               # NLP pipeline
│   ├── services/          # External services (AWS, etc.)
│   └── tests/             # Backend tests
├── frontend/              # React.js frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── styles/        # CSS styles
│   └── tests/             # Frontend tests
└── infra/                 # Infrastructure as code
    ├── aws/               # AWS configurations
    └── docker/            # Docker configurations
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- AWS account with Transcribe Medical access
- Hugging Face account (for model access)

### Docker Deployment (Recommended)

The easiest way to get started is with Docker:

```bash
# Clone the repository
git clone https://github.com/yourusername/scribely.git
cd scribely

# Create an .env file with your credentials
cp backend/.env-example backend/.env
# Edit the .env file with your credentials

# Deploy with Docker
cd infra/docker
chmod +x deploy.sh
./deploy.sh

# The application will be available at:
# - Frontend: http://localhost
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```
# Security
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=scribely

# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# Hugging Face
HUGGINGFACE_API_TOKEN=your_huggingface_token
```

## AWS Deployment

For production deployment to AWS:

```bash
# Install AWS CLI and configure credentials
aws configure

# Deploy to AWS using CloudFormation
cd infra/aws
chmod +x deploy.sh
./deploy.sh --environment prod

# Follow the prompts and on-screen instructions
# This will create:
# - DocumentDB (MongoDB compatible) database
# - ECS Fargate cluster for containerized deployment
# - Load balancer and auto-scaling 
# - ECR repositories for container images
```

After deployment, build and push your Docker images to ECR according to the output instructions from the deployment script.

## License

MIT 