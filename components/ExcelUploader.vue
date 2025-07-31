<template>
  <div class="bg-white shadow rounded-lg mb-6">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Excel Data Management</h3>
        <div class="flex space-x-2">
          <button
            @click="downloadSampleFile"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
Download Template (CSV/Excel)
          </button>
          <button
            @click="showUploadModal = true"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            Upload Excel/CSV
          </button>
        </div>
      </div>
      
      <!-- Upload Instructions -->
      
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Upload File</h3>
            <button
              @click="showUploadModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- File Upload Area -->
          <div
            @drop="handleFileDrop"
            @dragover.prevent
            @dragenter.prevent
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
            :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
          >
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="mt-4">
              <label for="file-upload" class="cursor-pointer">
                <span class="mt-2 block text-sm font-medium text-gray-900">
                  {{ selectedFile ? selectedFile.name : 'Drop your file here, or click to browse' }}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  @change="handleFileSelect"
                  class="hidden"
                />
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500">CSV, XLSX, or XLS files only</p>
          </div>

          <!-- File Preview -->
          <div v-if="filePreview.length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">File Preview (first 3 rows):</h4>
            <div class="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
              <table class="w-full text-xs">
                <thead>
                  <tr>
                    <th v-for="header in filePreview[0]" :key="header" class="text-left p-1 border-b">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in filePreview.slice(1, 4)" :key="index">
                    <td v-for="cell in row" :key="cell" class="p-1 border-b">
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Upload Progress -->
          <div v-if="isUploading" class="mt-4">
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span class="text-sm text-gray-600">Processing file...</span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="uploadError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-800">{{ uploadError }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="uploadSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p class="text-sm text-green-800">{{ uploadSuccess }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="showUploadModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              @click="processFile"
              :disabled="!selectedFile || isUploading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isUploading ? 'Processing...' : 'Upload & Process' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'

const emit = defineEmits(['data-loaded'])

const showUploadModal = ref(false)
const selectedFile = ref(null)
const isUploading = ref(false)
const isDragOver = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')
const filePreview = ref([])

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    uploadError.value = ''
    uploadSuccess.value = ''
    filePreview.value = []
    previewFile(file)
  }
}

const handleFileDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.includes('spreadsheet') || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      selectedFile.value = file
      uploadError.value = ''
      uploadSuccess.value = ''
      filePreview.value = []
      previewFile(file)
    } else {
      uploadError.value = 'Please select a valid Excel or CSV file.'
    }
  }
}

const previewFile = (file) => {
  if (file.name.endsWith('.csv')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n')
      const preview = lines.slice(0, 4).map(line => line.split(','))
      filePreview.value = preview
    }
    reader.readAsText(file)
  } else {
    // Handle Excel files
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON for preview
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        filePreview.value = jsonData.slice(0, 4)
      } catch (error) {
        console.error('Error previewing Excel file:', error)
        uploadError.value = 'Error reading Excel file. Please make sure it\'s a valid Excel file.'
      }
    }
    reader.readAsArrayBuffer(file)
  }
}

const processFile = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  uploadError.value = ''
  uploadSuccess.value = ''

  try {
    let processedData = []

    if (selectedFile.value.name.endsWith('.csv')) {
      processedData = await processCSVFile(selectedFile.value)
    } else {
      processedData = await processExcelFile(selectedFile.value)
    }

    if (processedData.length === 0) {
      throw new Error('No valid data found in the file.')
    }

    // Validate required columns with more flexible matching
    const requiredColumns = ['BranchName', 'LoanType', 'AccountNO', 'BorrowerName', 'LoanAmount']
    const firstRow = processedData[0]
    
    // Log available columns for debugging
    console.log('Available columns:', Object.keys(firstRow))
    
    // Check for missing columns with flexible matching
    const availableColumns = Object.keys(firstRow)
    const missingColumns = requiredColumns.filter(requiredCol => {
      // Try exact match first
      if (availableColumns.includes(requiredCol)) return false
      
      // Try case-insensitive match
      if (availableColumns.some(available => available.toLowerCase() === requiredCol.toLowerCase())) return false
      
      // Try matching without spaces
      const requiredNoSpaces = requiredCol.replace(/\s+/g, '')
      if (availableColumns.some(available => available.replace(/\s+/g, '').toLowerCase() === requiredNoSpaces.toLowerCase())) return false
      
      // Try partial matching
      if (availableColumns.some(available => 
        available.toLowerCase().includes(requiredCol.toLowerCase()) ||
        requiredCol.toLowerCase().includes(available.toLowerCase())
      )) return false
      
      return true
    })
    
    if (missingColumns.length > 0) {
      // Find the best matches for missing columns
      const suggestions = missingColumns.map(missing => {
        const bestMatch = availableColumns.find(available => {
          const availableNoSpaces = available.replace(/\s+/g, '').toLowerCase()
          const missingNoSpaces = missing.replace(/\s+/g, '').toLowerCase()
          return availableNoSpaces === missingNoSpaces
        })
        return bestMatch ? `(Did you mean: ${bestMatch}?)` : ''
      })
      
      const suggestionsText = missingColumns.map((col, index) => 
        `${col}${suggestions[index]}`
      ).join(', ')
      
      throw new Error(`Missing required columns: ${suggestionsText}. Available columns: ${availableColumns.join(', ')}. Please download the template file to see the correct format.`)
    }

    // Emit the processed data to parent component
    emit('data-loaded', processedData)
    
    uploadSuccess.value = `Successfully processed ${selectedFile.value.name} with ${processedData.length} records.`
    selectedFile.value = null
    filePreview.value = []
    
    // Close modal after a delay
    setTimeout(() => {
      showUploadModal.value = false
      uploadSuccess.value = ''
    }, 2000)

  } catch (error) {
    uploadError.value = error.message || 'Error processing file. Please make sure it\'s a valid file with the correct format.'
    console.error('File processing error:', error)
  } finally {
    isUploading.value = false
  }
}

const processCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          reject(new Error('File must contain at least a header row and one data row.'))
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const data = []

        for (let i = 1; i < lines.length; i++) {
          // Handle CSV with potential quotes and commas in values
          const values = []
          let current = ''
          let inQuotes = false
          const line = lines[i]
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim().replace(/"/g, ''))
              current = ''
            } else {
              current += char
            }
          }
          values.push(current.trim().replace(/"/g, ''))
          
          const row = {}
          
          headers.forEach((header, index) => {
            let value = values[index] || ''
            
            // Convert numeric values (check both original and normalized keys)
            const numericFields = ['LoanAmount', 'ClosingBalance', 'InterestRate', 'PERIOD', 'InstallmentAmount', 'TotalOverdueAmount', 'TotalRecoveryAmount']
            const normalizedHeader = header.replace(/\s+/g, '')
            const isNumericField = numericFields.includes(header) || numericFields.includes(normalizedHeader)
            
            if (isNumericField) {
              value = parseFloat(value) || 0
            }
            
            row[header] = value
          })
          
          // Ensure all required numeric fields have default values
          const requiredNumericFields = ['LoanAmount', 'ClosingBalance', 'TotalOverdueAmount', 'TotalRecoveryAmount', 'InstallmentAmount', 'InterestRate', 'PERIOD']
          requiredNumericFields.forEach(field => {
            if (!(field in row)) {
              row[field] = 0
            }
          })
          
          data.push(row)
        }

        resolve(data)
      } catch (error) {
        reject(new Error('Error parsing CSV file: ' + error.message))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

const processExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        if (jsonData.length === 0) {
          reject(new Error('No data found in the Excel file.'))
          return
        }

        // Process the data to ensure proper data types and normalize column names
        const processedData = jsonData.map(row => {
          const processedRow = {}
          
          Object.keys(row).forEach(key => {
            let value = row[key]
            
            // Normalize column name (remove spaces and convert to camelCase)
            const normalizedKey = key.replace(/\s+/g, '')
            
            // Convert numeric values (check both original and normalized keys)
            const numericFields = ['LoanAmount', 'ClosingBalance', 'InterestRate', 'PERIOD', 'InstallmentAmount', 'TotalOverdueAmount', 'TotalRecoveryAmount']
            const isNumericField = numericFields.includes(key) || numericFields.includes(normalizedKey)
            
            if (isNumericField) {
              value = parseFloat(value) || 0
            }
            
            processedRow[key] = value
          })
          
          // Ensure all required numeric fields have default values
          const requiredNumericFields = ['LoanAmount', 'ClosingBalance', 'TotalOverdueAmount', 'TotalRecoveryAmount', 'InstallmentAmount', 'InterestRate', 'PERIOD']
          requiredNumericFields.forEach(field => {
            if (!(field in processedRow)) {
              processedRow[field] = 0
            }
          })
          
          return processedRow
        })

        resolve(processedData)
      } catch (error) {
        reject(new Error('Error processing Excel file: ' + error.message))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsArrayBuffer(file)
  })
}

const downloadSampleFile = () => {
  // Create a dropdown or modal to choose between CSV and Excel
  const fileType = confirm('Download sample file as:\n\nOK = Excel (.xlsx)\nCancel = CSV (.csv)')
  
  const link = document.createElement('a')
  if (fileType) {
    link.href = '/sample-loans.xlsx'
    link.download = 'sample-loans.xlsx'
  } else {
    link.href = '/sample-loans.csv'
    link.download = 'sample-loans.csv'
  }
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Reset form when modal closes
watch(showUploadModal, (newVal) => {
  if (!newVal) {
    selectedFile.value = null
    uploadError.value = ''
    uploadSuccess.value = ''
    isUploading.value = false
    filePreview.value = []
  }
})
</script> 