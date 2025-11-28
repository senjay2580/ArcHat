pipeline {
    agent any
    
    // 触发器配置（本地 Jenkins 使用轮询）
    triggers {
        // 轮询方式：每2分钟检查一次代码更新
        pollSCM('H/2 * * * *')
    }
    
    // 使用系统预安装的 Node.js，避免下载问题
    // tools {
    //     nodejs 'Archat-client-site-node-20.18.0'
    // }
    
    environment {
        // Docker Hub 凭据
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'arclighting'
        
        // 前端镜像配置
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/archat-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // 服务器部署配置
        DEPLOY_SERVER_IP = '8.138.168.72'  // 服务器IP地址
        DEPLOY_USER = 'root'
        DEPLOY_PATH = '/opt/archat'
        
        // Node.js配置
        NODE_OPTIONS = '--max_old_space_size=4096'
    }
    
    stages {
        stage('Get Git Info') {
            steps {
                echo '📋 获取Git信息...'
                script {
                    env.GIT_COMMIT_MSG = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: "git log -1 --pretty=%an", returnStdout: true).trim()
                }
                
                echo "📝 前端提交信息: ${env.GIT_COMMIT_MSG}"
                echo "👤 提交者: ${env.GIT_AUTHOR}"
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '🎨 构建前端项目...'
                sh '''
                    echo "📦 检查或安装 Node.js..."
                    # 检查工作空间中是否已有 Node.js
                    if [ ! -d "./node-v20.18.0-linux-x64" ]; then
                        echo "下载 Node.js 20.18.0 二进制包..."
                        curl -fsSL -o node-v20.18.0-linux-x64.tar.xz https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz
                        tar -xf node-v20.18.0-linux-x64.tar.xz
                        rm node-v20.18.0-linux-x64.tar.xz  # 清理下载文件
                        echo "✅ Node.js 安装完成"
                    else
                        echo "✅ 使用缓存的 Node.js"
                    fi
                    
                    # 设置 Node.js PATH
                    export PATH="$PWD/node-v20.18.0-linux-x64/bin:$PATH"
                    
                    echo "📦 Node.js版本信息:"
                    node --version
                    npm --version
                    
                    echo "📦 当前工作目录:"
                    pwd
                    ls -la package.json
                    
                    echo "📥 安装依赖..."
                    # 使用淘宝镜像加速下载
                    npm config set registry https://registry.npmmirror.com
                    # 使用 npm 缓存加速安装
                    npm config set cache $PWD/.npm-cache
                    npm install --prefer-offline --no-audit
                    
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
        
        stage('Docker Build & Deploy') {
            parallel {
                stage('Build & Push Docker') {
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
                stage('Prepare Server') {
                    steps {
                        echo '🔧 准备服务器环境...'
                        script {
                            sshagent(['deploy-server-ssh']) {
                                sh '''
                                    echo "🔍 检查服务器状态..."
                                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER_IP} "
                                        cd ${DEPLOY_PATH} && 
                                        echo '服务器准备就绪'
                                    "
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Server') {
            steps {
                echo '🚀 部署到服务器...'
                script {
                    sshagent(['deploy-server-ssh']) {
                        sh '''
                            echo "📦 更新前端镜像版本..."
                            FRONTEND_IMAGE_FULL="${FRONTEND_IMAGE}:${IMAGE_TAG}"
                            
                            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER_IP} "
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
                            if ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER_IP} "curl -f http://localhost:80 > /dev/null 2>&1"; then
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
