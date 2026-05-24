<template>
  <div class="page">
    <div class="container panel">
      <PageHeader title="Manage Departments" />

      <form class="toolbar" @submit.prevent="saveDepartment">
        <input v-model="departmentName" placeholder="Department name" required />

        <button class="btn" type="submit">
          {{ editingId ? 'Update Department' : 'Add Department' }}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="department in leaveStore.departments" :key="department.id">
            <td>{{ department.name }}</td>
            <td>
              <div class="table-actions">
                <button class="btn secondary" @click="editDepartment(department)">
                  Edit
                </button>

                <button class="btn danger" @click="leaveStore.deleteDepartment(department.id)">
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
  leaveStore.loadDepartments()
})

const editingId = ref(null)
const departmentName = ref('')

const saveDepartment = async () => {
  if (!departmentName.value) {
    return
  }

  if (editingId.value) {
    await leaveStore.updateDepartment(editingId.value, departmentName.value)
  } else {
    await leaveStore.addDepartment(departmentName.value)
  }

  editingId.value = null
  departmentName.value = ''
}

const editDepartment = department => {
  editingId.value = department.id
  departmentName.value = department.name
}
</script>
