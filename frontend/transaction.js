let allTransactions = [];
let currentSortColumn = 'date';
let currentSortOrder = 'desc';

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch('/api/transactions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        allTransactions = await response.json();

        // Populate category filter
        const categories = [...new Set(allTransactions.map(t => t.category))];
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // Display all transactions initially
        displayTransactions(allTransactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
        const tbody = document.getElementById('transactionTableBody');
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #FF5252;">Error loading transactions. Please try again later.</td></tr>`;
    }
}

// Apply filters and search
function applyFilters() {
    const searchText = document.getElementById('searchTransaction').value.toLowerCase().trim();
    const dateFilter = document.getElementById('dateFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Start with all transactions
    let filteredTransactions = [...allTransactions];

    // Only apply filters if they are actually set
    if (searchText) {
        filteredTransactions = filteredTransactions.filter(transaction => {
            return (
                transaction.name.toLowerCase().includes(searchText) ||
                transaction.category.toLowerCase().includes(searchText) ||
                transaction.amount.toString().includes(searchText)
            );
        });
    }

    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.type.toLowerCase() === typeFilter.toLowerCase()
        );
    }

    if (categoryFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.category.toLowerCase() === categoryFilter.toLowerCase()
        );
    }

    if (dateFilter !== 'all') {
        filteredTransactions = filterByDate(filteredTransactions, dateFilter, startDate, endDate);
    }

    // Reset to first page when filters change
    currentPage = 1;
    displayTransactions(filteredTransactions);
}

// Filter transactions by date
function filterByDate(transactions, dateFilter, startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        transactionDate.setHours(0, 0, 0, 0);

        switch (dateFilter) {
            case 'today':
                return transactionDate.getTime() === today.getTime();
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                return transactionDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                return transactionDate >= monthAgo;
            case 'year':
                const yearAgo = new Date(today);
                yearAgo.setFullYear(today.getFullYear() - 1);
                return transactionDate >= yearAgo;
            case 'custom':
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    return transactionDate >= start && transactionDate <= end;
                }
                return true;
            default:
                return true;
        }
    });
}

// Add this function to handle sorting
function sortTransactions(transactions, column, order) {
    return [...transactions].sort((a, b) => {
        let compareA, compareB;

        switch (column) {
            case 'date':
                compareA = new Date(a.date).getTime();
                compareB = new Date(b.date).getTime();
                break;
            case 'amount':
                compareA = parseFloat(a.amount);
                compareB = parseFloat(b.amount);
                break;
            default:
                compareA = a[column].toLowerCase();
                compareB = b[column].toLowerCase();
        }

        if (order === 'asc') {
            return compareA > compareB ? 1 : -1;
        } else {
            return compareA < compareB ? 1 : -1;
        }
    });
}

// Display transactions
function displayTransactions(transactions) {
    const tbody = document.getElementById('recent-transactions');
    
    // Clear existing rows
    tbody.innerHTML = '';

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No transactions found</td></tr>`;
        return;
    }

    // Sort transactions before displaying
    const sortedTransactions = sortTransactions(transactions, currentSortColumn, currentSortOrder);

    // Add all transaction rows
    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        const date = new Date(transaction.date).toLocaleDateString();
        const amount = parseFloat(transaction.amount).toFixed(2);
        const amountColor = transaction.type.toLowerCase() === 'income' ? '#4CAF50' : '#FF5252';
        const amountPrefix = transaction.type.toLowerCase() === 'income' ? '+' : '-';

        row.innerHTML = `
            <td>${date}</td>
            <td>${transaction.name}</td>
            <td style="color: ${amountColor}">${amountPrefix}₹${Math.abs(amount)}</td>
            <td>${transaction.category}</td>
            <td>${transaction.method}</td>
        `;
        tbody.appendChild(row);
    });

    // Update sort indicators
    updateSortIndicators();
}

// Add this function to update sort indicators
function updateSortIndicators() {
    const headers = document.querySelectorAll('.sortable');
    headers.forEach(header => {
        const column = header.dataset.sort;
        header.classList.remove('sorting-asc', 'sorting-desc');
        if (column === currentSortColumn) {
            header.classList.add(currentSortOrder === 'asc' ? 'sorting-asc' : 'sorting-desc');
        }
    });
}

// Clear all filters
function clearFilters() {
    // Reset all filter elements
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('searchTransaction').value = '';
    document.getElementById('customDateRange').style.display = 'none';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    // Reset page number
    currentPage = 1;
    
    // Display all transactions
    displayTransactions(allTransactions);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize event listeners
    document.getElementById('dateFilter').addEventListener('change', function(e) {
        const customDateRange = document.getElementById('customDateRange');
        customDateRange.style.display = e.target.value === 'custom' ? 'flex' : 'none';
        applyFilters();
    });

    const filterElements = ['typeFilter', 'categoryFilter', 'startDate', 'endDate'];
    filterElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });

    // Add debounced search input listener
    const searchInput = document.getElementById('searchTransaction');
    let debounceTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(applyFilters, 300);
    });

    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    // Add click handlers for sortable columns
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            
            // Toggle sort order if clicking the same column
            if (column === currentSortColumn) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortOrder = 'asc';
            }

            displayTransactions(allTransactions);
        });
    });

    // Initial load
    loadTransactions();
}); // End of DOMContentLoaded event listener
