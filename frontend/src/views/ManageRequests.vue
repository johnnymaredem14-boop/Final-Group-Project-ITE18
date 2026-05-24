<template>
  <div class="page">
    <div class="container panel">
      <PageHeader title="Manage Requests" />

      <div class="toolbar">
        <input v-model="search" placeholder="Search employee, department, or leave type..." />

        <select v-model="statusFilter">
          <option>All Status</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>No. of Days</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="request in filteredRequests" :key="request.id">
            <td>{{ request.employee }}</td>
            <td>{{ request.department }}</td>
            <td>{{ request.leaveType }}</td>
            <td>{{ request.startDate }}</td>
            <td>{{ request.endDate }}</td>
            <td>{{ request.days }}</td>
            <td>
              <span class="status" :class="request.status">
                {{ request.status }}
              </span>
            </td>
            <td>
              <div class="table-actions">
                <button
                  class="btn success"
                  :disabled="request.status !== 'Pending'"
                  @click="leaveStore.approveRequest(request.id)"
                >
                  Approve
                </button>

                <button
                  class="btn danger"
                  :disabled="request.status !== 'Pending'"
                  @click="leaveStore.rejectRequest(request.id)"
                >
                  Reject
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      

      <div class="action-row">
        <button class="btn secondary" @click="router.push('/admin-dashboard')">
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaveStore } from '../stores/leaveStore'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const leaveStore = useLeaveStore()

onMounted(() => {
  leaveStore.loadLeaveRequests()
})

const search = ref('')
const statusFilter = ref('All Status')

const filteredRequests = computed(() => {
  return leaveStore.leaveRequests.filter(request => {
    const keyword = search.value.toLowerCase()

    const matchesSearch =
      request.employee.toLowerCase().includes(keyword) ||
      request.department.toLowerCase().includes(keyword) ||
      request.leaveType.toLowerCase().includes(keyword)

    const matchesStatus =
      statusFilter.value === 'All Status' || request.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})
</script>
