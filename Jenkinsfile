pipeline {
    agent none

    triggers {
        githubPush()
    }

    environment {
        DOCKER_USER  = 'iferlop'
        APP_NAME     = 'administrator-panel'
        NAMESPACE    = 'ferremat-deploy'
        VALUES_FILE  = 'deploy/kubernetes/charts/administrator-panel/values.yaml'
        GIT_REPO_URL = 'https://github.com/Ferremat/Administrator-Panel.git'
    }

    stages {

        stage('Build & Push') {
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
      mountPath: /kaniko/.docker/config.json
      subPath: .dockerconfigjson
    env:
    - name: DOCKER_CONFIG
      value: /kaniko/.docker
  volumes:
  - name: kaniko-secret
    secret:
      secretName: dockerhub-secret
      items:
      - key: .dockerconfigjson
        path: .dockerconfigjson
  nodeSelector:
    kubernetes.io/os: linux
  restartPolicy: Never
"""
                }
            }
            steps {
                checkout scm
                container('kaniko') {
                    script {
                        env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
                    }
                    sh """
                    set -e
                    echo "Building ${APP_NAME}..."
                    echo "Image tag: ${IMAGE_TAG}"
                    /kaniko/executor \\
                        --context \$(pwd) \\
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
            agent {
                kubernetes {
                    yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins
  containers:
  - name: tools
    image: alpine/k8s:1.29.2
    command: ["cat"]
    tty: true
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "256Mi"
        cpu: "200m"
  nodeSelector:
    kubernetes.io/os: linux
  restartPolicy: Never
"""
                }
            }
            steps {
                checkout scm
                container('tools') {
                    withCredentials([usernamePassword(
                        credentialsId: 'github-creds',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )]) {
                        sh """
                        set -e

                        git config --global --add safe.directory \$(pwd)
                        git config --global user.email "jenkins@ferremat.es"
                        git config --global user.name "Jenkins CI"

                        REPO_NO_SCHEME=\$(echo "${GIT_REPO_URL}" | sed 's|https://||')

                        git fetch https://\${GIT_USER}:\${GIT_TOKEN}@\${REPO_NO_SCHEME} main
                        git checkout -B main FETCH_HEAD

                        echo "Updating image tag to ${IMAGE_TAG} in ${VALUES_FILE}..."
                        sed -i 's|^    tag:.*|    tag: ${IMAGE_TAG}|' ${VALUES_FILE}

                        echo "--- values.yaml after update ---"
                        cat ${VALUES_FILE}

                        git add ${VALUES_FILE}
                        git diff --cached --quiet || git commit -m "ci: update ${APP_NAME} image to ${IMAGE_TAG} [skip ci]"

                        git push https://\${GIT_USER}:\${GIT_TOKEN}@\${REPO_NO_SCHEME} HEAD:main

                        echo "values.yaml pushed — ArgoCD will sync automatically"
                        """
                    }
                }
            }
        }

    }

    post {
        success {
            echo "Pipeline completed: image published and values.yaml updated."
        }
        failure {
            echo "Pipeline failed. Check the logs."
        }
    }
}
