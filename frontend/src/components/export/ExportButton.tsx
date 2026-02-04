import { Download, Loader2 } from 'lucide-react'
import { RefObject } from 'react'
import { usePdfExport } from '../../hooks/usePdfExport'
import { Button } from '../common/Button'

interface ExportButtonProps {
  tripName: string
  startDate: string
  endDate: string
  countryName: string
  timelineRef: RefObject<HTMLElement>
}

export function ExportButton({
  tripName,
  startDate,
  endDate,
  countryName,
  timelineRef,
}: ExportButtonProps) {
  const { exportPdf, isExporting } = usePdfExport({
    tripName,
    startDate,
    endDate,
    countryName,
  })

  const handleExport = () => {
    exportPdf(timelineRef)
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="secondary"
      className="flex items-center gap-2 relative overflow-hidden"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </>
      )}

      {/* Frost glow effect on hover */}
      {!isExporting && (
        <span className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/10 to-sky-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
      )}
    </Button>
  )
}
