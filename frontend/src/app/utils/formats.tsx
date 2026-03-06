
export const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(numAmount)
}

export const formatDate = (dateString: string, format: 'short' | 'long' = 'long'): string => {
    const date = new Date(dateString)

    if (format === 'short') {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 hover:bg-green-100'
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
        case 'processing':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
        case 'rejected':
            return 'bg-red-100 text-red-800 hover:bg-red-100'
        case 'draft':
            return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
}