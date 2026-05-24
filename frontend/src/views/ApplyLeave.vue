<template>
  <div class="page">
    <div class="container panel">
      <PageHeader title="Apply Leave" />

      <form @submit.prevent="submitLeave">
        <div class="grid-2">
          <div class="form-group">
            <label>Leave Type</label>
            <select v-model="form.leaveType" required>
              <option disabled value="">Select Type</option>
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
            <input :value="computedDays" readonly />
          </div>

          <div class="form-group">
            <label>Start Date</label>
            <input
              v-model="form.startDate"
              type="date"
              :min="today"
              required
            />
          </div>

          <div class="form-group">
            <label>End Date</label>
            <input
              v-model="form.endDate"
              type="date"
              :min="form.startDate || today"
              required
            />
          </div>
        </div>

        <p v-if="errorMessage" class="note warning-text">
          {{ errorMessage }}
        </p>

        <div class="form-group">
          <label>Reason</label>
          <textarea
            v-model="form.reason"
            placeholder="Enter your reason..."
            required
          />
        </div>

        <div class="form-group">
          <label>Attachment / Supporting Document</label>
          <input type="file" />
          <p class="note">Medical certificate may be required for sick leave.</p>
        </div>

        <div class="action-row">
          <button class="btn" type="submit">
            Submit Request
          </button>

          <button
            class="btn secondary"
            type="button"
            @click="router.push('/employee-dashboard')"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaveStore } from '../stores/leaveStore'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const leaveStore = useLeaveStore()

const errorMessage = ref('')
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: ''
})

onMounted(() => {
  leaveStore.loadEmployeeData()
})

const computedDays = computed(() => {
  if (!form.startDate || !form.endDate) return 'Auto-computed'
  const diff = new Date(form.endDate) - new Date(form.startDate)
  if (diff < 0) return 0
  return diff / (1000 * 60 * 60 * 24) + 1
})

const isPastDate = dateValue => dateValue < today

// Returns true if [a_start, a_end] overlaps with [b_start, b_end]
const datesOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart <= bEnd && aEnd >= bStart

const submitLeave = async () => {
  errorMessage.value = ''

  if (!form.leaveType) {
    errorMessage.value = 'Please select a leave type.'
    return
  }

  if (isPastDate(form.startDate)) {
    errorMessage.value = 'You cannot file a leave using a past start date.'
    return
  }

  if (isPastDate(form.endDate)) {
    errorMessage.value = 'You cannot file a leave using a past end date.'
    return
  }

  if (computedDays.value <= 0 || computedDays.value === 'Auto-computed') {
    errorMessage.value = 'End date must be the same as or later than the start date.'
    return
  }

  if ((leaveStore.employeeProfile?.leaveBalance || 0) < computedDays.value) {
    errorMessage.value = 'Insufficient leave balance for the requested number of days.'
    return
  }

  // ── Frontend Check 1: Overlapping active/pending leave ──
  const existingRequests = leaveStore.myLeaveRequests || []

  const hasOverlap = existingRequests.some(req =>
    ['Pending', 'Approved'].includes(req.status) &&
    datesOverlap(form.startDate, form.endDate, req.startDate, req.endDate)
  )

  if (hasOverlap) {
    errorMessage.value = 'You already have an active or pending leave that overlaps with the selected dates.'
    return
  }

  // ── Frontend Check 2: Exact duplicate ──
  const isDuplicate = existingRequests.some(req =>
    req.leaveType === form.leaveType &&
    req.startDate === form.startDate &&
    req.endDate === form.endDate
  )

  if (isDuplicate) {
    errorMessage.value = 'You have already submitted the exact same leave request.'
    return
  }

  // ── Frontend Check 3: Allow only one request at a time ──
const hasExistingRequest = existingRequests.some(req =>
  ['Pending', 'Approved'].includes(req.status)
)

if (hasExistingRequest) {
  errorMessage.value =
    'You already have an existing leave request. Please wait until it is completed or rejected before submitting another leave.'
  return
}

  try {
    await leaveStore.addLeaveRequest({
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason
    })

    router.push('/employee-dashboard')
  } catch (error) {
    errorMessage.value = error.message || 'Unable to submit leave request.'
  }
}
</script>
