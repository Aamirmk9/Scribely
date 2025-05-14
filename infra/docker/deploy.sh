#!/bin/bash
set -e

# Navigate to the docker directory
cd "$(dirname "$0")"

# Display help information
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
  echo "Scribely Deployment Script"
  echo ""
  echo "Usage: ./deploy.sh [OPTION]"
  echo ""
  echo "Options:"
  echo "  start      Start all services (default if no option provided)"
  echo "  stop       Stop all services"
  echo "  restart    Restart all services"
  echo "  logs       View logs from all services"
  echo "  build      Rebuild all services"
  echo "  help       Display this help message"
  exit 0
fi

# Define functions
start_services() {
  echo "Starting Scribely services..."
  docker-compose up -d
  echo "Services started. Frontend available at http://localhost"
  echo "Backend API available at http://localhost:8000"
}

stop_services() {
  echo "Stopping Scribely services..."
  docker-compose down
  echo "Services stopped."
}

restart_services() {
  stop_services
  start_services
}

view_logs() {
  docker-compose logs -f
}

build_services() {
  echo "Building Scribely services..."
  docker-compose build
  echo "Build completed."
}

# Process command line argument
case "$1" in
  "start"|"")
    start_services
    ;;
  "stop")
    stop_services
    ;;
  "restart")
    restart_services
    ;;
  "logs")
    view_logs
    ;;
  "build")
    build_services
    ;;
  *)
    echo "Unknown option: $1"
    echo "Use --help for usage information."
    exit 1
    ;;
esac 