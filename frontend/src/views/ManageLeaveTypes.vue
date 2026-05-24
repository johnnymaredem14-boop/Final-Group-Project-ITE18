<template>
  <div class="page">
    <div class="container panel">
      <PageHeader title="Manage Leave Types" />

      <form class="toolbar" @submit.prevent="saveLeaveType">
        <input v-model="leaveTypeName" placeholder="Leave type name" required />

        <button class="btn" type="submit">
          {{ editingId ? 'Update Leave Type' : 'Add Leave Type' }}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="leaveType in leaveStore.leaveTypes" :key="leaveType.id">
            <td>{{ leaveType.name }}</td>
            <td>
              <div class="table-actions">
                <button class="btn secondary" @click="editLeaveType(leaveType)">
                  Edit
                </button>

                <button class="btn danger" @click="leaveStore.deleteLeaveType(leaveType.id)">
                  Delete
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaveStore } from '../stores/leaveStore'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const leaveStore = useLeaveStore()

onMounted(() => {
  leaveStore.loadLeaveTypes()
})

const editingId = ref(null)
const leaveTypeName = ref('')

const saveLeaveType = async () => {
  if (!leaveTypeName.value) {
    return
  }

  if (editingId.value) {
    await leaveStore.updateLeaveType(editingId.value, leaveTypeName.value)
  } else {
    await leaveStore.addLeaveType(leaveTypeName.value)
  }

  editingId.value = null
  leaveTypeName.value = ''
}

const editLeaveType = leaveType => {
  editingId.value = leaveType.id
  leaveTypeName.value = leaveType.name
}
</script>
