
/**
 * Hook per la rilevazione di dispositivi mobili
 * 
 * Questo file contiene diversi hook personalizzati che permettono di rilevare
 * il tipo di dispositivo in uso e di adattare l'interfaccia di conseguenza.
 */

import * as React from "react"

// Breakpoint per diverse dimensioni dello schermo
const BREAKPOINTS = {
  xs: 480, // Schermi extra piccoli
  sm: 640, // Schermi piccoli
  md: 768, // Schermi medi
  lg: 1024, // Schermi grandi
  xl: 1280, // Schermi extra larghi
  "2xl": 1536 // Schermi 2x extra larghi
}

/**
 * Hook per verificare se la viewport attuale è di dimensione mobile
 * @returns boolean che indica se lo schermo è di dimensione mobile (< md breakpoint)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Definisce la funzione handler
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    
    // Imposta il valore iniziale
    handleResize()
    
    // Aggiunge l'event listener
    window.addEventListener("resize", handleResize)
    
    // Pulizia
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}

/**
 * Hook per verificare se la viewport è sotto un breakpoint specifico
 * @param breakpoint Il breakpoint da controllare
 * @returns boolean che indica se lo schermo è sotto il breakpoint specificato
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS) {
  const [isBelow, setIsBelow] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Definisce la funzione handler
    const handleResize = () => {
      setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint])
    }
    
    // Imposta il valore iniziale
    handleResize()
    
    // Aggiunge l'event listener
    window.addEventListener("resize", handleResize)
    
    // Pulizia
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint])

  return isBelow
}

/**
 * Hook per verificare se la viewport è sopra un breakpoint specifico
 * @param breakpoint Il breakpoint da controllare
 * @returns boolean che indica se lo schermo è sopra il breakpoint specificato
 */
export function useBreakpointAbove(breakpoint: keyof typeof BREAKPOINTS) {
  const [isAbove, setIsAbove] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Definisce la funzione handler
    const handleResize = () => {
      setIsAbove(window.innerWidth >= BREAKPOINTS[breakpoint])
    }
    
    // Imposta il valore iniziale
    handleResize()
    
    // Aggiunge l'event listener
    window.addEventListener("resize", handleResize)
    
    // Pulizia
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint])

  return isAbove
}

/**
 * Hook per ottenere il nome del breakpoint attivo corrente
 * @returns Il nome del breakpoint attivo corrente
 */
export function useActiveBreakpoint() {
  const [activeBreakpoint, setActiveBreakpoint] = React.useState<keyof typeof BREAKPOINTS>("xs")

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width >= BREAKPOINTS["2xl"]) {
        setActiveBreakpoint("2xl")
      } else if (width >= BREAKPOINTS.xl) {
        setActiveBreakpoint("xl")
      } else if (width >= BREAKPOINTS.lg) {
        setActiveBreakpoint("lg")
      } else if (width >= BREAKPOINTS.md) {
        setActiveBreakpoint("md")
      } else if (width >= BREAKPOINTS.sm) {
        setActiveBreakpoint("sm")
      } else {
        setActiveBreakpoint("xs")
      }
    }
    
    // Imposta il valore iniziale
    handleResize()
    
    // Aggiunge l'event listener
    window.addEventListener("resize", handleResize)
    
    // Pulizia
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return activeBreakpoint
}
