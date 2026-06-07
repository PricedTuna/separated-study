import React, { createContext, useContext, useState, useCallback } from "react"

interface DataRefreshContextType {
  refreshKey: number
  triggerRefresh: () => void
}

const DataRefreshContext = createContext<DataRefreshContextType>({
  refreshKey: 0,
  triggerRefresh: () => {},
 })

export function DataRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <DataRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </DataRefreshContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDataRefresh() {
  return useContext(DataRefreshContext)
}