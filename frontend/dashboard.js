document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin';
    }
    try {
        const response = await fetch('/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }

        });
       
        const data = await response.json();
        console.log("Dashboard Data:", data);
        if (response.ok) {
            document.getElementById('username-display').innerText = data.username;
            document.getElementById('balance').innerText = data.balance;
            document.getElementById('income').innerText = data.income;
            document.getElementById('expenses').innerText = data.expenses;
            const savings = data.income - data.expenses;
            document.getElementById('savings').innerText = savings;
            const transactions = document.getElementById('recent-transactions');
            data.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort transactions by date
            .slice(0, 2) 
            .forEach((transaction) => {
                const transactionElement = document.createElement("tr");
                transactionElement.innerHTML = `
                    <td>${new Date(transaction.date).toLocaleDateString()}</td>
                    <td>${transaction.name}</td>
                    <td>${transaction.type === "income" ? "+" : "-"}$${transaction.amount}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.method}</td>
                `;
                transactions.appendChild(transactionElement);
            });
        
        }
        else {
            localStorage.removeItem('token');
            window.location.href = '/signin';
        }
    }
    catch (error) {
        console.error("Error fetching data:", error);
        window.location.href = "/signin.html";
    }
});


//popup


document.addEventListener("DOMContentLoaded", () => {
    const addTransactionBtn = document.getElementById("add_transaction_btn");
    const closeBtn = document.getElementById("close_btn");
    const popup = document.getElementById("popup"); // Ensure popup is selected

    if (addTransactionBtn && closeBtn && popup) {
        // Show the popup when button is clicked
        addTransactionBtn.addEventListener("click", () => {
            popup.style.display = "flex";
        });

        // Hide the popup when close button is clicked
        closeBtn.addEventListener("click", () => {
            popup.style.display = "none";
        });
    } else {
        console.error("One or more elements not found. Check IDs.");
    }


});

const form = document.getElementById("transaction_form");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const nameInput = document.getElementById("name");
const methodInput = document.getElementById("method");
const categoryInput = document.getElementById("category");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = {
        amount: amountInput.value,
        type: typeInput.value,
        name: nameInput.value,
        method: methodInput.value,
        category: categoryInput.value,
    };

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