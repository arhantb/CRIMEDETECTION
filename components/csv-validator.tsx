"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, FileText, Upload } from "lucide-react"

export default function CSVValidator() {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    headers: string[]
    rowCount: number
    columnMapping: { [key: string]: number }
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateCSV = (content: string) => {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      const lines = content.trim().split('\n')
      
      if (lines.length === 0) {
        errors.push("File is empty")
        return { isValid: false, errors, warnings, headers: [], rowCount: 0, columnMapping: {} }
      }
      
      if (lines.length < 2) {
        errors.push("File must contain at least a header row and one data row")
        return { isValid: false, errors, warnings, headers: [], rowCount: lines.length - 1, columnMapping: {} }
      }
      
      // More robust CSV parsing - handle potential quotes and different delimiters
      const parseCSVLine = (line: string) => {
        const result = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      }
      
      const headers = parseCSVLine(lines[0])
      console.log('Found headers:', headers)
      
      // Define possible column mappings for different CSV formats
      const columnMappings = [
        // Standard format
        {
          name: 'Standard Format',
          mapping: {
            latitude: headers.indexOf('Latitude'),
            longitude: headers.indexOf('Longitude'),
            crimeGroup: headers.indexOf('CrimeGroup_Name'),
            year: headers.indexOf('Year'),
            month: headers.indexOf('Month'),
            district: headers.indexOf('District_Name')
          }
        },
        // User's format (Latitude/Longitude at positions 6,7)
        {
          name: 'Extended Format',
          mapping: {
            latitude: headers.indexOf('Latitude'),
            longitude: headers.indexOf('Longitude'),
            crimeGroup: headers.indexOf('CrimeGroup_Name'),
            year: headers.indexOf('Year'),
            month: headers.indexOf('Month'),
            district: headers.indexOf('District_Name')
          }
        }
      ]
      
      // Find the best matching column mapping
      let selectedMapping = null
      for (const mapping of columnMappings) {
        const allFound = Object.values(mapping.mapping).every(index => index !== -1)
        if (allFound) {
          selectedMapping = mapping
          break
        }
      }
      
      if (!selectedMapping) {
        const missingColumns = ['Latitude', 'Longitude', 'CrimeGroup_Name', 'Year', 'Month', 'District_Name']
          .filter(col => headers.indexOf(col) === -1)
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
        errors.push(`Available columns: ${headers.join(', ')}`)
        return { 
          isValid: false, 
          errors, 
          warnings, 
          headers, 
          rowCount: lines.length - 1,
          columnMapping: {}
        }
      }
      
      warnings.push(`Using ${selectedMapping.name} column mapping`)
      
      // Check for extra headers
      const requiredHeaders = ['Latitude', 'Longitude', 'CrimeGroup_Name', 'Year', 'Month', 'District_Name']
      const extraHeaders = headers.filter(h => !requiredHeaders.includes(h))
      if (extraHeaders.length > 0) {
        warnings.push(`Extra columns found: ${extraHeaders.join(', ')}`)
      }
      
      // Limit validation to first 100 rows for performance
      const maxRowsToValidate = Math.min(lines.length - 1, 100)
      let hasValidationErrors = false
      
      // Validate data rows (limited for performance)
      for (let i = 1; i <= maxRowsToValidate; i++) {
        const line = lines[i]
        const values = parseCSVLine(line)
        
        if (values.length < 6) {
          errors.push(`Row ${i + 1}: Insufficient data. Expected at least 6 columns, found ${values.length}`)
          hasValidationErrors = true
          continue
        }
        
        // Extract values using the selected mapping
        const lat = values[selectedMapping.mapping.latitude]
        const lng = values[selectedMapping.mapping.longitude]
        const crimeGroup = values[selectedMapping.mapping.crimeGroup]
        const year = values[selectedMapping.mapping.year]
        const month = values[selectedMapping.mapping.month]
        const district = values[selectedMapping.mapping.district]
        
        // Debug: Log the first few rows to see what we're getting
        if (i <= 3) {
          console.log(`Row ${i + 1} mapped values:`, { lat, lng, crimeGroup, year, month, district })
        }
        
        // Validate coordinates - allow float values
        const latNum = parseFloat(lat)
        const lngNum = parseFloat(lng)
        if (isNaN(latNum) || isNaN(lngNum)) {
          errors.push(`Row ${i + 1}: Invalid coordinates. Latitude (${lat}) and longitude (${lng}) must be numbers.`)
          hasValidationErrors = true
        } else {
          // Additional coordinate range validation
          if (latNum < -90 || latNum > 90) {
            errors.push(`Row ${i + 1}: Invalid latitude (${latNum}). Must be between -90 and 90.`)
            hasValidationErrors = true
          }
          if (lngNum < -180 || lngNum > 180) {
            errors.push(`Row ${i + 1}: Invalid longitude (${lngNum}). Must be between -180 and 180.`)
            hasValidationErrors = true
          }
        }
        
        // Validate year
        const yearNum = parseInt(year)
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
          errors.push(`Row ${i + 1}: Invalid year (${year}). Year must be a number between 1900 and 2100.`)
          hasValidationErrors = true
        }
        
        // Validate month
        const monthNum = parseInt(month)
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          errors.push(`Row ${i + 1}: Invalid month (${month}). Month must be a number between 1 and 12.`)
          hasValidationErrors = true
        }
        
        // Validate text fields
        if (!crimeGroup || crimeGroup.trim() === '') {
          errors.push(`Row ${i + 1}: Crime group name is missing.`)
          hasValidationErrors = true
        }
        
        if (!district || district.trim() === '') {
          errors.push(`Row ${i + 1}: District name is missing.`)
          hasValidationErrors = true
        }
        
        // Stop validation if too many errors
        if (errors.length > 10) {
          errors.push(`... and ${lines.length - i - 1} more potential errors. Validation stopped for performance.`)
          break
        }
      }
      
      // Add warning if not all rows were validated
      if (lines.length - 1 > maxRowsToValidate) {
        warnings.push(`Only validated first ${maxRowsToValidate} rows for performance. Total rows: ${lines.length - 1}`)
      }
      
      return {
        isValid: errors.length === 0,
        errors: errors.slice(0, 10), // Limit error display
        warnings,
        headers,
        rowCount: lines.length - 1,
        columnMapping: selectedMapping.mapping
      }
    } catch (error) {
      errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { isValid: false, errors, warnings, headers: [], rowCount: 0, columnMapping: {} }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsValidating(true)
      setValidationResult(null)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        // Use setTimeout to make validation feel more responsive
        setTimeout(() => {
          const result = validateCSV(content)
          setValidationResult(result)
          setIsValidating(false)
        }, 50)
      }
      reader.readAsText(file)
    }
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          CSV File Validator
        </CardTitle>
        <CardDescription>
          Upload your CSV file to check if it meets the required format before uploading to the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="csv-validator" className="text-sm font-medium">
            Select CSV File
          </label>
          <input
            id="csv-validator"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full cursor-pointer"
          />
        </div>

        {isValidating && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Validating CSV file...</span>
          </div>
        )}
        
        {validationResult && !isValidating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {validationResult.isValid ? "CSV is valid!" : "CSV has issues"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Headers found:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {validationResult.headers.map((header, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {header}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Data rows:</span>
                <p className="font-medium">{validationResult.rowCount}</p>
              </div>
            </div>

            {validationResult.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errors found:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.isValid && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your CSV file is ready to upload! You can now use it in the Timeline Predictions dashboard.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Required CSV Format:</h4>
          <div className="bg-muted p-3 rounded text-sm font-mono">
            Latitude,Longitude,CrimeGroup_Name,Year,Month,District_Name
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Example: 28.6139,77.2090,Theft,2023,1,New Delhi
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Note:</strong> Your CSV can have additional columns, but must include the required ones.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

