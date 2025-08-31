pipeline {
  agent any

  parameters {
    string(name: 'IMAGE_TAG', defaultValue: '', description: 'Optional image tag. Defaults to short git SHA.')
  }

  environment {
    REGISTRY  = 'crpi-zxzuznbjeonc59xu.cn-hangzhou.personal.cr.aliyuncs.com'
    NAMESPACE = 'jason-docker-aliyun'
    BACKEND_REPO  = "${REGISTRY}/${NAMESPACE}/gpt-test-backend"
    FRONTEND_REPO = "${REGISTRY}/${NAMESPACE}/gpt-test-frontend"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Compute Tag') {
      steps {
        script {
          def tag = params.IMAGE_TAG?.trim()
          if (!tag) {
            try {
              tag = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
            } catch (err) {
              tag = env.BUILD_NUMBER
            }
          }
          env.IMAGE_TAG = tag
          echo "Using IMAGE_TAG=${env.IMAGE_TAG}"
        }
      }
    }

    stage('Docker Login (ACR)') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'ACR_CREDS', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
          sh label: 'Login to ACR', script: 'echo "$ACR_PASS" | docker login --username "$ACR_USER" --password-stdin "$REGISTRY"'
        }
      }
    }

    stage('Build Images') {
      steps {
        sh label: 'Build backend image', script: 'docker build -f backend/Dockerfile -t "$BACKEND_REPO:$IMAGE_TAG" .'
        sh label: 'Build frontend image', script: 'docker build -f frontend/Dockerfile -t "$FRONTEND_REPO:$IMAGE_TAG" .'
      }
    }

    stage('Push Images') {
      steps {
        sh label: 'Push backend', script: 'docker push "$BACKEND_REPO:$IMAGE_TAG"'
        sh label: 'Push frontend', script: 'docker push "$FRONTEND_REPO:$IMAGE_TAG"'
      }
    }
  }

  post {
    always {
      sh 'docker logout "$REGISTRY" || true'
      sh 'docker image prune -f || true'
    }
  }
}

