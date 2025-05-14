#!/bin/bash
set -e

# Default values
STACK_NAME="scribely"
REGION="us-east-1"
ENVIRONMENT="dev"

# Display help information
function show_help {
  echo "Scribely AWS Deployment Script"
  echo ""
  echo "Usage: ./deploy.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  -s, --stack-name NAME     CloudFormation stack name (default: scribely)"
  echo "  -r, --region REGION       AWS region (default: us-east-1)"
  echo "  -e, --environment ENV     Environment: dev, staging, prod (default: dev)"
  echo "  -h, --help                Display this help message"
  echo ""
  echo "Example: ./deploy.sh --stack-name scribely-prod --environment prod --region us-west-2"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -s|--stack-name)
      STACK_NAME="$2"
      shift
      shift
      ;;
    -r|--region)
      REGION="$2"
      shift
      shift
      ;;
    -e|--environment)
      ENVIRONMENT="$2"
      shift
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "prod" ]]; then
  echo "Error: Environment must be one of: dev, staging, prod"
  exit 1
fi

# Get VPC and Subnet IDs
echo "Fetching default VPC and Subnet information..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region $REGION)

if [ -z "$VPC_ID" ]; then
  echo "Error: Could not find default VPC. Please specify a VPC manually."
  exit 1
fi

SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text --region $REGION)
SUBNET_IDS_ARRAY=($(echo $SUBNET_IDS | tr '\t' ' '))

if [ ${#SUBNET_IDS_ARRAY[@]} -lt 2 ]; then
  echo "Error: Need at least two subnets for the load balancer."
  exit 1
fi

# Convert subnet array to CloudFormation parameter format
SUBNET_PARAMS=""
for subnet in "${SUBNET_IDS_ARRAY[@]:0:2}"; do
  SUBNET_PARAMS="$SUBNET_PARAMS,$subnet"
done
SUBNET_PARAMS=${SUBNET_PARAMS:1}  # Remove the leading comma

# Generate a random secret key for JWT tokens
SECRET_KEY=$(openssl rand -hex 32)

# Check if AWS credentials are configured
echo "Verifying AWS credentials..."
aws sts get-caller-identity > /dev/null || { echo "Error: AWS credentials not configured. Run 'aws configure' first."; exit 1; }

# Prompt for Hugging Face API token
read -sp "Enter your Hugging Face API token: " HUGGINGFACE_API_TOKEN
echo ""
if [ -z "$HUGGINGFACE_API_TOKEN" ]; then
  echo "Warning: No Hugging Face API token provided. Some features may not work."
fi

# Deploy CloudFormation stack
echo "Deploying Scribely to AWS..."
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo "VPC ID: $VPC_ID"
echo "Subnets: $SUBNET_PARAMS"

aws cloudformation deploy \
  --template-file cloudformation.yml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    VpcId=$VPC_ID \
    SubnetIds=$SUBNET_PARAMS \
    SecretKey=$SECRET_KEY \
    HuggingFaceApiToken=$HUGGINGFACE_API_TOKEN \
  --region $REGION

# Get deployment outputs
echo "Fetching deployment information..."
LOAD_BALANCER_DNS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" --output text --region $REGION)
BACKEND_REPOSITORY=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='BackendRepository'].OutputValue" --output text --region $REGION)
FRONTEND_REPOSITORY=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='FrontendRepository'].OutputValue" --output text --region $REGION)

echo ""
echo "Deployment successful!"
echo "--------------------------------"
echo "Load Balancer URL: http://$LOAD_BALANCER_DNS"
echo "Backend ECR Repository: $BACKEND_REPOSITORY"
echo "Frontend ECR Repository: $FRONTEND_REPOSITORY"
echo ""
echo "Next steps:"
echo "1. Build and push the Docker images to ECR:"
echo "   docker build -t $BACKEND_REPOSITORY:latest -f infra/docker/Dockerfile.backend ."
echo "   docker build -t $FRONTEND_REPOSITORY:latest -f infra/docker/Dockerfile.frontend ."
echo "   aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $(echo $BACKEND_REPOSITORY | cut -d/ -f1)"
echo "   docker push $BACKEND_REPOSITORY:latest"
echo "   docker push $FRONTEND_REPOSITORY:latest"
echo ""
echo "2. Restart the ECS service to deploy the new images:"
echo "   aws ecs update-service --cluster scribely-$ENVIRONMENT --service scribely-backend-$ENVIRONMENT --force-new-deployment --region $REGION"
echo "" 