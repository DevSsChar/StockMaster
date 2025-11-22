'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewReceiptForm({ operationId: propOperationId, isEditMode = false }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [status, setStatus] = useState('Draft'); // Draft -> Ready -> Done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operationId, setOperationId] = useState(propOperationId || null);
  const [dataLoading, setDataLoading] = useState(isEditMode);
  
  const [formData, setFormData] = useState({
    reference: '',
    receiveFrom: '',
    responsible: '',
    scheduleDate: '',
  });

  const [products, setProducts] = useState([]);

  // Fetch existing receipt data in edit mode
  useEffect(() => {
    const fetchReceiptData = async () => {
      if (!isEditMode || !propOperationId) return;

      setDataLoading(true);
      try {
        const response = await fetch(`/api/receipts/${propOperationId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          const receipt = data.data;
          
          // Set form data
          setFormData({
            reference: receipt.reference || '',
            receiveFrom: receipt.sourceLocation?.address || '',
            responsible: receipt.responsible || '',
            scheduleDate: receipt.scheduledDate 
              ? new Date(receipt.scheduledDate).toISOString().split('T')[0] 
              : '',
          });

          // Set products from lines
          if (receipt.lines && receipt.lines.length > 0) {
            setProducts(receipt.lines.map((line, index) => ({
              id: index + 1,
              name: line.product?.name || '',
              quantity: line.quantity || 0,
              productId: line.product?._id || '',
            })));
          }

          // Set status
          const statusMap = {
            draft: 'Draft',
            ready: 'Ready',
            done: 'Done',
            cancelled: 'Cancelled',
          };
          setStatus(statusMap[receipt.status] || 'Draft');
        } else {
          setError('Failed to load receipt data');
        }
      } catch (err) {
        console.error('Error fetching receipt:', err);
        setError('Failed to load receipt data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchReceiptData();
  }, [isEditMode, propOperationId]);

  // Auto-fill responsible with logged-in user (only for new receipts)
  useEffect(() => {
    if (!isEditMode && session?.user?.name && !formData.responsible) {
      setFormData(prev => ({
        ...prev,
        responsible: session.user.name
      }));
    }
  }, [session, formData.responsible, isEditMode]);

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
      quantity: 0
    }]);
  };

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Handle TO DO button - Move from Draft to Ready and update DB
  const handleToDo = async () => {
    if (status === 'Draft') {
      setStatus('Ready');
      
      if (operationId) {
        await updateOperation('Ready');
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
      const response = await fetch(`/api/receipts/${operationId}`, {
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
        setError(data.error || 'Failed to update receipt');
      } else {
        console.log('Receipt updated successfully');
      }
    } catch (err) {
      console.error('Error updating receipt:', err);
      setError('Failed to update receipt status');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    console.log('Printing receipt...', { formData, products, status });
    alert('Printing receipt order...');
  };

  const handleCancel = () => {
    router.push('/receipts');
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiveFrom: formData.receiveFrom,
          responsible: formData.responsible,
          scheduleDate: formData.scheduleDate,
          products: products,
          status: status.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError('Only managers can create receipts');
        } else {
          setError(data.error || 'Failed to create receipt');
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

      alert('Receipt saved successfully! You can now update its status.');
      // Don't navigate away - allow user to update status
      // router.push('/receipts');
    } catch (err) {
      console.error('Error saving receipt:', err);
      setError('An error occurred while saving the receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!operationId) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/receipts/${operationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status.toLowerCase(),
          formData,
          products,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to update receipt');
      } else {
        alert('Changes saved successfully!');
      }
    } catch (err) {
      console.error('Error updating receipt:', err);
      setError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is manager
  const isManager = session?.user?.role === 'manager';

  if (dataLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect if not manager and trying to edit
  if (isEditMode && !isManager) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 p-6 bg-red-100 border border-red-400 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h2>
            <p className="text-gray-700 mb-4">
              Only managers can edit receipts. You don't have permission to modify this record.
            </p>
            <button
              onClick={() => router.push('/receipts')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Back to Receipts
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prevent new receipt creation if not manager
  if (!isEditMode && !isManager) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 p-6 bg-red-100 border border-red-400 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h2>
            <p className="text-gray-700 mb-4">
              Only managers can create new receipts. You don't have permission to perform this action.
            </p>
            <button
              onClick={() => router.push('/receipts')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Back to Receipts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] pt-20 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6 border-b border-gray-300 pb-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {!operationId && (
              <button 
                onClick={handleSaveDraft}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? `Edit Receipt - ${formData.reference}` : 'New Receipt'}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className={status === 'Draft' ? 'text-purple-600 font-semibold' : 'text-gray-400'}>Draft</span>
            <span className="text-gray-400">→</span>
            <span className={status === 'Ready' ? 'text-purple-600 font-semibold' : 'text-gray-400'}>Ready</span>
            <span className="text-gray-400">→</span>
            <span className={status === 'Done' ? 'text-purple-600 font-semibold' : 'text-gray-400'}>Done</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Save Changes button - visible in edit mode */}
          {operationId && isEditMode && (
            <button
              onClick={handleSaveChanges}
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}

          {/* TO DO button - only visible when status is Draft */}
          {status === 'Draft' && (
            <button
              onClick={handleToDo}
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'TO DO'}
            </button>
          )}
          
          {/* Validate button - only visible and enabled when status is Ready */}
          {status === 'Ready' && (
            <button
              onClick={handleValidate}
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Validate'}
            </button>
          )}
          
          {/* Done indicator - visible when status is Done */}
          {status === 'Done' && (
            <div className="px-6 py-2 rounded-lg border border-green-400 text-green-700 bg-green-100 font-semibold">
              ✓ Received
            </div>
          )}
          
          <button
            onClick={handlePrint}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
          >
            Print
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Current Status Display */}
      <div className="mb-6 border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-600 text-sm">Current Status:</span>
            <span className="text-purple-600 font-bold text-xl ml-3">{status}</span>
          </div>
          <div className="text-sm text-gray-400">
            {status === 'Draft' && '→ Click "TO DO" to move to Ready'}
            {status === 'Ready' && '→ Click "Validate" to mark as Done'}
            {status === 'Done' && '✓ Receipt has been received'}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
        {/* Reference Number */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{formData.reference || 'WH/IN/0001'}</h2>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Receive From</label>
            <input
              type="text"
              name="receiveFrom"
              value={formData.receiveFrom}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter vendor/supplier"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Schedule Date</label>
            <input
              type="date"
              name="scheduleDate"
              value={formData.scheduleDate}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Responsible</label>
            <input
              type="text"
              name="responsible"
              value={formData.responsible}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={session?.user?.name || "Auto fill with the current logged in users."}
            />
            <p className="text-xs text-gray-500 mt-1">Auto fill with the current logged in users.</p>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Products</h3>
          
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Product</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Quantity</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr 
                    key={product.id} 
                    className="border-b border-gray-200 bg-white"
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
                        className="bg-transparent border-none text-gray-900 focus:outline-none w-full"
                        placeholder="Enter product name"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleProductQuantityChange(product.id, e.target.value)}
                        className="bg-transparent border-none text-gray-900 text-right focus:outline-none w-full"
                        min="0"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:text-red-700 transition"
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
                  <td colSpan="3" className="py-4 px-4 bg-gray-50">
                    <button
                      onClick={addNewProduct}
                      className="text-purple-600 hover:text-purple-700 transition text-sm flex items-center gap-2 font-medium"
                    >
                      <span className="text-xl">+</span>
                      New Product
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
