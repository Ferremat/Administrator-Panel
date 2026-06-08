pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ["/busybox/cat"]
    tty: true
    resources:
      requests:
        memory: "2Gi"
        cpu: "1"
      limits:
        memory: "4Gi"
        cpu: "2"
    volumeMounts:
    - name: kaniko-secret
      mountPath: /kaniko/.docker
    - name: workspace-volume
      mountPath: /workspace
    env:
    - name: DOCKER_CONFIG
      value: /kaniko/.docker
  - name: tools
    image: alpine:latest
    command: ["cat"]
    tty: true
    resources:
      requests:
        memory: "512Mi"
        cpu: "200m"
      limits:
        memory: "1Gi"
        cpu: "500m"
    volumeMounts:
    - name: workspace-volume
      mountPath: /workspace
  volumes:
  - name: kaniko-secret
    secret:
      secretName: dockerhub-secret
      items:
      - key: .dockerconfigjson
        path: config.json
  - name: workspace-volume
    emptyDir:
      sizeLimit: 10Gi
  nodeSelector:
    kubernetes.io/os: linux
  restartPolicy: Never
"""
        }
    }

    triggers {
        githubPush()
    }

    environment {
        DOCKER_USER  = 'iferlop'
        APP_NAME     = 'administrator-panel'
        NAMESPACE    = 'ferremat-deploy'
        VALUES_FILE  = 'deploy/kubernetes/charts/administrator-panel/values.yaml'
        GIT_REPO_URL = 'https://github.com/iferlop/administrator-panel.git'
    }

    stages {
        stage('Debug') {
            steps {
                container('tools') {
                    sh """
                    echo "Current directory: \$(pwd)"
                    echo "Listing root files:"
                    ls -la
                    echo "Looking for Dockerfile:"
                    find . -name "Dockerfile" -type f
                    """
                }
            }
        }

        stage('Build & Push Administrator Panel') {
            steps {
                container('kaniko') {
                    script {
                        env.IMAGE_TAG = "${env.BUILD_NUMBER}-${sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()}"
                    }
                    sh """
                    set -e
                    echo "Starting administrator-panel build..."
                    echo "Image tag: ${IMAGE_TAG}"
                    /kaniko/executor \\
                        --context `pwd` \\
                        --dockerfile Dockerfile \\
                        --destination ${DOCKER_USER}/${APP_NAME}:latest \\
                        --destination ${DOCKER_USER}/${APP_NAME}:${IMAGE_TAG} \\
                        --cache=true \\
                        --cache-repo=${DOCKER_USER}/${APP_NAME}
                    echo "Build completed: ${DOCKER_USER}/${APP_NAME}:${IMAGE_TAG}"
                    """
                }
            }
        }

        stage('Update values.yaml & Push to Git') {
            steps {
                container('tools') {
                    withCredentials([usernamePassword(
                        credentialsId: 'github-credentials',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )]) {
                        sh """
                        set -e
                        echo "Installing dependencies..."
                        apk add --no-cache git sed

                        # Configurar git
                        git config --global user.email "jenkins@ferremat.es"
                        git config --global user.name "Jenkins CI"

                        # Actualizar el tag en values.yaml
                        echo "Updating image tag to ${IMAGE_TAG} in ${VALUES_FILE}..."
                        sed -i "s|^  tag:.*|  tag: ${IMAGE_TAG}|" ${VALUES_FILE}

                        echo "--- values.yaml after update ---"
                        cat ${VALUES_FILE}

                        # Commit y push — ArgoCD detectará el cambio y sincronizará
                        git add ${VALUES_FILE}
                        git diff --cached --quiet || git commit -m "ci: update ${APP_NAME} image to ${IMAGE_TAG} [skip ci]"
                        git push https://\${GIT_USER}:\${GIT_TOKEN}@${GIT_REPO_URL#https://} HEAD:main

                        echo "✓ values.yaml pushed — ArgoCD will sync automatically"
                        """
                    }
                }
            }
        }
    }
}
