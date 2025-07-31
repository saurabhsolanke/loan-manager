<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLoans } from '~/composables/useLoans'
import ExcelUploader from '~/components/ExcelUploader.vue'
import MobileNav from '~/components/MobileNav.vue'

definePageMeta({
  middleware: 'auth'
})

const { loans, loading: loansLoading, error: loansError, loadLoans, saveLoans } = useLoans()
const searchTerm = ref('')
const selectedLoanType = ref('')
const selectedBranch = ref('')
const selectedStatus = ref('')
const username = ref('')



// Computed properties
const filteredLoans = computed(() => {
  return loans.value.filter(loan => {
    const matchesSearch = !searchTerm.value || 
      loan.BorrowerName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      loan.AccountNO.includes(searchTerm.value)
    
    const matchesLoanType = !selectedLoanType.value || loan.LoanType === selectedLoanType.value
    const matchesBranch = !selectedBranch.value || loan.BranchName === selectedBranch.value
    const matchesStatus = !selectedStatus.value || getStatusText(loan).toLowerCase() === selectedStatus.value
    
    return matchesSearch && matchesLoanType && matchesBranch && matchesStatus
  })
})

const totalLoanAmount = computed(() => {
  return loans.value.reduce((sum, loan) => sum + (loan.LoanAmount || 0), 0)
})

const totalOverdueAmount = computed(() => {
  return loans.value.reduce((sum, loan) => sum + loan.TotalOverdueAmount, 0)
})

const uniqueBorrowers = computed(() => {
  return new Set(loans.value.map(loan => loan.BorrowerName)).size
})

const loanTypes = computed(() => {
  return [...new Set(loans.value.map(loan => loan.LoanType))]
})

const branches = computed(() => {
  return [...new Set(loans.value.map(loan => loan.BranchName))]
})

