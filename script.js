"use strict";

const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionList = document.getElementById("transaction-list");
const clearAllButton = document.getElementById("clear-all");

const requiredElements = [
    form,
    descriptionInput,
    amountInput,
    typeInput,
    categoryInput,
    dateInput,
    balanceElement,
    incomeElement,
    expensesElement,
    transactionList,
    clearAllButton
];

if (requiredElements.some(element => !element)) {
    console.error(
        "Expense Tracker: index.html mein required elements ya IDs missing hain."
    );
} else {
    const STORAGE_KEY = "transactions";

    function loadTransactions() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            const parsedData = savedData ? JSON.parse(savedData) : [];
            return Array.isArray(parsedData) ? parsedData : [];
        } catch (error) {
            console.error("Saved transactions load nahi ho sake:", error);
            return [];
        }
    }

    let transactions = loadTransactions();

    function saveTransactions() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        } catch (error) {
            console.error("Transactions save nahi ho sake:", error);
            alert("Data save nahi ho saka. Browser storage check karein.");
        }
    }

    function getToday() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function formatMoney(amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    }

    function updateSummary() {
        const income = transactions
            .filter(item => item.type === "income")
            .reduce((total, item) => total + (Number(item.amount) || 0), 0);

        const expenses = transactions
            .filter(item => item.type === "expense")
            .reduce((total, item) => total + (Number(item.amount) || 0), 0);

        balanceElement.textContent = formatMoney(income - expenses);
        incomeElement.textContent = formatMoney(income);
        expensesElement.textContent = formatMoney(expenses);
    }

    function renderTransactions() {
        transactionList.replaceChildren();

        if (transactions.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.className = "empty";
            cell.textContent = "No transactions yet. Add your first one!";

            row.appendChild(cell);
            transactionList.appendChild(row);
            updateSummary();
            return;
        }

        transactions.forEach((transaction, index) => {
            const row = document.createElement("tr");

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = transaction.description || "";

            const categoryCell = document.createElement("td");
            categoryCell.textContent = transaction.category || "";

            const dateCell = document.createElement("td");
            dateCell.textContent = transaction.date || "";

            const amountCell = document.createElement("td");
            const isIncome = transaction.type === "income";

            amountCell.textContent =
                `${isIncome ? "+" : "-"}${formatMoney(transaction.amount)}`;
            amountCell.className = isIncome
                ? "amount-income"
                : "amount-expense";

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute(
                "aria-label",
                `Delete transaction: ${transaction.description || "transaction"}`
            );

            deleteButton.addEventListener("click", () => {
                transactions.splice(index, 1);
                saveTransactions();
                renderTransactions();
            });

            actionCell.appendChild(deleteButton);
            row.append(
                descriptionCell,
                categoryCell,
                dateCell,
                amountCell,
                actionCell
            );
            transactionList.appendChild(row);
        });

        updateSummary();
    }

    dateInput.value = getToday();

    form.addEventListener("submit", event => {
        event.preventDefault();

        const description = descriptionInput.value.trim();
        const amount = Number(amountInput.value);
        const type = typeInput.value;
        const category = categoryInput.value;
        const date = dateInput.value;

        if (
            !description ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            !["income", "expense"].includes(type) ||
            !category ||
            !date
        ) {
            alert("Please enter a valid description, amount, type, category, and date.");
            return;
        }

        transactions.unshift({
            id: Date.now() + Math.random(),
            description,
            amount,
            type,
            category,
            date
        });

        saveTransactions();
        renderTransactions();

        form.reset();
        dateInput.value = getToday();
    });

    clearAllButton.addEventListener("click", () => {
        if (transactions.length === 0) {
            alert("There are no transactions to clear.");
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to delete all transactions?"
        );

        if (confirmed) {
            transactions = [];
            saveTransactions();
            renderTransactions();
        }
    });

    renderTransactions();
}