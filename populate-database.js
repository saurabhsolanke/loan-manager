import { supabase } from './utils/supabase.js'
import fs from 'fs'

async function populateDatabase() {
  console.log('🔄 Starting database population...')
  
  try {
    // Read the CSV file
    const csvData = fs.readFileSync('./public/sample-loans.csv', 'utf8')
    const lines = csvData.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    const results = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',')
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] ? values[index].trim() : ''
        })
        results.push(row)
      }
    }
    
    console.log(`📊 Found ${results.length} records in CSV`)
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('loanable')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message)
      return
    }
    
    console.log('✅ Connection successful!')
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('loanable')
      .delete()
      .neq('id', 0)
    
    if (deleteError) {
      console.log('⚠️ Could not clear existing data:', deleteError.message)
    } else {
      console.log('🗑️ Cleared existing data')
    }
    
    // Insert new data
    const { data, error } = await supabase
      .from('loanable')
      .insert(results)
      .select()
    
    if (error) {
      console.log('❌ Insert error:', error.message)
      return
    }
    
    console.log(`✅ Successfully inserted ${data.length} records into Supabase!`)
    console.log('📋 Sample record:', data[0])
    
  } catch (err) {
    console.log('❌ Error:', err.message)
  }
}

populateDatabase() 