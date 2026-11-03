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

        // GitHub repository
        GIT_REPO = 'git@github.com:dharmakhadkachhetri-annofi/Simple_CICD.git'

        // Frontend
        FRONTEND_DIR = 'frontend'
        FRONTEND_DIST = 'frontend/dist'

        // NGINX
        NGINX_DIR = '/var/www/html'

        // Backend
        BACKEND_DIR = 'backend'
        TOMCAT_WEBAPPS = '/opt/tomcat/webapps'

        // WAR name deployed to Tomcat
        WAR_NAME = 'backend.war'
    }

    stages {

        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout') {
            steps {
                echo "Checking out branch: ${params.BRANCH}"

                git branch: "${params.BRANCH}",
                    credentialsId: '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',
                    url: "${GIT_REPO}"
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {

                    echo 'Installing frontend dependencies...'

                    sh '''
                        npm ci
                    '''

                    echo 'Building frontend...'

                    sh '''
                        npm run build
                    '''
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {

                    echo 'Building backend...'

                    sh '''
                        mvn clean package -DskipTests
                    '''
                }
            }
        }

        stage('Deploy Frontend') {
            steps {

                echo 'Deploying frontend to NGINX...'

                sh '''
                    set -e

                    echo "Cleaning NGINX web root..."

                    sudo rm -rf ${NGINX_DIR}/*

                    echo "Copying frontend files..."

                    sudo cp -r ${WORKSPACE}/${FRONTEND_DIST}/* ${NGINX_DIR}/

                    echo "Frontend deployment completed."
                '''
            }
        }

        stage('Deploy Backend') {
            steps {

                echo 'Deploying backend to Tomcat...'

                sh '''
                    set -e

                    WAR_FILE=$(find ${WORKSPACE}/${BACKEND_DIR}/target \
                        -maxdepth 1 \
                        -name "*.war" \
                        -type f \
                        | head -n 1)

                    if [ -z "$WAR_FILE" ]; then
                        echo "ERROR: WAR file not found!"
                        exit 1
                    fi

                    echo "Found WAR: $WAR_FILE"

                    echo "Removing old application..."

                    sudo rm -f ${TOMCAT_WEBAPPS}/${WAR_NAME}

                    sudo rm -rf ${TOMCAT_WEBAPPS}/backend

                    echo "Copying new WAR..."

                    sudo cp "$WAR_FILE" \
                        ${TOMCAT_WEBAPPS}/${WAR_NAME}

                    echo "Backend deployment completed."
                '''
            }
        }

        stage('Restart Services') {
            steps {

                echo 'Restarting NGINX...'

                sh '''
                    sudo systemctl restart nginx
                '''

                echo 'Restarting Tomcat...'

                sh '''
                    sudo systemctl restart tomcat
                '''
            }
        }

        stage('Verify Services') {
            steps {

                sh '''
                    echo "Checking NGINX..."

                    sudo systemctl is-active --quiet nginx

                    if [ $? -ne 0 ]; then
                        echo "ERROR: NGINX is not running!"
                        exit 1
                    fi

                    echo "NGINX is running."

                    echo "Checking Tomcat..."

                    sudo systemctl is-active --quiet tomcat

                    if [ $? -ne 0 ]; then
                        echo "ERROR: Tomcat is not running!"
                        exit 1
                    fi

                    echo "Tomcat is running."
                '''
            }
        }
    }

    post {

        success {
            echo "====================================="
            echo "Deployment SUCCESSFUL"
            echo "Branch: ${params.BRANCH}"
            echo "Frontend: NGINX"
            echo "Backend: Tomcat"
            echo "====================================="
        }

        failure {
            echo "====================================="
            echo "Deployment FAILED"
            echo "Check Jenkins console output."
            echo "====================================="
        }
    }
}