// Methods
const getLoanTypeClass = (loanType) => {
  const classes = {
    'GOLD LOAN': 'bg-yellow-100 text-yellow-800',
    'HOME LOAN': 'bg-blue-100 text-blue-800',
    'Sthavar Taran': 'bg-green-100 text-green-800'
  }
  return classes[loanType] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (loan) => {
  if (loan.TotalOverdueAmount > 0) return 'bg-red-100 text-red-800'
  if (loan.ClosingBalance < 0) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getStatusText = (loan) => {
  if (loan.TotalOverdueAmount > 0) return 'Overdue'
  if (loan.ClosingBalance < 0) return 'Active'
  return 'Closed'
}

const viewLoanDetails = (loan) => {
  // Navigate to loan details page
  navigateTo(`/loan/${loan.AccountNO}`)
}

const editLoan = (loan) => {
  // Navigate to edit loan page
  navigateTo(`/loan/${loan.AccountNO}/edit`)
}

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  navigateTo('/login')
}

const handleExcelData = async (newData) => {
  try {
    // Save to Supabase
    await saveLoans(newData)
    console.log('Excel data saved to Supabase:', newData.length, 'records')
  } catch (error) {
    console.error('Error saving Excel data:', error)
    // Fallback to localStorage if Supabase fails
    localStorage.setItem('loanData', JSON.stringify(newData))
    loans.value = newData
  }
}

// Load data on mount
onMounted(async () => {
  username.value = localStorage.getItem('username') || 'User'
  
  // Load loans from Supabase
  await loadLoans()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Loan Management System</h1>
          </div>
          <div class="flex items-center space-x-2 sm:space-x-4">
            <span class="text-xs sm:text-sm text-gray-600 hidden sm:block">Welcome, {{ username }}</span>
            <button
              @click="handleLogout"
              class="hidden sm:inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <!-- Excel Uploader -->
      <ExcelUploader ref="excelUploader" @data-loaded="handleExcelData" />
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-2 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Loans</dt>
                  <dd class="text-sm sm:text-lg font-medium text-gray-900">{{ loans.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-2 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                  <dd class="text-xs sm:text-lg font-medium text-gray-900">₹{{ totalLoanAmount.toLocaleString() }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-2 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Overdue</dt>
                  <dd class="text-xs sm:text-lg font-medium text-gray-900">₹{{ totalOverdueAmount.toLocaleString() }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-2 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Borrowers</dt>
                  <dd class="text-sm sm:text-lg font-medium text-gray-900">{{ uniqueBorrowers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-3 sm:px-4 py-4 sm:py-5 sm:p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Search</label>
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Search loans..."
                class="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Loan Type</label>
              <select
                v-model="selectedLoanType"
                class="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option v-for="type in loanTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Branch</label>
              <select
                v-model="selectedBranch"
                class="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Status</label>
              <select
                v-model="selectedStatus"
                class="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Loan Cards -->
      <div class="block sm:hidden">
        <!-- Loading State -->
        <div v-if="loansLoading" class="bg-white shadow rounded-lg p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h3 class="mt-4 text-sm font-medium text-gray-900">Loading loan data...</h3>
        </div>
        
        <!-- Error State -->
        <div v-else-if="loansError" class="bg-white shadow rounded-lg p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Supabase Connection Error</h3>
          <p class="mt-1 text-sm text-gray-500">{{ loansError }}</p>
          <div class="mt-4 text-xs text-gray-600">
            <p class="mb-2">The app will continue to work with localStorage as fallback</p>
          </div>
          <div class="mt-6">
            <button
              @click="loadLoans"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        
        
        <!-- Empty State -->
        <div v-else-if="loans.length === 0" class="bg-white shadow rounded-lg p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No loan data available</h3>
          <p class="mt-1 text-sm text-gray-500">Upload an Excel or CSV file to get started.</p>
          <div class="mt-6">
            <button
              @click="$refs.excelUploader.showUploadModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              Upload Excel File
            </button>
          </div>
        </div>
        
        <!-- Loan Cards -->
        <div v-else class="space-y-3">
          <div v-for="loan in filteredLoans" :key="loan.AccountNO" class="bg-white shadow rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span class="text-sm font-medium text-blue-800">{{ loan.BorrowerName.charAt(0) }}</span>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ loan.BorrowerName }}</h3>
                  <p class="text-xs text-gray-500">{{ loan.AccountNO }}</p>
                </div>
              </div>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getLoanTypeClass(loan.LoanType)">
                {{ loan.LoanType }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p class="text-xs text-gray-500">Loan Amount</p>
                <p class="text-sm font-medium text-gray-900">₹{{ (loan.LoanAmount || 0).toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Balance</p>
                <p class="text-sm font-medium" :class="(loan.ClosingBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'">
                  ₹{{ Math.abs(loan.ClosingBalance || 0).toLocaleString() }}
                </p>
              </div> 
              <div>
                <p class="text-xs text-gray-500">Overdue</p>
                <p class="text-sm font-medium text-red-600">₹{{ (loan.TotalOverdueAmount || 0).toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Status</p>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(loan)">
                  {{ getStatusText(loan) }}
                </span>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button
                @click="viewLoanDetails(loan)"
                class="flex-1 text-xs bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
              >
                View Details
              </button>
              <button
                @click="editLoan(loan)"
                class="flex-1 text-xs bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Loans Table -->
      <div class="hidden sm:block bg-white shadow overflow-hidden sm:rounded-md">
        <!-- Loading State -->
        <div v-if="loansLoading" class="px-4 py-12 sm:px-6 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h3 class="mt-4 text-sm font-medium text-gray-900">Loading loan data...</h3>
        </div>
        
        <!-- Error State -->
        <div v-else-if="loansError" class="px-4 py-12 sm:px-6 text-center">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Supabase Connection Error</h3>
          <p class="mt-1 text-sm text-gray-500">{{ loansError }}</p>
          <div class="mt-4 text-xs text-gray-600 max-w-md mx-auto">
            <p class="mb-2">This could be due to:</p>
            <ul class="text-left list-disc list-inside space-y-1">
              <li>Supabase project is paused or inactive</li>
              <li>Incorrect project URL or API key</li>
              <li>Network connectivity issues</li>
              <li>Loans table doesn't exist yet</li>
            </ul>
          </div>
          <div class="mt-6 space-y-2">
            <button
              @click="loadLoans"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
            <div class="text-xs text-gray-500">
              The app will continue to work with localStorage as fallback
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="loans.length === 0" class="px-4 py-12 sm:px-6 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No loan data available</h3>
          <p class="mt-1 text-sm text-gray-500">Upload an Excel or CSV file to get started.</p>
          <div class="mt-6">
            <button
              @click="$refs.excelUploader.showUploadModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              Upload Excel File
            </button>
          </div>
        </div>
        
        <!-- Table with Data -->
        <div v-else>
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Loan Records</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">Detailed view of all loan accounts</p>
          </div>
          <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="loan in filteredLoans" :key="loan.AccountNO" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-blue-800">{{ loan.BorrowerName.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ loan.BorrowerName }}</div>
                      <div class="text-sm text-gray-500">{{ loan.MobileNo || 'No mobile' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ loan.AccountNO }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getLoanTypeClass(loan.LoanType)">
                    {{ loan.LoanType }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{{ (loan.LoanAmount || 0).toLocaleString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" :class="(loan.ClosingBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'">
                  ₹{{ Math.abs(loan.ClosingBalance || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">₹{{ (loan.TotalOverdueAmount || 0).toLocaleString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(loan)">
                    {{ getStatusText(loan) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewLoanDetails(loan)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    @click="editLoan(loan)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </main>
  </div>
</template>