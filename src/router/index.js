import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Login from '../views/user/Login.vue'
import Chat from '../views/chat/Chat.vue'
import UserHub from '../views/user/UserHub.vue'
import MailBox from '../views/mail/MailBox.vue'
import silent from '@/views/silent.vue'
import NoticeCenter from '@/views/mail/NoticeCenter.vue'
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: Home,
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
                    component: UserHub,
                    name: 'UserHub'
                },
                {
                    path: 'mail',
                    component: MailBox,
                    name: 'mail'
                },
                {
                    path: 'noticecenter',
                    component: NoticeCenter,
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
            component: Login,
            name: 'login'
        },
        {
            path: '/silent',
            component: silent,
            name: 'silent'
        },
        // 404页面
        {
            path: '/:pathMatch(.*)*',
            component: () => import('../components/misc/404NotFound.vue')
        }
    ],
})

export default router
