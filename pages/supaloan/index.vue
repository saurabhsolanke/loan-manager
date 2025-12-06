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
const showMobileFilters = ref(false)

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
  if (loan['Closing Balance'] < 0) return 'bg-blue-100 text-blue-800'
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Loan Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-1">Manage and view loan data from Supabase</p>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="refreshData" :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors">
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ loading ? 'Loading...' : 'Refresh Data' }}
            </button>
            <div v-if="searchLoading" class="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Searching...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200">
        <!-- Mobile Filter Toggle -->
        <div class="md:hidden mb-4">
          <button @click="showMobileFilters = !showMobileFilters"
            class="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors">
            <span>Filters & Search</span>
            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" :class="{ 'rotate-180': showMobileFilters }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>

        <!-- Desktop Filters -->
        <div class="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input v-model="searchTerm" type="text" placeholder="Search by name or account number..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-gray-500 focus:border-gray-500" />
          </div>

          <!-- Loan Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loan Type</label>
            <select v-model="selectedLoanType"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500">
              <option value="">All Types</option>
              <option v-for="type in loanTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <!-- Branch Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
            <select v-model="selectedBranch"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500">
              <option value="">All Branches</option>
              <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <!-- Mobile Filters (Collapsible) -->
        <div v-if="showMobileFilters" class="md:hidden space-y-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input v-model="searchTerm" type="text" placeholder="Search by name or account number..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-gray-500 focus:border-gray-500" />
          </div>

          <!-- Loan Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loan Type</label>
            <select v-model="selectedLoanType"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500">
              <option value="">All Types</option>
              <option v-for="type in loanTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <!-- Branch Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
            <select v-model="selectedBranch"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500">
              <option value="">All Branches</option>
              <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <div class="mt-4 flex justify-end">
          <button @click="clearFilters" :disabled="!hasActiveFilters"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
                  <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Loans</dt>
                  <dd class="text-2xl font-bold text-gray-900 dark:text-white">{{ loans.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
                  <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Amount</dt>
                  <dd class="text-2xl font-bold text-gray-900 dark:text-white">₹{{ formatCurrency(totalLoanAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-md flex items-center justify-center">
                  <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Overdue Amount</dt>
                  <dd class="text-2xl font-bold text-red-600 dark:text-red-400">₹{{ formatCurrency(totalOverdueAmount)
                    }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-md flex items-center justify-center">
                  <svg class="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Borrowers</dt>
                  <dd class="text-2xl font-bold text-gray-900 dark:text-white">{{ uniqueBorrowers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error"
        class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-6 transition-colors duration-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-gray-800 dark:text-gray-200">Error loading data</h3>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- Loans Table -->
      <div
        class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Loan Details</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Showing {{ loans.length }} loans</p>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-300">Loading loans...</span>
        </div>

        <div v-else-if="loans.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No loans found</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
        </div>

        <!-- Desktop Table -->
        <div class="hidden md:block">
          <ul class="divide-y divide-gray-200 dark:divide-gray-700">
            <li v-for="loan in loans" :key="loan.AccountNO"
              class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ loan.BorrowerName?.charAt(0)
                        || 'N' }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ loan.BorrowerName }}2</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Account: {{ loan.AccountNO }}</div>
                    <NuxtLink :to="`/supaloan/${loan.AccountNO}`"
                      class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mt-1 inline-block transition-colors">
                      View Details →
                    </NuxtLink>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">₹{{
                      formatCurrency(loan['Loan Amount']) }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ loan.LoanType }}</div>
                  </div>
                  <div class="flex items-center">
                    <span :class="getStatusClass(loan)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ getStatusText(loan) }}
                    </span>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-900 dark:text-white">₹{{ formatCurrency(loan['Closing Balance']) }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ loan.BranchName }}</div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden">
          <div class="space-y-3">
            <div v-for="loan in loans" :key="loan.AccountNO"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12">
                    <div class="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ loan.BorrowerName?.charAt(0)
                        || 'N' }}</span>
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ loan.BorrowerName }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Account: {{ loan.AccountNO }}</div>
                  </div>
                </div>
                <span :class="getStatusClass(loan)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ getStatusText(loan) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Loan Amount</div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">₹{{
                    formatCurrency(loan['LoanAmount']) }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ₹{{ formatCurrency(Math.abs(loan['Closing Balance'])) }}
                  </div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Loan Type</div>
                  <div class="text-sm text-gray-900 dark:text-white">{{ loan.LoanType }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Branch</div>
                  <div class="text-sm text-gray-900 dark:text-white">{{ loan.BranchName }}</div>
                </div>
              </div>

              <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <div class="text-xs text-red-600 dark:text-red-400">
                  Overdue: ₹{{ formatCurrency(loan['Total Overdue Amount']) }}
                </div>
                <NuxtLink :to="`/supaloan/${loan.AccountNO}`"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors">
                  View Details
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
