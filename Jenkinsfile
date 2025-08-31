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
    // Use workspace-local Docker config so auth persists across stages
    DOCKER_CONFIG = "${WORKSPACE}/.docker"
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
        sh label: 'Prepare docker config dir', script: 'mkdir -p "$DOCKER_CONFIG" && rm -f "$DOCKER_CONFIG/config.json" || true'
        withCredentials([usernamePassword(credentialsId: 'ACR_CREDS', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
          sh label: 'Login to ACR', script: 'set -euxo pipefail; echo "$ACR_PASS" | docker --config "$DOCKER_CONFIG" login --username "$ACR_USER" --password-stdin "$REGISTRY"'
          // Optional: print which registries are present in config (no secrets leaked)
          sh label: 'Verify docker auth entry', script: 'set -e; test -f "$DOCKER_CONFIG/config.json" && python3 - <<PY\nimport json, os\npath = os.path.join(os.environ.get("DOCKER_CONFIG", ""), "config.json")\nwith open(path, "r", encoding="utf-8") as f:\n    cfg = json.load(f)\nprint("auths:", list(cfg.get("auths", {}).keys()))\nPY'
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
      // Clean up docker auth used for this build only
      sh 'docker --config "$DOCKER_CONFIG" logout "$REGISTRY" || true'
      sh 'rm -rf "$DOCKER_CONFIG" || true'
      sh 'docker image prune -f || true'
    }
  }
}
