<template>
  <div class="page">
    <div class="container panel">
      <PageHeader title="Manage Employees" />

      <form class="grid-4" @submit.prevent="saveEmployee">
        <input v-model="form.name" placeholder="Employee name" required />
        <input v-model="form.email" type="email" placeholder="Email address" required />
        <input
          v-model="form.password"
          type="password"
          :placeholder="editingId ? 'New password (leave blank to keep)' : 'Account password'"
          :required="!editingId"
        />

        <select v-model="form.department" required>
          <option disabled value="">Select Department</option>
          <option
            v-for="department in leaveStore.departments"
            :key="department.id"
            :value="department.name"
          >
            {{ department.name }}
          </option>
        </select>

        <input
          v-model.number="form.leaveBalance"
          type="number"
          placeholder="Leave balance e.g., 15"
          required
        />

        <button class="btn" type="submit">
          {{ editingId ? 'Update Employee' : 'Add Employee' }}
        </button>

        <button v-if="editingId" class="btn secondary" type="button" @click="resetForm">
          Cancel
        </button>
      </form>

      <p v-if="errorMessage" class="note warning-text">{{ errorMessage }}</p>
      <p v-if="successMessage" class="note success-text">{{ successMessage }}</p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Leave Balance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in leaveStore.employees" :key="employee.id">
            <td>{{ employee.name }}</td>
            <td>{{ employee.email }}</td>
            <td>{{ employee.department }}</td>
            <td>{{ employee.leaveBalance }}</td>
            <td>
              <div class="table-actions">
                <button class="btn secondary" @click="editEmployee(employee)">Edit</button>
                <button class="btn danger" @click="removeEmployee(employee)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="action-row">
        <button class="btn secondary" @click="router.push('/admin-dashboard')">Back</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaveStore } from '../stores/leaveStore'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const leaveStore = useLeaveStore()

onMounted(() => {
  leaveStore.loadDepartments()
  leaveStore.loadEmployees()
})

const editingId = ref(null)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  department: '',
  leaveBalance: 0
})

const resetForm = () => {
  editingId.value = null
  errorMessage.value = ''
  successMessage.value = ''
  form.name = ''
  form.email = ''
  form.password = ''
  form.department = ''
  form.leaveBalance = 0
}

const saveEmployee = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (editingId.value) {
      // If password left blank during edit, send a flag so backend keeps existing
      const payload = { ...form }
      if (!payload.password) delete payload.password
      await leaveStore.updateEmployee(editingId.value, payload)
      successMessage.value = 'Employee updated successfully.'
    } else {
      await leaveStore.addEmployee({ ...form })
      successMessage.value = 'Employee added successfully.'
    }
    resetForm()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to save employee.'
  }
}

const editEmployee = employee => {
  editingId.value = employee.id
  errorMessage.value = ''
  successMessage.value = ''
  form.name = employee.name
  form.email = employee.email
  form.password = ''   // never pre-fill password
  form.department = employee.department
  form.leaveBalance = employee.leaveBalance
}

const removeEmployee = async employee => {
  if (!confirm(`Delete ${employee.name}? This cannot be undone.`)) return
  try {
    await leaveStore.deleteEmployee(employee.id)
    successMessage.value = 'Employee deleted successfully.'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to delete employee.'
  }
}
</script>
