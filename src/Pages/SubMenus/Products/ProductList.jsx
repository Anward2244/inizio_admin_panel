import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiLoader, FiSearch, FiUpload, FiX, FiSave, FiImage } from 'react-icons/fi';
import { api, BASE_URL } from '../../../api/axios';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  const cleanPath = path.replace(/\\/g, '/');
  return `${BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 10;
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentProductForImages, setCurrentProductForImages] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [addProductImageFiles, setAddProductImageFiles] = useState([]);
  const navigate = useNavigate();

  const initialFormState = {
    name: '', description: '', details: '', expertNotes: '',
    brand: '', category: '', basePrice: '', offerPrice: '',
    displayPrice: '', l1Price: '', l2Price: '', l3Price: '',
    eanNumber: '', totalQuantity: '', cancellationPolicy: '',
    sevenDaysReturn: '', warranty: '', image_urls: ''
  };
  const [addFormData, setAddFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [prodRes, brandRes, catRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/products/`, { headers }),
          axios.get(`${BASE_URL}/api/brands/`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${BASE_URL}/api/categories/`, { headers }).catch(() => ({ data: [] }))
        ]);
        
        setProducts(prodRes.data);
        setBrands(brandRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
// console.log(products)

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Product?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${BASE_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setEditFormData({
      _id: product._id,
      name: product.name || '',
      description: product.description || '',
      details: product.details || '',
      expertNotes: product.expertNotes || '',
      brand: product.brand?._id || product.brand || '',
      category: product.category?._id || product.category || '',
      basePrice: product.basePrice || '',
      offerPrice: product.offerPrice || '',
      displayPrice: product.displayPrice || '',
      l1Price: product.l1Price || '',
      l2Price: product.l2Price || '',
      l3Price: product.l3Price || '',
      eanNumber: product.eanNumber || '',
      totalQuantity: product.totalQuantity || '',
      cancellationPolicy: product.cancellationPolicy || '',
      sevenDaysReturn: product.sevenDaysReturn || '',
      warranty: product.warranty || '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormData(null);
    // navigate(`/products/variants/${editFormData._id}`);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        name: editFormData.name,
        description: editFormData.description,
        details: editFormData.details,
        expertNotes: editFormData.expertNotes,
        brand: editFormData.brand,
        category: editFormData.category,
        basePrice: Number(editFormData.basePrice) || 0,
        offerPrice: Number(editFormData.offerPrice) || 0,
        displayPrice: Number(editFormData.displayPrice) || 0,
        l1Price: Number(editFormData.l1Price) || 0,
        l2Price: Number(editFormData.l2Price) || 0,
        l3Price: Number(editFormData.l3Price) || 0,
        eanNumber: Number(editFormData.eanNumber) || null,
        totalQuantity: Number(editFormData.totalQuantity) || 0,
        cancellationPolicy: editFormData.cancellationPolicy,
        sevenDaysReturn: editFormData.sevenDaysReturn,
        warranty: editFormData.warranty,
      };
      
      const response = await axios.put(`${BASE_URL}/api/products/${editFormData._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedProduct = response.data?.product || response.data?.data || response.data;
      setProducts(products.map(p => p._id === editFormData._id ? { ...updatedProduct, _id: p._id } : p));
      closeEditModal();
    } catch (error) {
      console.error('Failed to update product', error);
      alert(error.response?.data?.message || 'Failed to update product');
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddFormData(initialFormState);
    setAddProductImageFiles([]);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      
      const payload = {
        name: addFormData.name,
        description: addFormData.description,
        details: addFormData.details,
        expertNotes: addFormData.expertNotes,
        brand: addFormData.brand,
        category: addFormData.category,
        basePrice: Number(addFormData.basePrice) || 0,
        offerPrice: Number(addFormData.offerPrice) || 0,
        displayPrice: Number(addFormData.displayPrice) || 0,
        l1Price: Number(addFormData.l1Price) || 0,
        l2Price: Number(addFormData.l2Price) || 0,
        l3Price: Number(addFormData.l3Price) || 0,
        eanNumber: Number(addFormData.eanNumber) || null,
        totalQuantity: Number(addFormData.totalQuantity) || 0,
        cancellationPolicy: addFormData.cancellationPolicy,
        sevenDaysReturn: addFormData.sevenDaysReturn,
        warranty: addFormData.warranty,
        images: addFormData.image_urls ? addFormData.image_urls.split(',').map(url => url.trim()).filter(Boolean) : []
      };

      const response = await axios.post(`${BASE_URL}/api/products/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let addedProduct = response.data?.product || response.data?.data || response.data;

      // If there are file uploads, handle them via a secondary PUT request
      if (addProductImageFiles.length > 0 && addedProduct?._id) {
        const imgFormData = new FormData();
        imgFormData.append('name', addedProduct.name);
        imgFormData.append('description', addedProduct.description || '');
        imgFormData.append('details', addedProduct.details || '');
        imgFormData.append('expertNotes', addedProduct.expertNotes || '');
        imgFormData.append('basePrice', addedProduct.basePrice || 0);
        imgFormData.append('offerPrice', addedProduct.offerPrice || 0);
        imgFormData.append('displayPrice', addedProduct.displayPrice || 0);
        imgFormData.append('l1Price', addedProduct.l1Price || 0);
        imgFormData.append('l2Price', addedProduct.l2Price || 0);
        imgFormData.append('l3Price', addedProduct.l3Price || 0);
        imgFormData.append('totalQuantity', addedProduct.totalQuantity || 0);
        imgFormData.append('eanNumber', addedProduct.eanNumber || '');
        imgFormData.append('sevenDaysReturn', addedProduct.sevenDaysReturn || '');
        imgFormData.append('warranty', addedProduct.warranty || '');
        imgFormData.append('cancellationPolicy', addedProduct.cancellationPolicy || '');
        
        const brandId = typeof addedProduct.brand === 'object' ? addedProduct.brand?._id : addedProduct.brand;
        const catId = typeof addedProduct.category === 'object' ? addedProduct.category?._id : addedProduct.category;
        
        if (brandId) imgFormData.append('brand', brandId);
        if (catId) imgFormData.append('category', catId);
    
        const v = addedProduct.variants || [];
        imgFormData.append('variants', JSON.stringify(v));

        addProductImageFiles.forEach(file => {
          imgFormData.append('images', file);
        });

        const imgResponse = await axios.put(`${BASE_URL}/api/products/${addedProduct._id}`, imgFormData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        addedProduct = imgResponse.data?.product || imgResponse.data?.data || imgResponse.data;
      }

      setProducts([addedProduct, ...products]);
      closeAddModal();
    } catch (error) {
      console.error('Failed to add product', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to add product');
    }
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(productId => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await Promise.all(selectedProducts.map(id => 
          axios.delete(`${BASE_URL}/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
        setProducts(products.filter(p => !selectedProducts.includes(p._id)));
        setSelectedProducts([]);
      } catch (error) {
        console.error('Failed to bulk delete products', error);
        alert('Failed to delete some or all selected products.');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('CSV file selected:', file.name);
      // Implement CSV parsing or upload logic here (e.g., using FormData or PapaParse)
    }
  };

  const openImageModal = (product) => {
    setCurrentProductForImages(product);
    setExistingImages(product.images || []);
    setNewImageFiles([]);
    setIsImageModalOpen(true);
  };

  const handleImageSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      
      formData.append('name', currentProductForImages.name);
      formData.append('description', currentProductForImages.description || '');
      formData.append('details', currentProductForImages.details || '');
      formData.append('expertNotes', currentProductForImages.expertNotes || '');
      formData.append('basePrice', currentProductForImages.basePrice || 0);
      formData.append('offerPrice', currentProductForImages.offerPrice || 0);
      formData.append('displayPrice', currentProductForImages.displayPrice || 0);
      formData.append('l1Price', currentProductForImages.l1Price || 0);
      formData.append('l2Price', currentProductForImages.l2Price || 0);
      formData.append('l3Price', currentProductForImages.l3Price || 0);
      formData.append('totalQuantity', currentProductForImages.totalQuantity || 0);
      formData.append('eanNumber', currentProductForImages.eanNumber || '');
      formData.append('sevenDaysReturn', currentProductForImages.sevenDaysReturn || '');
      formData.append('warranty', currentProductForImages.warranty || '');
      formData.append('cancellationPolicy', currentProductForImages.cancellationPolicy || '');
      
      const brandId = typeof currentProductForImages.brand === 'object' ? currentProductForImages.brand?._id : currentProductForImages.brand;
      const catId = typeof currentProductForImages.category === 'object' ? currentProductForImages.category?._id : currentProductForImages.category;
      
      if (brandId) formData.append('brand', brandId);
      if (catId) formData.append('category', catId);
  
      const v = currentProductForImages.variants || [];
      formData.append('variants', JSON.stringify(v));
      
      existingImages.forEach(img => {
        formData.append('images', img);
      });

      newImageFiles.forEach(file => {
        formData.append('images', file);
      });
  
      const response = await axios.put(`${BASE_URL}/api/products/${currentProductForImages._id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setProducts(products.map(p => p._id === currentProductForImages._id ? { ...response.data, _id: p._id } : p));
      setIsImageModalOpen(false);
    } catch (error) {
       console.error('Failed to update images', error);
       alert(error.response?.data?.message || 'Failed to update images');
    }
  };

  const getBrandName = (brandId) => {
    if (!brandId) return '-';
    if (brandId.name) return brandId.name;
    const b = brands.find(item => item._id === brandId);
    return b ? b.name : '-';
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '-';
    if (categoryId.name) return categoryId.name;
    const c = categories.find(item => item._id === categoryId);
    return c ? c.name : '-';
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    const ean = product.eanNumber?.toString() || '';
    return (
      product.name?.toLowerCase().includes(term) || ean.includes(term) ||
      getBrandName(product.brand).toLowerCase().includes(term) ||
      getCategoryName(product.category).toLowerCase().includes(term)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentIds = currentProducts.map(p => p._id);
      const newSelected = [...new Set([...selectedProducts, ...currentIds])];
      setSelectedProducts(newSelected);
    } else {
      const currentIds = currentProducts.map(p => p._id);
      setSelectedProducts(selectedProducts.filter(id => !currentIds.includes(id)));
    }
  };
  // console.log(currentPage)

  return (
    <div className="relative space-y-6 min-h-full z-0">
      {/* Glassmorphism Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[80px] opacity-50 pointer-events-none z-[-1]"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none z-[-1]"></div>

      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Product List</h1>
            <p className="text-slate-400 font-medium mt-1">View and manage all products in your catalog.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
            onChange={(e) => {
              setSearchParams(prev => {
                if (e.target.value) {
                  prev.set('search', e.target.value);
                } else {
                  prev.delete('search');
                }
                prev.set('page', 1);
                return prev;
              }, { replace: true });
            }}
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-black/40 shadow-inner backdrop-blur-md transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
          {selectedProducts.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center justify-center px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-100 hover:text-red-600 transition-all border border-red-600 shadow-sm cursor-pointer"
            >
              <FiTrash2 className="mr-2" />
              Delete ({selectedProducts.length})
            </button>
          )}
          <div>
            <input 
              type="file" 
              id="csv-upload" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <label htmlFor="csv-upload" className="flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 cursor-pointer">
              <FiUpload className="mr-2" />
              Upload CSV
            </label>
          </div>
          <button onClick={openAddModal} className="flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 cursor-pointer">
            <FiPlus className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden flex flex-col h-full">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-800/50 border-b border-white/10 border-collapse text-slate-300 text-sm">
              <tr>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-500 bg-slate-800 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all cursor-pointer accent-blue-500 scheme-dark"
                    checked={currentProducts.length > 0 && currentProducts.every(p => selectedProducts.includes(p._id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">S.No</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">Brand</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">Category</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">Product Name</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">Base Price</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">Offer Price</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">Display Price</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">Total Qty</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">EAN</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs">Description</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs text-center">Images</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider text-xs text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="17" className="px-6 py-12 text-center text-slate-400 font-medium">
                    <FiLoader className="animate-spin text-3xl mx-auto mb-3 text-blue-400" />
                    Loading products...
                  </td>
                </tr>
              ) : currentProducts.length > 0 ? (
                currentProducts.map((product, index) => {
                  return (
                    <tr key={product._id || index} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-500 bg-slate-800 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all cursor-pointer accent-blue-500 scheme-dark"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-400">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 font-medium">{getBrandName(product.brand)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 font-medium">{getCategoryName(product.category)}</td>
                      <td className="px-4 py-3 text-sm text-white font-bold">{product.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400 font-bold">{product.basePrice ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-emerald-400 font-bold">{product.offerPrice ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{product.displayPrice ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{product.totalQuantity ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{product.eanNumber ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate" title={product.description}>
                        {product.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => openImageModal(product)} 
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-blue-900/30 hover:text-blue-400 rounded-lg transition-colors text-xs font-bold border border-white/10 cursor-pointer flex items-center justify-center mx-auto"
                        >
                          <FiImage className="mr-1.5" /> {product.images?.length || 0}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer" title="Edit Product">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer" title="Delete Product">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="17" className="px-6 py-12 text-center text-slate-400 font-medium">
                    {searchTerm ? 'No products matching your search.' : 'No products found. Add your first product.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-end items-center px-6 py-4 border-t border-white/10 bg-slate-800/50">
            {/* <span className="text-sm text-slate-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} entries
            </span> */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setSearchParams(prev => {
                    prev.set('page', Math.max(currentPage - 1, 1));
                    return prev;
                  });
                }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 transition-colors"
              >
                Previous
              </button>
              <p className='py-1.5 text-slate-500'>Page <span className='text-white bold text-lg'>{currentPage}</span> of {totalPages}</p>
              <button 
                onClick={() => {
                  setSearchParams(prev => {
                    prev.set('page', Math.min(currentPage + 1, totalPages));
                    return prev;
                  });
                }}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/50 text-blue-400 flex items-center justify-center text-lg">
                  <FiEdit2 />
                </div>
                <h2 className="text-xl font-bold text-white">Edit Product</h2>
              </div>
              <button onClick={closeEditModal} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="editProductForm" onSubmit={handleEditSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Brand</label>
                  <select name="brand" value={editFormData.brand || ''} onChange={handleEditChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium">
                    <option value="" className="bg-slate-800">Select Brand</option>
                    {brands.map(b => <option key={b._id} value={b._id} className="bg-slate-800">{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select name="category" value={editFormData.category || ''} onChange={handleEditChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium">
                    <option value="" className="bg-slate-800">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id} className="bg-slate-800">{c.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Product Name</label>
                  <input type="text" name="name" value={editFormData.name || ''} onChange={handleEditChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">EAN Number</label>
                  <input type="number" name="eanNumber" value={editFormData.eanNumber || ''} onChange={handleEditChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Base Price</label>
                  <input type="number" name="basePrice" value={editFormData.basePrice || ''} onChange={handleEditChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Offer Price</label>
                  <input type="number" name="offerPrice" value={editFormData.offerPrice || ''} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Display Price</label>
                  <input type="number" name="displayPrice" value={editFormData.displayPrice || ''} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">L1 Price</label>
                  <input type="number" name="l1Price" value={editFormData.l1Price || ''} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">L2 Price</label>
                  <input type="number" name="l2Price" value={editFormData.l2Price || ''} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">L3 Price</label>
                  <input type="number" name="l3Price" value={editFormData.l3Price || ''} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Total Quantity</label>
                  <input type="number" name="totalQuantity" value={editFormData.totalQuantity || ''} onChange={handleEditChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Warranty</label>
                  <input type="text" name="warranty" value={editFormData.warranty || ''} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">7 Days Return Policy</label>
                  <input type="text" name="sevenDaysReturn" value={editFormData.sevenDaysReturn || ''} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Description</label>
                  <textarea name="description" value={editFormData.description || ''} onChange={handleEditChange} rows="3" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium resize-none placeholder-slate-500"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Details</label>
                  <textarea name="details" value={editFormData.details || ''} onChange={handleEditChange} rows="3" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium resize-none placeholder-slate-500"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Expert Notes</label>
                  <textarea name="expertNotes" value={editFormData.expertNotes || ''} onChange={handleEditChange} rows="3" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium resize-none placeholder-slate-500"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Cancellation Policy</label>
                  <textarea name="cancellationPolicy" value={editFormData.cancellationPolicy || ''} onChange={handleEditChange} rows="3" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium resize-none placeholder-slate-500"></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-white/10 bg-slate-800/50 flex justify-between gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => navigate(`/products/variants/${editFormData._id}`)}
                className="px-5 py-2.5 bg-indigo-900/30 text-indigo-400 font-bold rounded-xl hover:bg-indigo-900/50 transition-colors border border-indigo-500/30"
              >
                Add / Manage Variants
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={closeEditModal} className="px-5 py-2.5 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" form="editProductForm" className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                  <FiSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/50 text-blue-400 flex items-center justify-center text-lg">
                  <FiPlus />
                </div>
                <h2 className="text-xl font-bold text-white">Add New Product</h2>
              </div>
              <button onClick={closeAddModal} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="addProductForm" onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Brand</label>
                  <select name="brand" value={addFormData.brand} onChange={handleAddChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium">
                    <option value="" className="bg-slate-800">Select Brand</option>
                    {brands.map(b => <option key={b._id} value={b._id} className="bg-slate-800">{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select name="category" value={addFormData.category} onChange={handleAddChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium">
                    <option value="" className="bg-slate-800">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id} className="bg-slate-800">{c.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Product Name</label>
                  <input type="text" name="name" value={addFormData.name} onChange={handleAddChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">EAN Number</label>
                  <input type="number" name="eanNumber" value={addFormData.eanNumber} onChange={handleAddChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Base Price</label>
                  <input type="number" name="basePrice" value={addFormData.basePrice} onChange={handleAddChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Offer Price</label>
                  <input type="number" name="offerPrice" value={addFormData.offerPrice} onChange={handleAddChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Display Price</label>
                  <input type="number" name="displayPrice" value={addFormData.displayPrice} onChange={handleAddChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">L1 Price</label>
                  <input type="number" name="l1Price" value={addFormData.l1Price} onChange={handleAddChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">L2 Price</label>
                  <input type="number" name="l2Price" value={addFormData.l2Price} onChange={handleAddChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">L3 Price</label>
                  <input type="number" name="l3Price" value={addFormData.l3Price} onChange={handleAddChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Total Quantity</label>
                  <input type="number" name="totalQuantity" value={addFormData.totalQuantity} onChange={handleAddChange} required className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Warranty</label>
                  <input type="text" name="warranty" value={addFormData.warranty} onChange={handleAddChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">7 Days Return Policy</label>
                  <input type="text" name="sevenDaysReturn" value={addFormData.sevenDaysReturn} onChange={handleAddChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Description</label>
                  <textarea name="description" value={addFormData.description} onChange={handleAddChange} rows="3" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium resize-none placeholder-slate-500"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Details</label>
                  <textarea name="details" value={addFormData.details} onChange={handleAddChange} rows="3" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium resize-none placeholder-slate-500"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Expert Notes</label>
                  <textarea name="expertNotes" value={addFormData.expertNotes} onChange={handleAddChange} rows="3" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium resize-none placeholder-slate-500"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Cancellation Policy</label>
                  <textarea name="cancellationPolicy" value={addFormData.cancellationPolicy} onChange={handleAddChange} rows="3" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium resize-none placeholder-slate-500"></textarea>
                </div>

                {/* Image URLs Section */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Image URLs (comma separated)</label>
                  <input type="text" name="image_urls" value={addFormData.image_urls} onChange={handleAddChange} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder-slate-500" />
                  {addFormData.image_urls && addFormData.image_urls.split(',').filter(url => url.trim()).length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {addFormData.image_urls.split(',').map((url, i) => url.trim() && (
                        <div key={i} className="relative w-16 h-16 border border-white/10 rounded-lg overflow-hidden bg-slate-800 shadow-sm shrink-0">
                          <img src={getImageUrl(url.trim())} alt={`Preview ${i}`} className="w-full h-full object-contain bg-white p-1" onError={(e) => e.target.src='https://placehold.co/150x150?text=Error'} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Upload Section */}
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-bold text-slate-300 mb-3">Product Images</h3>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => setAddProductImageFiles([...addProductImageFiles, ...Array.from(e.target.files)])}
                      className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/50 file:text-blue-400 hover:file:bg-blue-800/50 transition-colors cursor-pointer"
                    />
                  </div>
                  {addProductImageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-4 p-4 bg-slate-800/50 border border-white/10 rounded-xl">
                      {addProductImageFiles.map((file, i) => (
                        <div key={i} className="relative w-28 h-28 border border-white/10 rounded-xl overflow-hidden group bg-slate-800 shadow-sm">
                          <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain bg-white p-2" />
                          <button 
                            type="button"
                            onClick={() => setAddProductImageFiles(addProductImageFiles.filter((_, index) => index !== i))}
                            className="absolute top-2 right-2 bg-slate-900/90 text-red-400 hover:bg-red-600 hover:text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                            title="Remove File"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-white/10 bg-slate-800/50 flex justify-end gap-3 shrink-0">
              <button onClick={closeAddModal} className="px-5 py-2.5 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" form="addProductForm" className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                <FiPlus className="mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && currentProductForImages && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/50 text-blue-400 flex items-center justify-center text-lg">
                  <FiImage />
                </div>
                <h2 className="text-xl font-bold text-white">Manage Images - {currentProductForImages.name}</h2>
              </div>
              <button onClick={() => setIsImageModalOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* Existing Images */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-3">Current Images</h3>
                {existingImages.length === 0 ? (
                  <p className="text-sm text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-white/10">No images available for this product.</p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {existingImages.map((url, i) => (
                      <div key={i} className="relative w-28 h-28 border border-white/10 rounded-xl overflow-hidden group bg-slate-800">
                        <img src={getImageUrl(url)} alt="Product" className="w-full h-full object-contain bg-white p-2" />
                        <button 
                          onClick={() => setExistingImages(existingImages.filter((_, index) => index !== i))}
                          className="absolute top-2 right-2 bg-slate-900/90 text-red-400 hover:bg-red-600 hover:text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                          title="Remove Image"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload New Images */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-3">Upload New Images</h3>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => setNewImageFiles([...newImageFiles, ...Array.from(e.target.files)])}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/50 file:text-blue-400 hover:file:bg-blue-800/50 transition-colors cursor-pointer"
                  />
                </div>
                {newImageFiles.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4 p-4 bg-slate-800/50 border border-white/10 rounded-xl">
                    {newImageFiles.map((file, i) => (
                      <div key={i} className="relative w-28 h-28 border border-white/10 rounded-xl overflow-hidden group bg-slate-800 shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain bg-white p-2" />
                        <button 
                          onClick={() => setNewImageFiles(newImageFiles.filter((_, index) => index !== i))}
                          className="absolute top-2 right-2 bg-slate-900/90 text-red-400 hover:bg-red-600 hover:text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                          title="Remove File"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-white/10 bg-slate-800/50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsImageModalOpen(false)} className="px-5 py-2.5 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleImageSave} className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 cursor-pointer">
                <FiSave className="mr-2" />
                Save Images
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;