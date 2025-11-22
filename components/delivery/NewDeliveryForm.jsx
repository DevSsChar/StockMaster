'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewDeliveryForm({ operationId: propOperationId, isEditMode = false }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [status, setStatus] = useState('Draft'); // Draft -> Waiting/Ready -> Done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operationId, setOperationId] = useState(propOperationId || null);
  const [stockCheckLoading, setStockCheckLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(isEditMode);
  
  const [formData, setFormData] = useState({
    reference: '',
    deliveryAddress: '',
    responsible: '',
    scheduleDate: '',
    operationType: '',
  });

  const [products, setProducts] = useState([
    { id: 1, name: '[DESK001] Desk', quantity: 6, inStock: false, stockMessage: '' }
  ]);

  // Fetch existing delivery data in edit mode
  useEffect(() => {
    const fetchDeliveryData = async () => {
      if (!isEditMode || !propOperationId) return;

      setDataLoading(true);
      try {
        const response = await fetch(`/api/deliveries/${propOperationId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          const delivery = data.data;
          
          // Set form data
          setFormData({
            reference: delivery.reference || '',
            deliveryAddress: delivery.destLocation?.address || '',
            responsible: delivery.responsible || '',
            scheduleDate: delivery.scheduledDate 
              ? new Date(delivery.scheduledDate).toISOString().split('T')[0] 
              : '',
            operationType: delivery.type || 'delivery',
          });

          // Set products from lines
          if (delivery.lines && delivery.lines.length > 0) {
            setProducts(delivery.lines.map((line, index) => ({
              id: index + 1,
              name: line.product?.name || '',
              quantity: line.quantity || 0,
              productId: line.product?._id || '',
              inStock: true,
              stockMessage: '',
            })));
          }

          // Set status
          const statusMap = {
            draft: 'Draft',
            ready: 'Ready',
            waiting: 'Waiting',
            done: 'Done',
            cancelled: 'Cancelled',
          };
          setStatus(statusMap[delivery.status] || 'Draft');
        } else {
          setError('Failed to load delivery data');
        }
      } catch (err) {
        console.error('Error fetching delivery:', err);
        setError('Failed to load delivery data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchDeliveryData();
  }, [isEditMode, propOperationId]);

  // Auto-fill responsible with logged-in user (only for new deliveries)
  useEffect(() => {
    if (!isEditMode && session?.user?.name && !formData.responsible) {
      setFormData(prev => ({
        ...prev,
        responsible: session.user.name
      }));
    }
  }, [session, formData.responsible, isEditMode]);

  // Real-time stock checking when products change
  useEffect(() => {
    const checkStock = async () => {
      const productsToCheck = products.filter(p => p.name && p.quantity > 0);
      if (productsToCheck.length === 0) return;

      setStockCheckLoading(true);
      try {
        const response = await fetch('/api/products/check-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: productsToCheck }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setProducts(prev => prev.map(p => {
            const stockInfo = data.data.find(s => s.id === p.id);
            if (stockInfo) {
              return {
                ...p,
                inStock: stockInfo.inStock,
                stockMessage: stockInfo.message,
                productId: stockInfo.productId,
                availableStock: stockInfo.availableStock,
              };
            }
            return p;
          }));
        }
      } catch (err) {
        console.error('Stock check error:', err);
      } finally {
        setStockCheckLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      checkStock();
    }, 500);

    return () => clearTimeout(debounce);
  }, [products.map(p => `${p.name}-${p.quantity}`).join(',')]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductQuantityChange = (id, quantity) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, quantity: parseInt(quantity) || 0 } : product
    ));
  };

  const addNewProduct = () => {
    setProducts(prev => [...prev, {
      id: Date.now(),
      name: '',
      quantity: 0,
      inStock: true
    }]);
  };

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Check stock status for products
  const checkStockStatus = () => {
    return products.every(p => p.inStock || !p.name);
  };

  // Handle TO DO button - Move from Draft to Ready/Waiting and update DB
  const handleToDo = async () => {
    if (status === 'Draft') {
      const allInStock = checkStockStatus();
      const newStatus = allInStock ? 'Ready' : 'Waiting';
      setStatus(newStatus);
      
      if (operationId) {
        await updateOperation(newStatus);
      }
    }
  };

  // Handle Validate button - Move from Ready to Done and update DB
  const handleValidate = async () => {
    if (status === 'Ready') {
      setStatus('Done');
      
      if (operationId) {
        await updateOperation('Done');
      }
    }
  };

  // Update operation in database
  const updateOperation = async (newStatus) => {
    if (!operationId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/deliveries/${operationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          formData,
          products,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to update delivery');
      } else {
        console.log('Delivery updated successfully');
      }
    } catch (err) {
      console.error('Error updating delivery:', err);
      setError('Failed to update delivery status');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    console.log('Printing delivery...', { formData, products, status });
    alert('Printing delivery order...');
  };

  const handleCancel = () => {
    router.push('/delivery');
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryAddress: formData.deliveryAddress,
          responsible: formData.responsible,
          scheduleDate: formData.scheduleDate,
          operationType: formData.operationType,
          products: products,
          status: status.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError('Only managers can create deliveries');
        } else {
          setError(data.error || 'Failed to create delivery');
        }
        return;
      }

      // Store operation ID for future updates
      if (data.data && data.data._id) {
        setOperationId(data.data._id);
        setFormData(prev => ({
          ...prev,
          reference: data.data.reference,
        }));
      }

      alert('Delivery saved successfully! You can now update its status.');
      // Don't navigate away - allow user to update status
      // router.push('/delivery');
    } catch (err) {
      console.error('Error saving delivery:', err);
      setError('An error occurred while saving the delivery');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is manager
  const isManager = session?.user?.role === 'manager';

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-500 text-xl">Loading delivery data...</div>
      </div>
    );
  }

  // Redirect if not manager and trying to edit
  if (isEditMode && !isManager) {
    return (
      <div className="min-h-screen py-20 bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 p-6 bg-red-900/20 border border-red-700 rounded-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
            <p className="text-gray-300 mb-4">
              Only managers can edit deliveries. You don't have permission to modify this record.
            </p>
            <button
              onClick={() => router.push('/delivery')}
              className="bg-red-900/30 hover:bg-red-900/50 text-white px-6 py-2 rounded border border-red-700 transition font-medium"
            >
              Back to Deliveries
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prevent new delivery creation if not manager
  if (!isEditMode && !isManager) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 p-6 bg-red-900/20 border border-red-700 rounded-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
            <p className="text-gray-300 mb-4">
              Only managers can create new deliveries. You don't have permission to perform this action.
            </p>
            <button
              onClick={() => router.push('/delivery')}
              className="bg-red-900/30 hover:bg-red-900/50 text-white px-6 py-2 rounded border border-red-700 transition font-medium"
            >
              Back to Deliveries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-6 border-b border-red-900/30 pb-6">
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {!operationId && (
              <button 
                onClick={handleSaveDraft}
                disabled={loading}
                className="bg-red-900/30 hover:bg-red-900/50 text-white px-6 py-2 rounded border border-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'New'}
              </button>
            )}
            <h1 className="text-3xl font-bold text-red-500">
              {isEditMode ? `Edit Delivery - ${formData.reference}` : 'New Delivery'}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className={status === 'Draft' ? 'text-red-500 font-semibold' : 'text-gray-400'}>Draft</span>
            <span className="text-red-500">→</span>
            <span className={status === 'Waiting' ? 'text-red-500 font-semibold' : 'text-gray-400'}>Waiting</span>
            <span className="text-red-500">→</span>
            <span className={status === 'Ready' ? 'text-red-500 font-semibold' : 'text-gray-400'}>Ready</span>
            <span className="text-red-500">→</span>
            <span className={status === 'Done' ? 'text-red-500 font-semibold' : 'text-gray-400'}>Done</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Save button - visible when no operationId (not saved yet) */}
          {!operationId && (
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-6 py-2 rounded border border-green-700 text-white bg-green-900/30 hover:bg-green-900/50 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Delivery'}
            </button>
          )}

          {/* TO DO button - only visible when status is Draft and saved */}
          {status === 'Draft' && operationId && (
            <button
              onClick={handleToDo}
              disabled={loading}
              className="px-6 py-2 rounded border border-red-700 text-white bg-red-900/30 hover:bg-red-900/50 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'TO DO'}
            </button>
          )}
          
          {/* Validate button - only visible and enabled when status is Ready */}
          {status === 'Ready' && (
            <button
              onClick={handleValidate}
              disabled={loading}
              className="px-6 py-2 rounded border border-red-700 text-white bg-green-900/30 hover:bg-green-900/50 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Validate'}
            </button>
          )}
          
          {/* Waiting indicator */}
          {status === 'Waiting' && (
            <div className="px-6 py-2 rounded border border-yellow-700 text-yellow-500 bg-yellow-900/20 font-semibold">
              ⏳ Waiting for Stock
            </div>
          )}
          
          {/* Done indicator - visible when status is Done */}
          {status === 'Done' && (
            <div className="px-6 py-2 rounded border border-green-700 text-green-500 bg-green-900/20 font-semibold">
              ✓ Delivered
            </div>
          )}
          
          <button
            onClick={handlePrint}
            className="px-6 py-2 rounded border border-red-700 text-white hover:bg-red-900/30 transition"
          >
            Print
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded border border-red-700 text-white hover:bg-red-900/30 transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Current Status Display */}
      <div className="mb-6 border border-red-900/30 rounded-lg p-4 bg-red-900/10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">Current Status:</span>
            <span className="text-red-500 font-bold text-xl ml-3">{status}</span>
          </div>
          <div className="text-sm text-gray-400">
            {status === 'Draft' && '→ Click "TO DO" to proceed'}
            {status === 'Waiting' && '→ Waiting for out of stock products'}
            {status === 'Ready' && '→ Click "Validate" to mark as Done'}
            {status === 'Done' && '✓ Delivery has been completed'}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="border border-red-900/30 rounded-lg p-6">
        {/* Reference Number */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{formData.reference || 'WH/OUT/0001'}</h2>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-red-500 mb-2">Delivery Address</label>
            <input
              type="text"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleInputChange}
              className="w-full bg-black border-b border-red-700 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="Enter delivery address"
            />
          </div>

          <div>
            <label className="block text-red-500 mb-2">Schedule Date</label>
            <input
              type="date"
              name="scheduleDate"
              value={formData.scheduleDate}
              onChange={handleInputChange}
              className="w-full bg-black border-b border-red-700 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-red-500 mb-2">Responsible</label>
            <input
              type="text"
              name="responsible"
              value={formData.responsible}
              onChange={handleInputChange}
              className="w-full bg-black border-b border-red-700 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="Enter responsible person"
            />
          </div>

          <div>
            <label className="block text-red-500 mb-2">Operation type</label>
            <select
              name="operationType"
              value={formData.operationType}
              onChange={handleInputChange}
              className="w-full bg-black border-b border-red-700 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select operation type</option>
              <option value="delivery">Delivery</option>
              <option value="receipt">Receipt</option>
              <option value="internal">Internal Transfer</option>
              <option value="return">Return</option>
            </select>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-red-500 mb-4">Products</h3>
          
          <div className="border border-red-900/30 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-red-900/50 bg-red-900/20">
                  <th className="text-left py-3 px-4 text-red-500 font-semibold">Product</th>
                  <th className="text-right py-3 px-4 text-red-500 font-semibold">Quantity</th>
                  <th className="text-center py-3 px-4 text-red-500 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr 
                    key={product.id} 
                    className={`border-b border-red-900/20 ${!product.inStock && product.name ? 'bg-red-900/20 border-2 border-red-500' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => {
                          setProducts(prev => prev.map(p => 
                            p.id === product.id ? { ...p, name: e.target.value } : p
                          ));
                        }}
                        className={`bg-transparent border-none text-white focus:outline-none w-full ${
                          !product.inStock && product.name ? 'text-red-400' : ''
                        }`}
                        placeholder="Enter product name"
                      />
                      {!product.inStock && product.name && (
                        <div className="flex items-center gap-2 mt-1">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs text-red-400">
                            {product.stockMessage || 'Out of stock!'} 
                            {product.availableStock !== undefined && ` (Available: ${product.availableStock})`}
                          </p>
                        </div>
                      )}
                      {stockCheckLoading && product.name && (
                        <p className="text-xs text-gray-400 mt-1">Checking stock...</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleProductQuantityChange(product.id, e.target.value)}
                        className="bg-transparent border-none text-white text-right focus:outline-none w-full"
                        min="0"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-500 hover:text-red-400 transition"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Add New Product Row */}
                <tr>
                  <td colSpan="3" className="py-4 px-4">
                    <button
                      onClick={addNewProduct}
                      className="text-red-500 hover:text-red-400 transition text-sm flex items-center gap-2"
                    >
                      <span className="text-xl">+</span>
                      Add New product
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
