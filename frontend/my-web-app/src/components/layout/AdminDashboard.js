import React, { useState, useEffect } from 'react';
import { useAuth } from '../../models/AuthProvider';
import '../../assets/css/AdminDashboard.css';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [activeTable, setActiveTable] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingCell, setEditingCell] = useState({ rowId: null, column: null });
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const tables = [
        { id: 'device', name: 'Devices' },
        { id: 'device_color', name: 'Device Colors' },
        { id: 'device_images', name: 'Device Images' },
        { id: 'device_promo', name: 'Device Promotions' },
        { id: 'device_specs', name: 'Device Specifications' },
        { id: 'coupons', name: 'Coupons' },
        { id: 'order_details', name: 'Order Details' },
        { id: 'orders', name: 'Orders' }
    ];

    useEffect(() => {
        if (activeTable) {
            fetchTableData();
        }
    }, [activeTable]);

    const fetchTableData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/${activeTable}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch table data');
            }

            const data = await response.json();
            setTableData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData(item);
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/admin/${activeTable}/${editingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update item');
            }

            setEditingItem(null);
            fetchTableData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAdd = async () => {
        // Validate form
        const errors = validateForm(formData);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return; // Don't submit if there are errors
        }

        try {
            // Remove any ID fields from the form data
            const dataToSend = { ...formData };
            delete dataToSend.ID;
            delete dataToSend.id;

            const response = await fetch(`/api/admin/${activeTable}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorModalMessage(
                    `Unable to add new record. This might be because:\n\n` +
                    `• You don't have permission to add records\n` +
                    `• The data conflicts with existing records\n` +
                    `• Required fields are missing or invalid\n\n` +
                    `Server message: ${data.message || 'Unknown error'}`
                );
                setShowErrorModal(true);
                // Don't throw error here, just return to maintain table data
                return;
            }

            // Only if successful:
            await fetchTableData(); // Refresh the table data
            setShowAddForm(false);
            setFormData({});
            setFormErrors({});
        } catch (err) {
            console.error('Add error:', err);
            setErrorModalMessage(
                `A server error occurred while adding the record.\n\n` +
                `Please try again or contact support if the problem persists.`
            );
            setShowErrorModal(true);
            // Don't set error state to maintain table data
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCellClick = (item, column) => {
        // Don't allow editing of ID fields or certain columns
        const nonEditableColumns = ['ID', 'id', 'specifications', 'image_url'];
        if (nonEditableColumns.includes(column)) return;

        setEditingCell({ rowId: item.ID || item.id, column });
        setFormData({ ...formData, [column]: item[column] });
    };

    // New function to handle ID cell click to copy data for new item
    const handleIdCellClick = (item) => {
        // Create a copy of the item data without the ID fields
        const newItemData = { ...item };
        delete newItemData.ID;
        delete newItemData.id;
        
        // Set the form data with the copied item data
        setFormData(newItemData);
        
        // Show the add form
        setShowAddForm(true);
    };

    const handleCellUpdate = async (item) => {
        // Store the original value before attempting update
        const originalValue = item[editingCell.column];

        try {
            const response = await fetch(`/api/admin/${activeTable}/${item.ID || item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [editingCell.column]: formData[editingCell.column] })
            });

            const data = await response.json();

            if (!response.ok) {
                // Show error modal with specific message
                setErrorModalMessage(
                    `Unable to update ${editingCell.column}. This might be because:\n\n` +
                    `• This field is referenced by other tables\n` +
                    `• The value conflicts with existing constraints\n` +
                    `• The field requires a specific format or type\n\n` +
                    `Server message: ${data.message || 'Unknown error'}`
                );
                setShowErrorModal(true);

                // Revert the value in the table data
                setTableData(tableData.map(row => {
                    if ((row.ID || row.id) === (item.ID || item.id)) {
                        return { ...row, [editingCell.column]: originalValue };
                    }
                    return row;
                }));

                throw new Error(data.message || 'Failed to update item');
            }

            // Update the local data only if successful
            setTableData(tableData.map(row => {
                if ((row.ID || row.id) === (item.ID || item.id)) {
                    return { ...row, [editingCell.column]: formData[editingCell.column] };
                }
                return row;
            }));

            // Reset editing state
            setEditingCell({ rowId: null, column: null });
            setFormData({});
        } catch (err) {
            console.error('Update error:', err);
            // Error modal is already shown if response wasn't ok
            if (!err.message.includes('Failed to update item')) {
                setErrorModalMessage(
                    `An unexpected error occurred while updating ${editingCell.column}.\n\n` +
                    `Please try again or contact support if the problem persists.`
                );
                setShowErrorModal(true);

                // Revert the value in the table data for unexpected errors too
                setTableData(tableData.map(row => {
                    if ((row.ID || row.id) === (item.ID || item.id)) {
                        return { ...row, [editingCell.column]: originalValue };
                    }
                    return row;
                }));
            }

            // Reset editing state
            setEditingCell({ rowId: null, column: null });
            setFormData({});
        }
    };

    const handleKeyPress = (e, item) => {
        if (e.key === 'Enter') {
            handleCellUpdate(item);
        } else if (e.key === 'Escape') {
            setEditingCell({ rowId: null, column: null });
            setFormData({});
        }
    };

    const handleDelete = async (item) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`/api/admin/${activeTable}/${itemToDelete.ID || itemToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorModalMessage(
                    `Unable to delete this record. This might be because:\n\n` +
                    `• This record is referenced by other tables\n` +
                    `• You don't have permission to delete this record\n\n` +
                    `Server message: ${data.message || 'Unknown error'}`
                );
                setShowErrorModal(true);
                setShowDeleteConfirm(false);
                return;
            }

            // Remove the item from the local state
            setTableData(tableData.filter(row =>
                (row.ID || row.id) !== (itemToDelete.ID || itemToDelete.id)
            ));
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        } catch (err) {
            console.error('Delete error:', err);
            setErrorModalMessage('An unexpected error occurred while trying to delete the record.');
            setShowErrorModal(true);
            setShowDeleteConfirm(false);
        }
    };

    const renderCell = (item, column, value) => {
        const isEditing = editingCell.rowId === (item.ID || item.id) && editingCell.column === column;

        if (isEditing) {
            return (
                <input
                    type={column === 'price' ? 'number' : 'text'}
                    step={column === 'price' ? '0.01' : undefined}
                    value={formData[column] || ''}
                    onChange={(e) => setFormData({ ...formData, [column]: e.target.value })}
                    onKeyDown={(e) => handleKeyPress(e, item)}
                    onBlur={() => handleCellUpdate(item)}
                    autoFocus
                />
            );
        }

        return (
            <div
                onClick={() => handleCellClick(item, column)}
                className={`cell-content ${!['ID', 'id', 'specifications', 'image_url'].includes(column) ? 'editable' : ''}`}
            >
                {renderCellValue(column, value)}
            </div>
        );
    };

    const renderActionButtons = (item) => {
        if (editingCell.rowId === (item.ID || item.id)) {
            return (
                <>
                    <button className="save-btn" onClick={() => handleCellUpdate(item)}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditingCell({ rowId: null, column: null })}>Cancel</button>
                </>
            );
        }
        return (
            <>
                <button className="delete-btn" onClick={() => handleDelete(item)}>Delete</button>
            </>
        );
    };

    const renderTable = () => {
        if (!activeTable) return <div className="select-table-message">Please select a table from the list</div>;
        if (loading) return <div className="loading">Loading...</div>;
        if (error) return <div className="error">{error}</div>;
        if (!tableData.length) return <div className="no-data">No data available</div>;

        // Get all unique keys from the data and filter out ID fields and internal fields
        const columns = Array.from(new Set(tableData.flatMap(item => Object.keys(item))))
            .filter(col =>
                !col.includes('__') &&
                col !== 'specifications' &&
                col !== 'device_type_name'
            );

        // Separate ID column from other columns
        const idColumn = columns.find(col => col === 'ID' || col === 'id');
        const editableColumns = columns.filter(col => col !== 'ID' && col !== 'id');

        return (
            <div className="table-container">
                <div className="table-header">
                    <h2>{tables.find(t => t.id === activeTable)?.name}</h2>
                    <button onClick={() => {
                        setFormData({});  // Clear form data when clicking Add New directly
                        setShowAddForm(true);
                    }} className="add-button">
                        Add New
                    </button>
                </div>

                <div className="table-scroll-container">
                    <table>
                        <thead>
                            <tr>
                                {idColumn && <th>{formatColumnHeader(idColumn)}</th>}
                                {editableColumns.map(column => (
                                    <th key={column}>{formatColumnHeader(column)}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((item, index) => (
                                <tr key={item.ID || item.id || index}>
                                    {idColumn && (
                                        <td 
                                            className="id-cell clickable-id" 
                                            onClick={() => handleIdCellClick(item)}
                                            title="Click to copy data for a new item"
                                        >
                                            {item[idColumn]}
                                        </td>
                                    )}
                                    {editableColumns.map(column => (
                                        <td
                                            key={column}
                                            className={`${column === 'price' ? 'price-cell' : ''} 
                                                      ${editingCell.rowId === (item.ID || item.id) && editingCell.column === column ? 'editing' : ''}`}
                                        >
                                            {renderCell(item, column, item[column])}
                                        </td>
                                    ))}
                                    <td className="action-buttons">
                                        {renderActionButtons(item)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showAddForm && (
                    <div className="add-form">
                        <h3>Add New {tables.find(t => t.id === activeTable)?.name}</h3>
                        {editableColumns.map(field => (
                            <div key={field} className="form-group">
                                <label>{formatColumnHeader(field)}</label>
                                <input
                                    type={field === 'price' ? 'number' : 'text'}
                                    step={field === 'price' ? '0.01' : undefined}
                                    name={field}
                                    value={formData[field] || ''}
                                    onChange={handleInputChange}
                                    placeholder={`Enter ${formatColumnHeader(field).toLowerCase()}`}
                                    className={formErrors[field] ? 'input-error' : ''}
                                />
                                {formErrors[field] && <div className="error-message">{formErrors[field]}</div>}
                            </div>
                        ))}
                        <div className="form-actions">
                            <button className="save-btn" onClick={handleAdd}>Save</button>
                            <button className="cancel-btn" onClick={() => {
                                setShowAddForm(false);
                                setFormData({});
                                setFormErrors({});
                            }}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCellValue = (key, value) => {

        // Handle null or undefined values
        if (value === null || value === undefined) {
            return '-';
        }

        // Handle price formatting
        if (key === 'price') {
            return `$${parseFloat(value).toFixed(2)}`;
        }

        // Handle boolean values
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        // Handle image URLs
        if (key === 'image_url' || key === 'Image Url') {
            return value ? (
                <div className="image-preview">
                    <img
                        src={`/images/${value}`}
                        alt="Preview"
                        onError={(e) => e.target.src = '/placeholder.png'}
                    />
                </div>
            ) : '-';
        }

        // Handle specifications object
        if (key === 'specifications' && typeof value === 'object') {
            return (
                <div className="specifications-cell">
                    {Object.entries(value).map(([specKey, specValue]) => (
                        <div key={specKey}>
                            <strong>{formatColumnHeader(specKey)}:</strong> {specValue || '-'}
                        </div>
                    ))}
                </div>
            );
        }

        // Return the value as is for all other cases
        return value.toString();
    };

    const formatColumnHeader = (column) => {
        return column
            .split(/[_\s]|(?=[A-Z])/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Add CSS for specifications display and for clickable ID cells
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .specifications-cell {
                font-size: 0.9em;
                line-height: 1.4;
            }
            .specifications-cell div {
                margin: 2px 0;
            }
            .specifications-cell strong {
                color: #666;
                margin-right: 5px;
            }
            .clickable-id {
                cursor: pointer;
                font-weight: bold;
                color: #0366d6;
                text-decoration: underline;
            }
            .clickable-id:hover {
                background-color: #f0f8ff;
            }
            .input-error {
                border: 1px solid #ff6b6b !important;
                background-color: #fff0f0;
            }
            .error-message {
                color: #ff6b6b;
                font-size: 0.85em;
                margin-top: 4px;
            }
        `;
        document.head.appendChild(style);
        
        // Cleanup function to remove the style when component unmounts
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    const ErrorModal = ({ show, message, onClose }) => {
        if (!show) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Update Failed</h3>
                    </div>
                    <div className="modal-body">
                        {message.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                    <div className="modal-footer">
                        <button className="modal-close-btn" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Validate form data
    const validateForm = (data) => {
        const errors = {};

        // Get all unique keys from the tableData and filter out non-editable columns
        const editableColumns = Array.from(new Set(tableData.flatMap(item => Object.keys(item))))
            .filter(col =>
                !col.includes('__') &&
                col !== 'specifications' &&
                col !== 'device_type_name' &&
                col !== 'ID' &&
                col !== 'id'
            );

        editableColumns.forEach(field => {
            if (!data[field] && data[field] !== 0) {
                errors[field] = 'This field is required';
            }

            // Add specific validations
            if (field === 'price' && data[field] && data[field] < 0) {
                errors[field] = 'Price cannot be negative';
            }
            if (field === 'email' && data[field] && !/\S+@\S+\.\S+/.test(data[field])) {
                errors[field] = 'Invalid email format';
            }
        });

        return errors;
    };

    // Add DeleteConfirmModal component if not already present
    const DeleteConfirmModal = ({ show, onConfirm, onCancel }) => {
        if (!show) return null;

        return (
            <div className="modal-overlay" onClick={onCancel}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Confirm Delete</h3>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
                        {itemToDelete && (
                            <div className="delete-details">
                                <p>Table: {activeTable}</p>
                                <p>ID: {itemToDelete.ID || itemToDelete.id}</p>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="delete-btn" onClick={onConfirm}>Delete</button>
                        <button className="modal-close-btn" onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-dashboard">
            {/* Table list sidebar */}
            <div className="table-list-sidebar">
                <h2>Database Tables</h2>
                <ul>
                    {tables.map(table => (
                        <li
                            key={table.id}
                            className={activeTable === table.id ? 'active' : ''}
                            onClick={() => setActiveTable(table.id)}
                        >
                            {table.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main content area */}
            <div className="admin-content">
                {renderTable()}
            </div>

            {/* Error Modal */}
            <ErrorModal
                show={showErrorModal}
                message={errorModalMessage}
                onClose={() => setShowErrorModal(false)}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                show={showDeleteConfirm}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                }}
            />
        </div>
    );
};

export default AdminDashboard;