export class ApiError {
  additionalInfo: []
  code: string
  message: string
} 
export class ApiAnswer {
  data: any
  success: boolean
  errors: ApiError
}

