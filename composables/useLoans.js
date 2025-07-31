import { ref } from 'vue'
import { supabase } from '~/utils/supabase'

export const useLoans = () => {
  const loans = ref([])
  const loading = ref(false)
  const error = ref(null)
  const loadLoans = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('Fetching loans from Supabase...')
      console.log('Supabase URL:', supabase.supabaseUrl)
      
      // First, test the connection
      const { data: testData, error: testError } = await supabase
        .from('loanable')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError)
        throw new Error(`Connection failed: ${testError.message}`)
      }
      
      console.log('✅ Supabase connection test successful')
      
      // Now fetch all data
      const { data, error: supabaseError } = await supabase
        .from('loanable')
        .select('*')
        .order('BorrowerName', { ascending: true })

      if (supabaseError) {
        console.error('❌ Supabase data fetch error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} loans from Supabase`)
        loans.value = data
        return { success: true, source: 'supabase' }
      } else {
        console.log('⚠️ No data found in Supabase')
        loans.value = []
        return { success: true, source: 'empty' }
      }

    } catch (err) {
      console.error('❌ Error loading loans:', err)
      error.value = err.message
      
      loans.value = []
      return { success: false, source: 'error', error: err.message }
    } finally {
      loading.value = false
    }
  }

  const addLoan = async (loanData) => {
    try {
      const { data, error } = await supabase
        .from('loanable')
        .insert([loanData])
        .select()

      if (error) throw error

      if (data) {
        loans.value.push(data[0])
        return { success: true, data: data[0] }
      }
    } catch (err) {
      console.error('Error adding loan:', err)
      return { success: false, error: err.message }
    }
  }

  const updateLoan = async (accountNo, updates) => {
    try {
      const { data, error } = await supabase
        .from('loanable')
        .update(updates)
        .eq('AccountNO', accountNo)
        .select()

      if (error) throw error

      if (data) {
        const index = loans.value.findIndex(loan => loan.AccountNO === accountNo)
        if (index !== -1) {
          loans.value[index] = { ...loans.value[index], ...data[0] }
        }
        return { success: true, data: data[0] }
      }
    } catch (err) {
      console.error('Error updating loan:', err)
      return { success: false, error: err.message }
    }
  }

  const deleteLoan = async (accountNo) => {
    try {
      const { error } = await supabase
        .from('loanable')
        .delete()
        .eq('AccountNO', accountNo)

      if (error) throw error

      loans.value = loans.value.filter(loan => loan.AccountNO !== accountNo)
      return { success: true }
    } catch (err) {
      console.error('Error deleting loan:', err)
      return { success: false, error: err.message }
    }
  }

  const getLoanById = async (accountNo) => {
    try {
      const { data, error } = await supabase
        .from('loanable')
        .select('*')
        .eq('AccountNO', accountNo)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (err) {
      console.error('Error fetching loan:', err)
      return { success: false, error: err.message }
    }
  }

  const searchLoans = async (searchTerm, filters = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log('Searching loans with filters:', { searchTerm, filters })
      
      let query = supabase
        .from('loanable')
        .select('*')

      // Apply search term using ilike for better compatibility
      if (searchTerm && searchTerm.trim()) {
        const searchValue = searchTerm.trim()
        
        // Use ilike for BorrowerName and cast AccountNO to text for searching
        query = query.or(
          `BorrowerName.ilike.%${searchValue}%,` +
          `AccountNO.cast.text.ilike.%${searchValue}%`
        )
      }

      // Apply filters
      if (filters.loanType) {
        query = query.eq('LoanType', filters.loanType)
      }

      if (filters.branch) {
        query = query.eq('BranchName', filters.branch)
      }

      if (filters.status) {
        if (filters.status === 'overdue') {
          query = query.gt('Total Overdue Amount', 0)
        } else if (filters.status === 'active') {
          query = query.lt('Closing Balance', 0)
        } else if (filters.status === 'closed') {
          query = query.gte('Closing Balance', 0)
        }
      }

      // Order by borrower name
      query = query.order('BorrowerName', { ascending: true })

      const { data, error: searchError } = await query

      if (searchError) {
        console.error('❌ Search error:', searchError)
        throw new Error(searchError.message)
      }

      console.log(`✅ Search completed: ${data?.length || 0} results`)
      loans.value = data || []
      return { success: true, data: data || [] }

    } catch (err) {
      console.error('❌ Error searching loans:', err)
      error.value = err.message
      loans.value = []
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const getLoanTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('loanable')
        .select('LoanType')
        .not('LoanType', 'is', null)

      if (error) throw error

      const types = [...new Set(data.map(item => item.LoanType).filter(Boolean))]
      return { success: true, data: types }
    } catch (err) {
      console.error('Error fetching loan types:', err)
      return { success: false, error: err.message }
    }
  }

  const getBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('loanable')
        .select('BranchName')
        .not('BranchName', 'is', null)

      if (error) throw error

      const branches = [...new Set(data.map(item => item.BranchName).filter(Boolean))]
      return { success: true, data: branches }
    } catch (err) {
      console.error('Error fetching branches:', err)
      return { success: false, error: err.message }
    }
  }

  // Advanced search with ranking and multiple field support
  const advancedSearchLoans = async (searchTerm, filters = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log('Advanced searching loans with filters:', { searchTerm, filters })
      
      if (!searchTerm || !searchTerm.trim()) {
        // If no search term, fall back to regular search
        return await searchLoans('', filters)
      }

      const searchValue = searchTerm.trim()
      
      // Check if search value is numeric (for AccountNO search)
      const isNumeric = /^\d+$/.test(searchValue)
      
      let query = supabase.from('loanable').select('*')
      
      if (isNumeric) {
        // If numeric, search for exact AccountNO match first, then partial matches
        query = query.or(
          `AccountNO.eq.${searchValue},` +
          `BorrowerName.ilike.%${searchValue}%,` +
          `AccountNO.cast.text.ilike.%${searchValue}%`
        )
      } else {
        // If text, search in text fields only
        query = query.or(
          `BorrowerName.ilike.%${searchValue}%,` +
          `LoanType.ilike.%${searchValue}%,` +
          `BranchName.ilike.%${searchValue}%`
        )
      }

      const { data, error: searchError } = await query.order('BorrowerName', { ascending: true })

      if (searchError) {
        console.error('❌ Advanced search error:', searchError)
        throw new Error(searchError.message)
      }

      // Apply additional filters in memory for complex queries
      let filteredData = data || []
      
      if (filters.loanType) {
        filteredData = filteredData.filter(loan => loan.LoanType === filters.loanType)
      }

      if (filters.branch) {
        filteredData = filteredData.filter(loan => loan.BranchName === filters.branch)
      }

      if (filters.status) {
        if (filters.status === 'overdue') {
          filteredData = filteredData.filter(loan => (loan['Total Overdue Amount'] || 0) > 0)
        } else if (filters.status === 'active') {
          filteredData = filteredData.filter(loan => (loan['Closing Balance'] || 0) < 0)
        } else if (filters.status === 'closed') {
          filteredData = filteredData.filter(loan => (loan['Closing Balance'] || 0) >= 0)
        }
      }

      console.log(`✅ Advanced search completed: ${filteredData.length} results`)
      loans.value = filteredData
      return { success: true, data: filteredData }

    } catch (err) {
      console.error('❌ Error in advanced search:', err)
      error.value = err.message
      loans.value = []
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    loans,
    loading,
    error,
    loadLoans,
    addLoan,
    updateLoan,
    deleteLoan,
    getLoanById,
    searchLoans,
    advancedSearchLoans,
    getLoanTypes,
    getBranches
  }
} 