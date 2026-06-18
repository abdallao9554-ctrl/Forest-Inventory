import html2canvas from 'html2canvas'

/**
 * Export a DOM element as a PNG image
 */
export async function exportMapAsImage(elementId: string, filename: string = 'hotspot-map.png') {
    const element = document.getElementById(elementId)
    if (!element) {
        console.error(`Element with id "${elementId}" not found`)
        return
    }

    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff'
        })

        // Convert to blob and download
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = filename
                link.click()
                URL.revokeObjectURL(url)
            }
        })
    } catch (error) {
        console.error('Error exporting map:', error)
    }
}

/**
 * Export hotspot data as CSV
 */
export function exportDataAsCSV(
    data: Array<{ lat: number; lng: number; intensity: number }>,
    filename: string = 'hotspot-data.csv'
) {
    if (!data || data.length === 0) {
        console.warn('No data to export')
        return
    }

    // Create CSV content
    const headers = ['Latitude', 'Longitude', 'Intensity']
    const rows = data.map(point => [point.lat, point.lng, point.intensity])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

/**
 * Open print dialog for dashboard
 */
export function printDashboard() {
    window.print()
}
