pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-jenkins-tp' // الـ Credentials التي أضفتها في Jenkins
        DOCKER_IMAGE_NAME = 'ahmed122005/ergovoice-todo'       // غيّرها باسمك على Docker Hub
    }

    stages {
        // المرحلة 1: جلب الكود من Git
        stage('Checkout Git') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/12ahm-c/ErgoVoice-Todo-deploy.git' // ضع رابط مشروعك
            }
        }

        // المرحلة 2: بناء صورة Docker
        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE_NAME}:${env.BUILD_ID}")
                }
            }
        }

        // المرحلة 3: تشغيل اختبارات الوحدة داخل الحاوية
        stage('Run Unit Tests') {
            steps {
                sh "docker run --rm ${DOCKER_IMAGE_NAME}:${env.BUILD_ID} npm test"
            }
        }

        // المرحلة 4: رفع الصورة إلى Docker Hub
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDENTIALS_ID) {
                        dockerImage.push()
                    }
                }
            }
        }

        // المرحلة 5: نشر التطبيق على بيئة التطوير
        stage('Deploy to Dev') {
            steps {
                script {
sh 'docker stop ergovoice-dev || true'
sh 'docker rm ergovoice-dev || true'
sh "docker run -d -p 3000:3000 --name ergovoice-dev ${DOCKER_IMAGE_NAME}:${env.BUILD_ID}"                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline انتهى بنجاح، التطبيق يعمل على Dev."
        }
        failure {
            echo "❌ حدث خطأ أثناء تنفيذ الـ Pipeline، تحقق من Console Output."
        }
    }
}