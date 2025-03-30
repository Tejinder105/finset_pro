document.addEventListener('DOMContentLoaded',async()=>{
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin';
        return;
    }
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


    try {
        const response = await fetch('/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Unauthorized access. Redirecting to sign-in.');
        const data = await response.json();
        console.log("Dashboard Data:", data);
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