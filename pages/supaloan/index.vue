<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLoans } from '~/composables/useLoans'

const { loans, loading, error, loadLoans, searchLoans, advancedSearchLoans, getLoanTypes, getBranches } = useLoans()

// Reactive data
const searchTerm = ref('')
const selectedLoanType = ref('')
const selectedBranch = ref('')
const selectedStatus = ref('')
const connectionStatus = ref(null)
const loanTypes = ref([])
const branches = ref([])
const searchLoading = ref(false)
const searchTimeout = ref(null)

// Computed properties
const totalLoanAmount = computed(() => {
  return loans.value.reduce((sum, loan) => sum + (loan['Loan Amount'] || 0), 0)
})

const totalOverdueAmount = computed(() => {
  return loans.value.reduce((sum, loan) => sum + (loan['Total Overdue Amount'] || 0), 0)
})

const uniqueBorrowers = computed(() => {
  return new Set(loans.value.map(loan => loan.BorrowerName)).size
})

const hasActiveFilters = computed(() => {
  return searchTerm.value || selectedLoanType.value || selectedBranch.value || selectedStatus.value
})

// Methods
const getStatusClass = (loan) => {
  if (loan['Total Overdue Amount'] > 0) return 'bg-red-100 text-red-800'
  if (loan['Closing Balance'] < 0) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getStatusText = (loan) => {
  if (loan['Total Overdue Amount'] > 0) return 'Overdue'
  if (loan['Closing Balance'] < 0) return 'Active'
  return 'Closed'
}

const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('en-IN').format(amount)
}

const loadDataWithFallback = async () => {
  try {
    const result = await loadLoans()
    
    if (result.success) {
      if (result.source === 'supabase') {
        connectionStatus.value = 'success'
        // Load filter options after successful connection
        await loadFilterOptions()
      } else if (result.source === 'empty') {
        connectionStatus.value = 'warning'
      } else {
        connectionStatus.value = 'error'
      }
    } else {
      connectionStatus.value = 'error'
    }
  } catch (err) {
    console.log('Connection error')
    connectionStatus.value = 'error'
  }
}

const loadFilterOptions = async () => {
  try {
    // Load loan types
    const typesResult = await getLoanTypes()
    if (typesResult.success) {
      loanTypes.value = typesResult.data
    }

    // Load branches
    const branchesResult = await getBranches()
    if (branchesResult.success) {
      branches.value = branchesResult.data
    }
  } catch (err) {
    console.error('Error loading filter options:', err)
  }
}

const performSearch = async () => {
  // Clear any existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Set a new timeout for debouncing
  searchTimeout.value = setTimeout(async () => {
    searchLoading.value = true
    
    try {
      const filters = {
        loanType: selectedLoanType.value || null,
        branch: selectedBranch.value || null,
        status: selectedStatus.value || null
      }

      // Use advanced search for better full-text search capabilities
      await advancedSearchLoans(searchTerm.value, filters)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      searchLoading.value = false
    }
  }, 500) // 500ms debounce
}

const refreshData = async () => {
  await loadDataWithFallback()
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedLoanType.value = ''
  selectedBranch.value = ''
  selectedStatus.value = ''
}

// Watch for filter changes and perform search
watch([searchTerm, selectedLoanType, selectedBranch, selectedStatus], () => {
  if (connectionStatus.value === 'success') {
    performSearch()
  }
})

// Load data on mount
onMounted(async () => {
  await loadDataWithFallback()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Supaloan Dashboard</h1>
            <p class="text-gray-600 mt-1">Manage and view loan data from Supabase</p>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="refreshData"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Loading...' : 'Refresh Data' }}
            </button>
            <div v-if="searchLoading" class="flex items-center text-sm text-gray-600">
              <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="connectionStatus" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div :class="connectionStatus === 'error' ? 'bg-red-50 border border-red-200' : connectionStatus === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'" class="rounded-md p-3">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg v-if="connectionStatus === 'error'" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="connectionStatus === 'warning'" class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clip-rule="evenodd" />
              </svg>
            </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium" :class="connectionStatus === 'error' ? 'text-red-800' : connectionStatus === 'warning' ? 'text-yellow-800' : 'text-green-800'">
              {{ connectionStatus === 'error' ? 'Supabase Connection Error' : connectionStatus === 'warning' ? 'Using Sample Data' : 'Connected to Supabase' }}
            </h3>
            <div class="mt-1 text-sm" :class="connectionStatus === 'error' ? 'text-red-700' : connectionStatus === 'warning' ? 'text-yellow-700' : 'text-green-700'">
              {{ connectionStatus === 'error' ? 'Unable to connect to Supabase.' : connectionStatus === 'warning' ? 'No data found in Supabase.' : 'Successfully loaded data from Supabase.' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search by name or account number..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Loan Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Loan Type</label>
            <select
              v-model="selectedLoanType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option v-for="type in loanTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <!-- Branch Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Branch</label>
            <select
              v-model="selectedBranch"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Branches</option>
              <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        
        <!-- Clear Filters Button -->
        <div class="mt-4 flex justify-end">
          <button
            @click="clearFilters"
            :disabled="!hasActiveFilters"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Loans</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ loans.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                  <dd class="text-lg font-medium text-gray-900">₹{{ formatCurrency(totalLoanAmount) }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Overdue Amount</dt>
                  <dd class="text-lg font-medium text-red-600">₹{{ formatCurrency(totalOverdueAmount) }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Unique Borrowers</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ uniqueBorrowers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading data</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- Loans Table -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Loan Details</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Showing {{ loans.length }} loans</p>
        </div>
        
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading loans...</span>
        </div>

        <div v-else-if="loans.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No loans found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li v-for="loan in loans" :key="loan.AccountNO" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">{{ loan.BorrowerName?.charAt(0) || 'N' }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ loan.BorrowerName }}</div>
                  <div class="text-sm text-gray-500">Account: {{ loan.AccountNO }}</div>
                  <NuxtLink 
                    :to="`/supaloan/${loan.AccountNO}`"
                    class="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                  >
                    View Details →
                  </NuxtLink>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">₹{{ formatCurrency(loan['Loan Amount']) }}</div>
                  <div class="text-sm text-gray-500">{{ loan.LoanType }}</div>
                </div>
                <div class="flex items-center">
                  <span :class="getStatusClass(loan)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ getStatusText(loan) }}
                  </span>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-900">₹{{ formatCurrency(loan['Closing Balance']) }}</div>
                  <div class="text-sm text-gray-500">{{ loan.BranchName }}</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


