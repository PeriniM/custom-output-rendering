import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import styles from '../styles/App.module.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function PDFViewer({ pdfPath }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  function onDocumentLoadError(error) {
    setError(error)
    setLoading(false)
    console.error('Error loading PDF:', error)
  }

  function goToPrevPage() {
    setPageNumber((prev) => Math.max(1, prev - 1))
  }

  function goToNextPage() {
    setPageNumber((prev) => Math.min(numPages, prev + 1))
  }

  return (
    <div className={styles.pdfViewerContainer}>
      {error ? (
        <div className={styles.pdfError}>
          <p>Unable to load PDF. Please try opening it directly:</p>
          <a 
            href={pdfPath} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.pdfLink}
          >
            📄 Open PDF in new tab
          </a>
        </div>
      ) : (
        <>
          <div className={styles.pdfControls}>
            <button 
              onClick={goToPrevPage} 
              disabled={pageNumber <= 1}
              className={styles.pdfButton}
            >
              ← Previous
            </button>
            <span className={styles.pdfPageInfo}>
              Page {pageNumber} of {numPages || '...'}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={pageNumber >= numPages}
              className={styles.pdfButton}
            >
              Next →
            </button>
            <a 
              href={pdfPath} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.pdfLinkButton}
            >
              Open in New Tab
            </a>
          </div>
          
          <div className={styles.pdfDocumentWrapper}>
            {loading && (
              <div className={styles.pdfLoading}>
                <p>Loading PDF...</p>
              </div>
            )}
            <Document
              file={pdfPath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className={styles.pdfDocument}
            >
              <Page 
                pageNumber={pageNumber} 
                className={styles.pdfPage}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        </>
      )}
    </div>
  )
}

