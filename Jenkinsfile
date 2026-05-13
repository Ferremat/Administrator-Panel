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

    environment {
        DOCKER_USER = 'iferlop'
        APP_NAME    = 'administrator-panel'
        NAMESPACE   = 'ferremat-deploy'
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
                    sh """
                    set -e
                    echo "Starting administrator-panel build..."
                    /kaniko/executor \\
                        --context `pwd` \\
                        --dockerfile Dockerfile \\
                        --destination ${DOCKER_USER}/${APP_NAME}:latest \\
                        --cache=true \\
                        --cache-repo=${DOCKER_USER}/${APP_NAME}
                    echo "administrator-panel build completed successfully"
                    """
                }
            }
        }

        stage('Update and Refresh ArgoCD') {
            steps {
                container('tools') {
                    sh """
                    set -e
                    echo "Preparing ArgoCD update..."

                    # Instalar dependencias
                    apk add --no-cache curl ca-certificates

                    # Descargar kubectl
                    echo "Downloading kubectl..."
                    KUBE_VERSION=\$(curl -L -s https://dl.k8s.io/release/stable.txt)
                    curl -LO "https://dl.k8s.io/release/\${KUBE_VERSION}/bin/linux/amd64/kubectl"
                    chmod +x kubectl
                    mv kubectl /usr/local/bin/

                    # Verificar kubectl
                    kubectl version --client

                    echo "Restarting deployment..."
                    kubectl rollout restart deployment/${APP_NAME}-deployment -n ${NAMESPACE} --ignore-not-found || true

                    echo "✓ Deployment restarted successfully"
                    """
                }
            }
        }
    }
}
