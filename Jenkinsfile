pipeline {

    agent any

    parameters {
        string(
            name: 'BRANCH',
            defaultValue: 'main',
            description: 'Git branch to deploy'
        )
    }

    environment {

        // GitHub
        GIT_REPO = 'git@github.com:dharmakhadkachhetri-annofi/Simple_CICD.git'

        // Application directories
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR  = 'backend'

        // Angular build output
        FRONTEND_DIST = 'frontend/dist'

        // NGINX
        NGINX_ROOT = '/var/www/html'

        // Tomcat
        TOMCAT_WEBAPPS = '/opt/tomcat/webapps'
        WAR_NAME = 'todo-backend.war'
    }

    stages {

        stage('Checkout') {
            steps {
                deleteDir()

                git(
                    branch: "${params.BRANCH}",
                    credentialsId: '76c78476-c32f-46da-83bf-b4f7e40fc192',
                    url: "${GIT_REPO}"
                )
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {

                    sh '''
                        set -e

                        echo "Installing frontend dependencies..."
                        npm ci

                        echo "Building frontend..."
                        npm run build -- --configuration=production
                    '''
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {

                    sh '''
                        set -e

                        echo "Building Spring Boot backend..."

                        mvn clean package -DskipTests
                    '''
                }
            }
        }

        stage('Deploy Frontend') {
            steps {

                sh '''
                    set -e

                    echo "Deploying frontend to NGINX..."

                    sudo rm -rf ${NGINX_ROOT}/*

                    sudo cp -r ${WORKSPACE}/${FRONTEND_DIST}/* \
                        ${NGINX_ROOT}/

                    echo "Testing NGINX configuration..."

                    sudo nginx -t

                    echo "Reloading NGINX..."

                    sudo systemctl reload nginx

                    echo "Frontend deployment completed."
                '''
            }
        }

        stage('Deploy Backend') {
            steps {

                sh '''
                    set -e

                    echo "Finding WAR file..."

                    WAR_FILE=$(find \
                        ${WORKSPACE}/${BACKEND_DIR}/target \
                        -maxdepth 1 \
                        -type f \
                        -name "*.war" \
                        | head -n 1)

                    if [ -z "$WAR_FILE" ]; then
                        echo "ERROR: WAR file not found!"
                        exit 1
                    fi

                    echo "WAR found:"
                    echo "$WAR_FILE"

                    echo "Stopping Tomcat..."

                    sudo systemctl stop tomcat

                    echo "Removing old deployment..."

                    sudo rm -f ${TOMCAT_WEBAPPS}/${WAR_NAME}

                    sudo rm -rf ${TOMCAT_WEBAPPS}/backend

                    echo "Copying new WAR..."

                    sudo cp "$WAR_FILE" \
                        ${TOMCAT_WEBAPPS}/${WAR_NAME}

                    echo "Starting Tomcat..."

                    sudo systemctl start tomcat

                    echo "Backend deployment completed."
                '''
            }
        }

        stage('Verify Deployment') {
            steps {

                sh '''
                    set -e

                    echo "Checking NGINX..."

                    sudo systemctl is-active --quiet nginx

                    echo "NGINX is running."

                    echo "Checking Tomcat..."

                    sudo systemctl is-active --quiet tomcat

                    echo "Tomcat is running."

                    echo ""
                    echo "======================================"
                    echo "       DEPLOYMENT SUCCESSFUL"
                    echo "======================================"
                    echo "Branch: ${BRANCH}"
                    echo "Frontend: NGINX"
                    echo "Backend: Tomcat"
                    echo "======================================"
                '''
            }
        }
    }

    post {

        success {
            echo 'Application deployed successfully.'
        }

        failure {
            echo 'Deployment failed. Check Jenkins console output.'
        }
    }
}
