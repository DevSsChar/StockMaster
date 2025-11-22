'use client'

import { useState, useEffect } from 'react'

const MoveHistory = () => {
  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')

  // Fetch operations from API
  const fetchOperations = async () => {
    try {
      setLoading(true)
      const url = filter === 'all' 
        ? '/api/operations' 
        : `/api/operations?type=${filter}`
      
      const response = await fetch(url)
      const result = await response.json()

      if (result.success && result.data) {
        // Transform API data to match component structure
        const transformedOps = result.data.map(op => ({
          reference: op.reference,
          contact: op.partner || 'N/A',
          from: op.sourceLocation?.name || 'N/A',
          to: op.destLocation?.name || 'N/A',
          status: op.status.charAt(0).toUpperCase() + op.status.slice(1),
          type: op.type,
          lines: op.lines || [],
          products: op.lines?.map(line => ({
            name: line.product?.name || 'Unknown Product',
            quantity: line.quantity || 0
          })) || []
        }))
        setOperations(transformedOps)
      }
    } catch (error) {
      console.error('Error fetching operations:', error)
      setOperations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOperations()
  }, [filter])

  // Expand operations with multiple products into multiple rows
  const expandedOperations = operations.flatMap(op => 
    op.products && op.products.length > 0
      ? op.products.map(product => ({ ...op, product: product.name, quantity: product.quantity }))
      : [{ ...op, product: null, quantity: 0 }]
  )

  // Filter by type and search query
  const filteredOperations = expandedOperations.filter(op => {
    const matchesType = filter === 'all' || op.type === filter
    const matchesSearch = searchQuery === '' || 
      op.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.contact.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16">
      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['all', 'receipt', 'delivery', 'internal'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === type
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search reference or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* List View Button */}
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Kanban View Button */}
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>

            {/* NEW Button */}
            <button 
              onClick={() => window.location.href = '/inventory/operations/new'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              NEW
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'list' ? (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Reference</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">From</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">To</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperations.map((operation, idx) => {
                  const isInMove = operation.type === 'receipt'
                  const isOutMove = operation.type === 'delivery'
                  
                  return (
                    <tr
                      key={`${operation.reference}-${idx}`}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isInMove ? 'bg-green-50' : isOutMove ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            isInMove ? 'bg-green-500' : isOutMove ? 'bg-red-500' : 'bg-blue-500'
                          }`}></span>
                          <span className={`text-sm font-semibold ${
                            isInMove ? 'text-green-700' : isOutMove ? 'text-red-700' : 'text-gray-900'
                          }`}>{operation.reference}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-6 text-sm font-medium ${
                        isInMove ? 'text-green-700' : isOutMove ? 'text-red-700' : 'text-gray-700'
                      }`}>{operation.contact}</td>
                      <td className={`py-3 px-6 text-sm ${
                        isInMove ? 'text-green-600' : isOutMove ? 'text-red-600' : 'text-gray-700'
                      }`}>{operation.product || 'N/A'}</td>
                      <td className={`py-3 px-6 text-sm ${
                        isInMove ? 'text-green-600' : isOutMove ? 'text-red-600' : 'text-gray-600'
                      }`}>{operation.from}</td>
                      <td className={`py-3 px-6 text-sm ${
                        isInMove ? 'text-green-600' : isOutMove ? 'text-red-600' : 'text-gray-600'
                      }`}>{operation.to}</td>
                      <td className={`py-3 px-6 text-sm font-semibold ${
                        isInMove ? 'text-green-700' : isOutMove ? 'text-red-700' : 'text-gray-900'
                      }`}>{operation.quantity || 0}</td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          operation.status === 'Done' 
                            ? 'bg-green-100 text-green-700' 
                            : operation.status === 'Ready'
                            ? 'bg-orange-100 text-orange-700'
                            : operation.status === 'Draft'
                            ? 'bg-gray-100 text-gray-700'
                            : operation.status === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {operation.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Kanban View */
          <div className="grid grid-cols-4 gap-6 h-full">
            {['Draft', 'Ready', 'Done', 'Cancelled'].map(status => {
              const statusOps = filteredOperations.filter(op => op.status === status)
              return (
                <div key={status} className="flex flex-col bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">{status}</h3>
                    <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {statusOps.length}
                    </span>
                  </div>
                  <div className="space-y-3 overflow-auto">
                    {statusOps.map((operation, idx) => {
                      const isInMove = operation.type === 'receipt'
                      const isOutMove = operation.type === 'delivery'
                      
                      return (
                        <div
                          key={`${operation.reference}-${idx}`}
                          className={`bg-white p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                            isInMove ? 'border-green-500' : isOutMove ? 'border-red-500' : 'border-blue-500'
                          }`}
                        >
                          <div className="font-semibold text-sm text-gray-900 mb-2">{operation.reference}</div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div><span className="font-semibold">Contact:</span> {operation.contact}</div>
                            <div><span className="font-semibold">Product:</span> {operation.product || 'N/A'}</div>
                            <div><span className="font-semibold">Quantity:</span> {operation.quantity || 0}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-gray-500">{operation.from}</span>
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-gray-500">{operation.to}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MoveHistory
