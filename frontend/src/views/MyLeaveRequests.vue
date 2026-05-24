<template>
  <div class="page">
    <div class="container panel">
      <PageHeader title="My Leave Requests" />

      <div class="toolbar">
        <input v-model="search" placeholder="Search leave type or reason..." />

        <select v-model="statusFilter">
          <option>All Status</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      <form v-if="editingId" class="card" @submit.prevent="saveEditedRequest">
        <h3>Edit Pending Request</h3>

        <div class="grid-2">
          <div class="form-group">
            <label>Leave Type</label>
            <select v-model="editForm.leaveType" required>
              <option
                v-for="leaveType in leaveStore.leaveTypes"
                :key="leaveType.id"
                :value="leaveType.name"
              >
                {{ leaveType.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>No. of Days</label>
            <input :value="editComputedDays" readonly />
          </div>

          <div class="form-group">
            <label>Start Date</label>
            <input
              v-model="editForm.startDate"
              type="date"
              :min="today"
              required
            />
          </div>

          <div class="form-group">
            <label>End Date</label>
            <input
              v-model="editForm.endDate"
              type="date"
              :min="editForm.startDate || today"
              required
            />
          </div>
        </div>

        <p v-if="errorMessage" class="note warning-text">
          {{ errorMessage }}
        </p>

        <div class="form-group">
          <label>Reason</label>
          <textarea v-model="editForm.reason" required />
        </div>

        <div class="action-row">
          <button class="btn" type="submit">Update Request</button>
          <button class="btn secondary" type="button" @click="cancelEdit">Cancel Edit</button>
        </div>
      </form>

      <table>
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>No. of Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="request in filteredRequests" :key="request.id">
            <td>{{ request.leaveType }}</td>
            <td>{{ request.startDate }}</td>
            <td>{{ request.endDate }}</td>
            <td>{{ request.days }}</td>
            <td>{{ request.reason }}</td>
            <td>
              <span class="status" :class="request.status">
                {{ request.status }}
              </span>
            </td>
            <td>
              <div class="table-actions">
                <button
                  class="btn secondary"
                  :disabled="request.status !== 'Pending'"
                  @click="editRequest(request)"
                >
                  Edit
                </button>

                <button
                  class="btn danger"
                  :disabled="request.status !== 'Pending'"
                  @click="leaveStore.deleteLeaveRequest(request.id)"
                >
                  Cancel
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="action-row">
        <button class="btn secondary" @click="router.push('/employee-dashboard')">
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaveStore } from '../stores/leaveStore'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const leaveStore = useLeaveStore()

onMounted(() => {
  leaveStore.loadEmployeeData()
})

const today = new Date().toISOString().split('T')[0]

const search = ref('')
const statusFilter = ref('All Status')
const editingId = ref(null)
const errorMessage = ref('')

const editForm = reactive({
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: ''
})

const employeeRequests = computed(() => leaveStore.myLeaveRequests)

const filteredRequests = computed(() => {
  return employeeRequests.value.filter(request => {
    const keyword = search.value.toLowerCase()

    const matchesSearch =
      request.leaveType.toLowerCase().includes(keyword) ||
      request.reason.toLowerCase().includes(keyword)

    const matchesStatus =
      statusFilter.value === 'All Status' || request.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const editComputedDays = computed(() => {
  if (!editForm.startDate || !editForm.endDate) {
    return 0
  }

  const start = new Date(editForm.startDate)
  const end = new Date(editForm.endDate)
  const difference = end - start

  if (difference < 0) {
    return 0
  }

  return difference / (1000 * 60 * 60 * 24) + 1
})

const isPastDate = dateValue => {
  return dateValue < today
}

const editRequest = request => {
  if (request.status !== 'Pending') {
    return
  }

  editingId.value = request.id
  errorMessage.value = ''
  editForm.leaveType = request.leaveType
  editForm.startDate = request.startDate
  editForm.endDate = request.endDate
  editForm.reason = request.reason
}

const saveEditedRequest = async () => {
  errorMessage.value = ''

  if (isPastDate(editForm.startDate)) {
    errorMessage.value = 'You cannot update a leave request using a past start date.'
    return
  }

  if (isPastDate(editForm.endDate)) {
    errorMessage.value = 'You cannot update a leave request using a past end date.'
    return
  }

  if (editComputedDays.value <= 0) {
    errorMessage.value = 'End date must be the same as or later than the start date.'
    return
  }

  await leaveStore.updateLeaveRequest(editingId.value, {
    leaveType: editForm.leaveType,
    startDate: editForm.startDate,
    endDate: editForm.endDate,
    days: editComputedDays.value,
    reason: editForm.reason
  })

  cancelEdit()
}

const cancelEdit = () => {
  editingId.value = null
  errorMessage.value = ''
  editForm.leaveType = ''
  editForm.startDate = ''
  editForm.endDate = ''
  editForm.reason = ''
}
</script>
