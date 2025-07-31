<script setup>
import { ref, onMounted } from 'vue'
import { useLoans } from '~/composables/useLoans'

const route = useRoute()
const { getLoanById } = useLoans()

const loan = ref(null)
const loading = ref(false)
const error = ref(null)

const loadLoan = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await getLoanById(route.params.id)
    
    if (result.success) {
      loan.value = result.data
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const refreshLoan = async () => {
  await loadLoan()
}

const getStatusClass = (loan) => {
  if (loan['Total Overdue Amount'] > 0) return 'bg-red-50 border border-red-200'
  if (loan['Closing Balance'] < 0) return 'bg-yellow-50 border border-yellow-200'
  return 'bg-green-50 border border-green-200'
}

const getStatusText = (loan) => {
  if (loan['Total Overdue Amount'] > 0) return 'Overdue'
  if (loan['Closing Balance'] < 0) return 'Active'
  return 'Closed'
}

const getStatusDescription = (loan) => {
  if (loan['Total Overdue Amount'] > 0) {
    return `Overdue amount: ₹${formatCurrency(loan['Total Overdue Amount'])}`
  }
  if (loan['Closing Balance'] < 0) {
    return `Outstanding balance: ₹${formatCurrency(Math.abs(loan['Closing Balance']))}`
  }
  return 'Loan has been fully repaid'
}

const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('en-IN').format(amount)
}

onMounted(() => {
  loadLoan()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/supaloan" 
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Loans
            </NuxtLink>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Loan Details</h1>
              <p class="text-gray-600 mt-1">Account: {{ route.params.id }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="refreshLoan"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading loan details...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-md p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading loan details</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loan Details -->
    <div v-else-if="loan" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Status Banner -->
      <div class="mb-6">
        <div :class="getStatusClass(loan)" class="rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg v-if="getStatusText(loan) === 'Overdue'" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="getStatusText(loan) === 'Active'" class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium" :class="getStatusClass(loan).replace('bg-', 'text-')">
                {{ getStatusText(loan) }} - {{ loan.BranchName }}
              </h3>
              <div class="mt-1 text-sm" :class="getStatusClass(loan).replace('bg-', 'text-').replace('100', '700')">
                {{ getStatusDescription(loan) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Borrower Information -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Borrower Information</h3>
              <div class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Borrower Name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ loan.BorrowerName }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Account Number</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ loan.AccountNO }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Mobile Number</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ loan['Mobile No'] || 'Not provided' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Address</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ loan.BorrowerAdd }}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loan Details -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Loan Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Basic Loan Info -->
                <div class="space-y-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Loan Type</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ loan.LoanType }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Loan Amount</dt>
                    <dd class="mt-1 text-lg font-semibold text-gray-900">₹{{ formatCurrency(loan['Loan Amount']) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Closing Balance</dt>
                    <dd class="mt-1 text-lg font-semibold" :class="loan['Closing Balance'] < 0 ? 'text-red-600' : 'text-green-600'">
                      ₹{{ formatCurrency(Math.abs(loan['Closing Balance'])) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Interest Rate</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ loan.InterestRate }}%</dd>
                  </div>
                </div>

                <!-- Financial Details -->
                <div class="space-y-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Total Overdue Amount</dt>
                    <dd class="mt-1 text-lg font-semibold text-red-600">₹{{ formatCurrency(loan['Total Overdue Amount']) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Total Recovery Amount</dt>
                    <dd class="mt-1 text-sm text-gray-900">₹{{ formatCurrency(loan['Total Recovery Amount'] || 0) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Installment Amount</dt>
                    <dd class="mt-1 text-sm text-gray-900">₹{{ formatCurrency(loan['Installment Amount']) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Period (Months)</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ loan.PERIOD }}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline and Dates -->
      <div class="mt-6">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Loan Timeline</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <dt class="text-sm font-medium text-gray-500">Open Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ loan['Open Date'] }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">First Installment Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ loan['First Installment Date'] }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">End Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ loan['End Date'] }}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="mt-6">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Additional Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt class="text-sm font-medium text-gray-500">Branch Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ loan.BranchName }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">NPA Status</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ loan['NPA Status'] || 'Not specified' }}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Loan not found</h3>
        <p class="mt-1 text-sm text-gray-500">The loan with account number {{ route.params.id }} could not be found.</p>
        <div class="mt-6">
          <NuxtLink 
            to="/supaloan" 
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Loans
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>