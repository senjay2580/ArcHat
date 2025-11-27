import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/views/home.vue'),
            name: 'home',
            redirect: '/chat',
            children: [
                {
                    path: 'chat',
                    name: 'Chat',
                    component: () => import('@/views/chat/Chat.vue'),
                    children: [
                        {
                            path: '',
                            name: 'StartPage',
                            component: () => import('@/views/chat/StartPage.vue')
                        },
                        {
                            path: ':id',
                            name: 'ChatRoom',
                            component: () => import('@/views/chat/Chat.vue')
                        }
                    ]
                },
                {
                    path: 'UserHub',
                    component: () => import('@/views/user/UserHub.vue'),
                    name: 'UserHub'
                },
                {
                    path: 'mail',
                    component: () => import('@/views/mail/MailBox.vue'),
                    name: 'mail'
                },
                {
                    path: 'noticecenter',
                    component: () => import('@/views/mail/NoticeCenter.vue'),
                    name: 'noticecenter'
                },
                {
                    path: 'aichat',
                    name: 'AiChat',
                    component: () => import('@/views/AiChatView.vue')
                },
                {
                    path: 'archives',
                    name: 'Archives',
                    component: () => import('@/views/ArchivesView.vue')
                },
                {
                    path: 'groupchat/:id',
                    name: 'GroupChat',
                    component: () => import('@/views/chat/GroupChat.vue')
                }
            ]
        },
        {
            path: '/login',
            component: () => import('@/views/user/Login.vue'),
            name: 'login'
        },
        {
            path: '/silent',
            component: () => import('@/views/silent.vue'),
            name: 'silent'
        },
        // 404页面
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/components/misc/404NotFound.vue')
        }
    ],
})

export default router
