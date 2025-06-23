import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import AddTransaction from "./components/AddTransaction";
import TransactionList from "./components/TransactionList";
import ChartView from "./components/ChartView";
import BarChartView from "./components/BarChartView";
import { collection, onSnapshot } from "firebase/firestore";
import "./styles/Dashboard.css";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleLogout = () => {
    signOut(auth);
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "transactions"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredTransactions = transactions.filter((txn) => {
    const txnDate = new Date(txn.createdAt?.seconds * 1000 || Date.now());
    const monthMatch =
      !selectedMonth || txnDate.getMonth() + 1 === parseInt(selectedMonth);
    const categoryMatch =
      !selectedCategory || txn.category === selectedCategory;
    return monthMatch && categoryMatch;
  });

  const income = filteredTransactions
    .filter((txn) => txn.type === "income")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const expense = filteredTransactions
    .filter((txn) => txn.type === "expense")
    .reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>
          Welcome, <span>{user?.email}</span> 🎉
        </h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="balance-card">
        <h3>Total Balance</h3>
        <p>₹ {income - expense}</p>
      </div>

      <div className="filters">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((month, idx) => (
            <option key={idx} value={idx + 1}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="salary">Salary</option>
          <option value="food">Food</option>
          <option value="rent">Rent</option>
          <option value="shopping">Shopping</option>
          <option value="bills">Bills</option>
        </select>
      </div>

      <div className="dashboard-charts">
        <ChartView transactions={filteredTransactions} />
        <BarChartView transactions={filteredTransactions} />
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Add Transaction</h3>
          <AddTransaction />
        </div>

        <div className="dashboard-section">
          <h3>Transaction List</h3>
          <TransactionList transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

