pipeline {
    agent any
    
    tools {
        nodejs 'Archat-client-site-node-20.18.0'
    }
    
    environment {
        // Docker Hub 凭据
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'arclighting'
        
        // 前端镜像配置
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/archat-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // 服务器部署配置
        DEPLOY_SERVER = credentials('deploy-server-ssh')
        DEPLOY_PATH = '/opt/archat'
        
        // Node.js配置
        NODE_OPTIONS = '--max_old_space_size=4096'
    }
    
    stages {
        stage('Checkout Frontend') {
            steps {
                echo '🔄 检出前端代码...'
                checkout scm
                
                script {
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()
                    env.GIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=%an',
                        returnStdout: true
                    ).trim()
                }
                
                echo "📝 前端提交信息: ${env.GIT_COMMIT_MSG}"
                echo "👤 提交者: ${env.GIT_AUTHOR}"
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '🎨 构建前端项目...'
                sh '''
                    echo "📦 Node.js版本信息:"
                    node --version
                    npm --version
                    
                    echo "📥 安装依赖..."
                    npm ci --prefer-offline --no-audit
                    
                    echo "🏗️ 构建生产版本..."
                    npm run build
                    
                    echo "✅ 前端构建完成!"
                    ls -la dist/
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                }
            }
        }
        
        stage('Build & Push Frontend Docker') {
            steps {
                echo '🐳 构建前端Docker镜像...'
                script {
                    def frontendImage = docker.build("${FRONTEND_IMAGE}:${IMAGE_TAG}")
                    
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        frontendImage.push("${IMAGE_TAG}")
                        frontendImage.push("latest")
                    }
                    
                    echo "✅ 前端镜像推送完成: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                }
            }
        }
        
        stage('Update Frontend on Server') {
            steps {
                echo '🚀 更新服务器前端镜像...'
                script {
                    sshagent(['deploy-server-ssh']) {
                        sh '''
                            echo "📦 更新前端镜像版本..."
                            FRONTEND_IMAGE_FULL="${FRONTEND_IMAGE}:${IMAGE_TAG}"
                            
                            ssh -o StrictHostKeyChecking=no ${DEPLOY_SERVER} "
                                cd ${DEPLOY_PATH} && 
                                ./deploy.sh update-frontend-image '${FRONTEND_IMAGE_FULL}' &&
                                ./deploy.sh restart-frontend
                            "
                            
                            echo "✅ 前端更新完成!"
                        '''
                    }
                }
            }
        }
        
        stage('Frontend Health Check') {
            steps {
                echo '🏥 前端健康检查...'
                script {
                    sshagent(['deploy-server-ssh']) {
                        sh '''
                            echo "⏳ 等待前端服务启动..."
                            sleep 15
                            
                            echo "🌐 检查前端服务..."
                            if ssh -o StrictHostKeyChecking=no ${DEPLOY_SERVER} "curl -f http://localhost:80 > /dev/null 2>&1"; then
                                echo "✅ 前端服务正常"
                            else
                                echo "❌ 前端服务异常"
                                exit 1
                            fi
                        '''
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 前端部署成功!'
            script {
                def message = """
🎉 ArcChat前端部署成功!

📋 构建信息:
• 构建号: ${BUILD_NUMBER}
• Git提交: ${env.GIT_COMMIT_MSG}
• 前端镜像: ${FRONTEND_IMAGE}:${IMAGE_TAG}
"""
                echo message
            }
        }
        failure {
            echo '❌ 前端部署失败!'
        }
    }
}
