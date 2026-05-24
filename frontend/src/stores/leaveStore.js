import { defineStore } from 'pinia'
import { api } from '../services/api'

const todayDateString = () => new Date().toISOString().split('T')[0]
const isPastDate = dateValue => dateValue < todayDateString()

export const useLeaveStore = defineStore('leaveStore', {
  state: () => ({
    employees: [],
    departments: [],
    leaveTypes: [],
    leaveRequests: [],
    myLeaveRequests: [],
    employeeProfile: null,
    errorMessage: ''
  }),

  getters: {
    totalEmployees: state => state.employees.length,
    pendingRequests: state => state.leaveRequests.filter(request => request.status === 'Pending').length,
    approvedRequests: state => state.leaveRequests.filter(request => request.status === 'Approved').length,
    rejectedRequests: state => state.leaveRequests.filter(request => request.status === 'Rejected').length
  },

  actions: {
    setError(error) {
      this.errorMessage = error?.message || 'Something went wrong.'
    },

    clearError() {
      this.errorMessage = ''
    },

    async loadAdminData() {
      this.clearError()
      try {
        this.employees = await api.get('/employees')
        this.departments = await api.get('/departments')
        this.leaveTypes = await api.get('/leave-types')
        this.leaveRequests = await api.get('/leave-requests')
      } catch (error) {
        this.setError(error)
      }
    },

    async loadEmployeeData() {
      this.clearError()
      try {
        this.employeeProfile = await api.get('/employees/me')
        this.departments = await api.get('/departments')
        this.leaveTypes = await api.get('/leave-types')
        this.myLeaveRequests = await api.get('/leave-requests/my')
      } catch (error) {
        this.setError(error)
      }
    },

    async loadEmployees() { this.employees = await api.get('/employees') },
    async loadDepartments() { this.departments = await api.get('/departments') },
    async loadLeaveTypes() { this.leaveTypes = await api.get('/leave-types') },
    async loadLeaveRequests() { this.leaveRequests = await api.get('/leave-requests') },

    async loadMyLeaveRequests() {
      this.employeeProfile = await api.get('/employees/me')
      this.myLeaveRequests = await api.get('/leave-requests/my')
    },

    async addLeaveRequest(request) {
      if (isPastDate(request.startDate) || isPastDate(request.endDate)) throw new Error('You cannot file a leave using a past date.')
      await api.post('/leave-requests', request)
      await this.loadMyLeaveRequests()
    },

    async updateLeaveRequest(id, updatedData) {
      if (isPastDate(updatedData.startDate) || isPastDate(updatedData.endDate)) throw new Error('You cannot update a leave using a past date.')
      await api.put(`/leave-requests/${id}`, updatedData)
      await this.loadMyLeaveRequests()
    },

    async deleteLeaveRequest(id) {
      await api.delete(`/leave-requests/${id}`)
      await this.loadMyLeaveRequests()
    },

    async approveRequest(id) {
      await api.patch(`/leave-requests/${id}/status`, { status: 'Approved' })
      await this.loadLeaveRequests()
      await this.loadEmployees()
    },

    async rejectRequest(id) {
      await api.patch(`/leave-requests/${id}/status`, { status: 'Rejected' })
      await this.loadLeaveRequests()
    },

    async addEmployee(employee) {
      await api.post('/employees', { ...employee, leaveBalance: Number(employee.leaveBalance) })
      await this.loadEmployees()
    },

    async updateEmployee(id, updatedEmployee) {
      await api.put(`/employees/${id}`, { ...updatedEmployee, leaveBalance: Number(updatedEmployee.leaveBalance) })
      await this.loadEmployees()
    },

    async deleteEmployee(id) {
      await api.delete(`/employees/${id}`)
      await this.loadEmployees()
    },

    async addDepartment(name) { await api.post('/departments', { name }); await this.loadDepartments() },
    async updateDepartment(id, name) { await api.put(`/departments/${id}`, { name }); await this.loadDepartments() },
    async deleteDepartment(id) { await api.delete(`/departments/${id}`); await this.loadDepartments() },
    async addLeaveType(name) { await api.post('/leave-types', { name }); await this.loadLeaveTypes() },
    async updateLeaveType(id, name) { await api.put(`/leave-types/${id}`, { name }); await this.loadLeaveTypes() },
    async deleteLeaveType(id) { await api.delete(`/leave-types/${id}`); await this.loadLeaveTypes() }
  }
})
