<template>
  <div class="page">
    <div class="container panel">
      <PageHeader title="Admin Dashboard" />

      <div v-if="errorMessage" class="error-box">
        {{ errorMessage }}
        <br />
        Check if backend, MySQL, and frontend .env are running correctly.
      </div>

      <div class="grid-4">
        <StatCard title="Total Employees" :value="leaveStore.totalEmployees" />
        <StatCard title="Pending Requests" :value="leaveStore.pendingRequests" />
        <StatCard title="Approved Requests" :value="leaveStore.approvedRequests" />
        <StatCard title="Rejected Requests" :value="leaveStore.rejectedRequests" />
      </div>

      <div class="action-row">
        <button class="btn" @click="router.push('/manage-requests')">Manage Requests</button>
        <button class="btn secondary" @click="router.push('/manage-employees')">Manage Employees</button>
        <button class="btn secondary" @click="router.push('/manage-departments')">Manage Departments</button>
        <button class="btn secondary" @click="router.push('/manage-leave-types')">Manage Leave Types</button>
      </div>

      <h2>Recent Leave Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="request in leaveStore.leaveRequests" :key="request.id">
            <td>{{ request.employee }}</td>
            <td>{{ request.department }}</td>
            <td>{{ request.leaveType }}</td>
            <td>{{ request.startDate }}</td>
            <td>{{ request.endDate }}</td>
            <td><span class="status" :class="request.status">{{ request.status }}</span></td>
          </tr>
        </tbody>
      </table>

      <p v-if="leaveStore.leaveRequests.length === 0 && !errorMessage" class="note">
        No leave requests found yet.
      </p>

      <p class="note">
        To approve or reject leave requests, click Manage Requests.
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaveStore } from '../stores/leaveStore'
import StatCard from '../components/StatCard.vue'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const leaveStore = useLeaveStore()
const errorMessage = ref('')

onMounted(async () => {
  try {
    await leaveStore.loadAdminData()
    if (leaveStore.errorMessage) errorMessage.value = leaveStore.errorMessage
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load admin dashboard data.'
  }
})
</script>
