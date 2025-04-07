document.addEventListener('DOMContentLoaded', async () => {
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin';
        return;
    }

    // Popup logic
    const addTransactionBtn = document.getElementById("add_transaction_btn");
    const closeBtn = document.getElementById("close_btn");
    const popup = document.getElementById("popup");
    if (addTransactionBtn && closeBtn && popup) {
        addTransactionBtn.addEventListener("click", () => {
            popup.style.display = "flex"
            setTimeout(() => popup.classList.add("visible"), 10);
        });
        closeBtn.addEventListener("click", () => {
            popup.classList.remove("visible");
            setTimeout(() => popup.style.display = "none", 300);
        });
    } else {
        console.error("One or more popup elements not found. Check IDs.");
    }

    // Fetch and display dashboard data
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    try {
        const response = await fetch('/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Unauthorized access. Redirecting to sign-in.');
        const data = await response.json();
        console.log("Dashboard Data:", data);

        document.getElementById('username-display').innerText = data.username;
        document.getElementById('balance').innerText = `₹${data.balance}`;
        document.getElementById('income').innerText = `₹${data.income}`;
        document.getElementById('expenses').innerText = `₹${data.expenses}`;
        document.getElementById('savings').innerText = `₹${data.income - data.expenses}`;

        const transactions = document.getElementById('recent-transactions');
        transactions.innerHTML = "";
        data.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .forEach(transaction => {
                const row = document.createElement("tr");
                const amountCell = `<td style="color: ${transaction.type === 'income' ? '#00cc00' : '#ff4444'}">${transaction.type === "income" ? "+" : "-"}₹${transaction.amount}</td>`;
                row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.name}</td>
            ${amountCell}
            <td>${transaction.category}</td>
            <td>${transaction.method}</td>
        `;
                transactions.appendChild(row);
            });

        await displayMoneyFlowChart();
        loading.style.display = 'none';
    } catch (error) {
        loading.style.display = 'none';
        console.error("Error fetching data:", error);
        alert("Session expired. Please sign in again.");
        localStorage.removeItem('token');
        window.location.href = '/signin';
    }
});

// Transaction Form Submission
document.getElementById("transaction_form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
        amount: document.getElementById("amount").value,
        type: document.getElementById("type").value,
        name: document.getElementById("name").value.trim(),
        method: document.getElementById("method").value,
        category: document.getElementById("category").value,
    };

    if (!formData.amount || !formData.type || !formData.name || !formData.method || !formData.category) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication error: Please log in again.");
            return;
        }

        const response = await fetch("/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert("Transaction added successfully!");
            window.location.reload();
        } else {
            alert("Transaction addition failed. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

// Chart Display Function
let moneyFlowChart = null;
let refreshInterval;
async function displayMoneyFlowChart() {
    const ctx = document.getElementById("moneyFlowChart").getContext("2d");
    const incomeGradient = ctx.createLinearGradient(0, 0, 0, 300);
    incomeGradient.addColorStop(0, "#00cc00"); // Green for income
    incomeGradient.addColorStop(1, "#66ff66");
    const expenseGradient = ctx.createLinearGradient(0, 0, 0, 300);
    expenseGradient.addColorStop(0, "#ff4444"); // Red for expenses
    expenseGradient.addColorStop(1, "#ff8787");
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/moneyFlow', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch money flow data');
        
        const data = await response.json();
        
        if (moneyFlowChart) {
            moneyFlowChart.destroy();
        }

        moneyFlowChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [
                    {
                        label: "Income",
                        data: data.income,
                        backgroundColor: incomeGradient,
                        borderRadius: 8
                    },
                    {
                        label: "Expense",
                        data: data.expense,
                        backgroundColor: expenseGradient,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false
                },
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                            pointStyle: "circle",
                            color: "#ddd",
                            font: { size: 14, weight: 600 }
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        bodyColor: "#fff",
                        titleColor: "#fff",
                        callbacks: {
                            label: function (tooltipItem) {
                                return `₹${tooltipItem.raw.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: "#ddd", font: { size: 12 } } },
                    y: {
                        ticks: { color: "#ddd", callback: (val) => `₹${val.toLocaleString()}` },
                        grid: { color: "rgba(255, 255, 255, 0.1)", borderDash: [5, 5] }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: "easeInOutQuad"
                },
                onClick: (event, elements) => {
                    if (elements.length) {
                        const index = elements[0].index;
                        alert(`You clicked on ${moneyFlowChart.data.labels[index]}`);
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error fetching money flow data:", error);
        alert("Failed to load chart data. Please try refreshing the page.");
    }

    setTimeout(() => {
        displayMoneyFlowChart();
    }, 360000);
}
