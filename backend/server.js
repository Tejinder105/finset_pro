const express = require("express")
const bodyParser = require("body-parser")
const { jwtAuthMiddleware, generateToken } = require("./jwt")
const db = require('./db')
const User = require('./models/user')
const app = express();
const path = require("path")
const port = 4000
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require("bcrypt");

const Transaction = require('./models/transaction');

app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());


passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const User = User.findOne({ username: username });
        if (!User)
            return done(null, false, { message: "Invalid username" });

        const isPasswordMatch = await bcrypt.compare(password, User.password);
        if (!isPasswordMatch)
            return done(null, false, { message: "Invalid password" });
        else
            return done(null, User);

    }
    catch (err) {
        return done(err);
    }
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/signup.html"));
})



app.listen(port, () => {
    console.log(`server is connected to ${port}`)
})


//signup route

app.post("/signup", async (req, res) => {

    try {
        const { username, email, password } = req.body;


        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already in use" });

        const newUser = new User({
            username,
            email,
            password,
            balance: 0,
            income: 0,
            expenses: 0,
            transactions: []
        });


        await newUser.save();
        console.log('User registered successfully');

        const token = generateToken({ id: newUser.id, username: newUser.username });

        res.json({
            message: "Signup successful",
            token,
            user:{
                username: newUser.username,
                balance: newUser.balance,
                income: newUser.income,
                expenses: newUser.expenses,
                transactions: newUser.transactions
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal server error");

    }

})


//signin route
app.post("/signin", async (req, res) => {

    try {
        const {email,password} = req.body;
        const existingUser = await User.findOne({ email});

        if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken({
            id: existingUser.id,
            username: existingUser.username
        });

        res.json({
            message: "Signin successful",
            token,
            user: {
                username: existingUser.username,
                email: existingUser.email,
                balance: existingUser.balance,
                income: existingUser.income,
                expenses: existingUser.expenses,
                transactions: existingUser.transactions
            }
        });


    }
    catch (error) {
        console.error("Error in /signin:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/signin.html"));
})

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/signup.html"));
})

//dashboard route
app.get('/dashboard', jwtAuthMiddleware,async(req, res) => {
    
    try{
        const user = await User.findOne({username: req.user.username}).populate('transactions');
        res.json({
            username: user.username,
            email: user.email,
            balance: user.balance,
            income: user.income,
            expenses: user.expenses,
            transactions: user.transactions
        }); 
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }


});

//add transaction route

app.post('/transaction', jwtAuthMiddleware, async (req, res) => {
    try{
        const { amount, type, name, method, category } = req.body;
        const userId = req.user.id;
        


        const newTransaction = await Transaction.create({
            userId,
            amount:Number(amount),
            type,
            name,
            method,
            category,
        });
        await newTransaction.save(); 

        const user =await User.findById(userId);

        if (type === 'income') {
            user.income += Number(amount);
        } else if (type === 'expense') {
            user.expenses += Number(amount);
        }
        user.balance = user.income - user.expenses;
        user.transactions.push(newTransaction.id); 
        await user.save();

        if (!user)
            return res.status(400).json({ message: "User not found" });
    
        
        

        res.status(201).json({ message: "Transaction added successfully" });
    

    }
    catch(err){
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }

});


app.get("/moneyFlow", async (req, res) => {
    try {
        const transactions = await Transaction.find(); // Fetch all transactions from MongoDB

        let incomeData = new Array(12).fill(0); // Array for 12 months
        let expenseData = new Array(12).fill(0);

        transactions.forEach((txn) => {
            const monthIndex = new Date(txn.date).getMonth(); // Get month (0 = Jan, 11 = Dec)
            if (txn.type === "income") {
                incomeData[monthIndex] += txn.amount;
            } else if (txn.type === "expense") {
                expenseData[monthIndex] += txn.amount;
            }
        });

        res.json({ income: incomeData, expense: expenseData });
    } catch (err) {
        res.status(500).json({ message: "Error fetching data", error: err });
    }
});


app.get("/transaction",async(req,res)=>{
    res.sendFile(path.join(__dirname, "../frontend/transaction.html"));
})

app.patch("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password successfully reset" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error resetting password" });
    }
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/forgot-password.html"));
})
