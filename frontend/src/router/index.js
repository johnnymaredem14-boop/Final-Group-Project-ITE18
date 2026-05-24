import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import LoginView        from '../views/LoginView.vue'
import EmployeeDashboard from '../views/EmployeeDashboard.vue'
import ApplyLeave       from '../views/ApplyLeave.vue'
import MyLeaveRequests  from '../views/MyLeaveRequests.vue'
import AdminDashboard   from '../views/AdminDashboard.vue'
import ManageRequests   from '../views/ManageRequests.vue'
import ManageEmployees  from '../views/ManageEmployees.vue'
import ManageDepartments from '../views/ManageDepartments.vue'
import ManageLeaveTypes from '../views/ManageLeaveTypes.vue'

const routes = [
  { path: '/',                    name: 'login',               component: LoginView },
  { path: '/employee-dashboard',  name: 'employee-dashboard',  component: EmployeeDashboard, meta: { requiresAuth: true, role: 'employee' } },
  { path: '/apply-leave',         name: 'apply-leave',         component: ApplyLeave,        meta: { requiresAuth: true, role: 'employee' } },
  { path: '/my-leave-requests',   name: 'my-leave-requests',   component: MyLeaveRequests,   meta: { requiresAuth: true, role: 'employee' } },
  { path: '/admin-dashboard',     name: 'admin-dashboard',     component: AdminDashboard,    meta: { requiresAuth: true, role: 'admin' } },
  { path: '/manage-requests',     name: 'manage-requests',     component: ManageRequests,    meta: { requiresAuth: true, role: 'admin' } },
  { path: '/manage-employees',    name: 'manage-employees',    component: ManageEmployees,   meta: { requiresAuth: true, role: 'admin' } },
  { path: '/manage-departments',  name: 'manage-departments',  component: ManageDepartments, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/manage-leave-types',  name: 'manage-leave-types',  component: ManageLeaveTypes,  meta: { requiresAuth: true, role: 'admin' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Fixed: return value instead of calling next() (Vue Router v4)
router.beforeEach((to, from) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/'
  }

  if (to.meta.role && authStore.currentUser?.role !== to.meta.role) {
    if (authStore.currentUser?.role === 'admin')    return '/admin-dashboard'
    if (authStore.currentUser?.role === 'employee') return '/employee-dashboard'
    return '/'
  }
})

export default router
