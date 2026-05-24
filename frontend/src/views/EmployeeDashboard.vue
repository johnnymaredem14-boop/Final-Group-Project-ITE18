<template>
  <div class="page">
    <div class="container panel">
      <PageHeader title="Employee Dashboard" />

      <h2>Welcome, {{ authStore.currentUser?.name || 'Employee Name' }}</h2>

      <div class="grid-4">
        <StatCard title="Leave Balance" :value="`${leaveBalance} Days`" />
        <StatCard title="Pending Requests" :value="pendingCount" />
        <StatCard title="Approved Requests" :value="approvedCount" />
        <StatCard title="Rejected Requests" :value="rejectedCount" />
      </div>

      <div class="action-row">
        <button class="btn" @click="router.push('/apply-leave')">
          Apply Leave
        </button>

        <button class="btn secondary" @click="router.push('/my-leave-requests')">
          My Leave Requests
        </button>
      </div>

      <h2>Recent Leave Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>No. of Days</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="request in employeeRequests" :key="request.id">
            <td>{{ request.leaveType }}</td>
            <td>{{ request.startDate }}</td>
            <td>{{ request.endDate }}</td>
            <td>{{ request.days }}</td>
            <td>
              <span class="status" :class="request.status">
                {{ request.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useLeaveStore } from '../stores/leaveStore'
import StatCard from '../components/StatCard.vue'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const authStore = useAuthStore()
const leaveStore = useLeaveStore()

onMounted(() => {
  leaveStore.loadEmployeeData()
})

const employeeRequests = computed(() => leaveStore.myLeaveRequests)

const leaveBalance = computed(() => Number(leaveStore.employeeProfile?.leaveBalance ?? 0))

const pendingCount = computed(() =>
  employeeRequests.value.filter(request => request.status === 'Pending').length
)

const approvedCount = computed(() =>
  employeeRequests.value.filter(request => request.status === 'Approved').length
)

const rejectedCount = computed(() =>
  employeeRequests.value.filter(request => request.status === 'Rejected').length
)
</script>
