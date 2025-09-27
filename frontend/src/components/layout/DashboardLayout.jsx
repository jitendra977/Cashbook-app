import React from 'react'
import Navbar from '../common/Navbar'
import Sidebar from '../common/Sidebar'

export const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      {/* Top Navbar */}
      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  )
}