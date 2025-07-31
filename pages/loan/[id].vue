<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <button
              @click="goBack"
              class="mr-3 sm:mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-lg sm:text-2xl font-bold text-gray-900">Loan Details</h1>
          </div>
          <div class="flex items-center space-x-2 sm:space-x-4">
            <button
              @click="editLoan"
              class="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <span class="hidden sm:inline">Edit Loan</span>
              <svg class="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8" v-if="loan">
      <!-- Loan Overview Card -->
      <div class="bg-white shadow rounded-lg mb-4 sm:mb-6">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900">Loan Overview</h3>
            <span class="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full" :class="getStatusClass(loan)">
              {{ getStatusText(loan) }}
            </span>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Account Number</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900 break-all">{{ loan.AccountNO }}</dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Loan Type</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getLoanTypeClass(loan.LoanType)">
                  {{ loan.LoanType }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Branch</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">{{ loan.BranchName }}</dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Interest Rate</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">{{ loan.InterestRate }}%</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Borrower Information -->
      <div class="bg-white shadow rounded-lg mb-4 sm:mb-6">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-4">Borrower Information</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Borrower Name</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">{{ loan.BorrowerName }}</dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Mobile Number</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">{{ loan.MobileNo || 'Not provided' }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Address</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900 break-words">{{ loan.BorrowerAdd }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Information -->
      <div class="bg-white shadow rounded-lg mb-4 sm:mb-6">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-4">Financial Information</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Loan Amount</dt>
              <dd class="mt-1 text-lg sm:text-2xl font-bold text-green-600">₹{{ (loan.LoanAmount || 0).toLocaleString() }}</dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Closing Balance</dt>
              <dd class="mt-1 text-lg sm:text-2xl font-bold" :class="(loan.ClosingBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'">
                ₹{{ Math.abs(loan.ClosingBalance || 0).toLocaleString() }}
              </dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Total Overdue</dt>
              <dd class="mt-1 text-lg sm:text-2xl font-bold text-red-600">₹{{ (loan.TotalOverdueAmount || 0).toLocaleString() }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Loan Terms -->
      <div class="bg-white shadow rounded-lg mb-4 sm:mb-6">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-4">Loan Terms</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Open Date</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">{{ formatDate(loan.OpenDate) }}</dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">End Date</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">{{ formatDate(loan.EndDate) }}</dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Period (Months)</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">{{ loan.PERIOD }}</dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">First Installment Date</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">{{ formatDate(loan.FirstInstallmentDate) }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Installment Information -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-4">Installment Information</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Installment Amount</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">₹{{ (loan.InstallmentAmount || 0).toLocaleString() }}</dd>
            </div>
            <div>
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Total Recovery Amount</dt>
              <dd class="mt-1 text-sm sm:text-lg font-semibold text-gray-900">₹{{ (loan.TotalRecoveryAmount || 0).toLocaleString() }}</dd>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Loading State -->
    <main class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8" v-else-if="loading">
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </main>

    <!-- Error State -->
    <main class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8" v-else>
      <div class="bg-white shadow rounded-lg p-6">
        <div class="text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Loan Not Found</h3>
          <p class="text-gray-500 mb-4">The loan with account number {{ $route.params.id }} could not be found.</p>
          <button
            @click="goBack"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { getLoanByAccount } = useLoans()
const loan = ref(null)
const loading = ref(true)

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

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified'
  return new Date(dateString).toLocaleDateString('en-IN')
}

const goBack = () => {
  navigateTo('/dashboard')
}

const editLoan = () => {
  navigateTo(`/loan/${route.params.id}/edit`)
}

// Load loan data
onMounted(async () => {
  try {
    const accountId = route.params.id
    const foundLoan = await getLoanByAccount(accountId)
    
    if (foundLoan) {
      loan.value = foundLoan
      console.log('Found loan:', foundLoan)
    } else {
      console.log('Loan not found for account:', accountId)
      loan.value = null
    }
  } catch (error) {
    console.error('Error loading loan data:', error)
    loan.value = null
  } finally {
    loading.value = false
  }
})
</script> 