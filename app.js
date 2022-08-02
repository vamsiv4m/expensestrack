const express = require("express");
// const { port, mongo_passwd } = require("./config");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const expenseSchema = require("./schemas/ExpenseSchema");
const CategoryScheme = require("./schemas/CategorySchema")
const cors = require("cors");
const ExpenseSchema = require("./schemas/ExpenseSchema");
const UserSchema = require("./schemas/UserSchema");
const jwt = require('jsonwebtoken');
const cookie_parser = require('cookie-parser');
const auth = require("./middleware/auth");
const bcrypt = require("bcrypt") ;
const url = `mongodb+srv://etracker:${process.env.MONGODB_PASSWD}@cluster-applications.awneu.mongodb.net/expensestrack?retryWrites=true&w=majority`;
// const localmongourl = "mongodb://0.0.0.0:27017/hypercube";
// const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials:true
}))
app.use(cookie_parser());
mongoose.connect(url, (err) => {
    if (err) console.log(err);
    else {
        console.log("Connected successfully");
    }
});

app.get(`/getUserData`,auth, (req, res) => {
    // console.log(req.cookies.jwt);
})

//registration
app.post("/registration", async (req, res) => {
    try {
        const { username, email, password, cpassword } = req.body;
        if (!username || !email || !password || !cpassword) {
            return res.json({ message: "Fields cannot be empty" })
        }
        if (await UserSchema.findOne({ username: username })) {
            return res.json({ message: `User ${username} already exists.` })
        }
        else if(password.length<8){
            return res.json({message:"Password length must be greater than 8 characters"})
        }
        else {
            if (password === cpassword) {
                try {
                    const hashedPassword = await bcrypt.hash(cpassword, 12);
                    const userData = new UserSchema({ username, email, password: hashedPassword, cpassword: hashedPassword });
                    await userData.save();
                    return res.json({ status: "OK", message: "Successfully register" })
                }
                catch (e) {
                    console.log(e.message);
                }
            } else {
                return res.json({ status: "error", message: "Confirm password not same as password" })
            }
        }
    }
    catch (e) {
        return console.log(e.message);
    }
});

//login
app.post("/login", async (req, res) => {
    let token;
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.json({ message: "Fields cannot be empty" });
        }
        const userdata = await UserSchema.findOne({ username: username });
        if (!userdata) {
            return res.json({ message: "Account not found. Please Register." })
        } else {
            const result =await bcrypt.compare(password, userdata.cpassword);
            console.log(result);
            if (result) {
                token = await userdata.generateAuthToken();
                res.cookie("jwt", token, {
                    secure:true,
                    sameSite:'none',
                    httpOnly:true
                });
                return res.json({ isLogin: true })
            }
            else {
                return res.json({ message: "Invalid Credentials" });
            }
        }
    } catch (e) {
        console.log(e.message);
    }
})


//logout
app.get('/logout',auth,async(req,res)=>{
    try{
        res.clearCookie('jwt');
        await req.userdata.save();
        res.render('login')
        // res.json({isLogout:true});
    }catch(e){
        res.json({message:e.message})
    }
})


app.post("/addExpense", async (req, res) => {
    try {
        const data = req.body;
        const newData = new expenseSchema(data);
        await newData.save();
        return res.json(await expenseSchema.find({ userId: data.userId }).sort({ "_id": -1 }));
    } catch (e) {
        console.log(e.message);
    }

});

app.get("/getExpenses/:id", async (req, res) => {
    try {
        return res.json(await expenseSchema.find({ userId: req.params.id }).sort({ "_id": -1 }))
    } catch (e) {
        console.log(e);
    }
})

app.get("/getRecentExpenses/:id", async (req, res) => {
    try {
        return res.json(await expenseSchema.find({ userId: req.params.id }).sort({ "_id": -1 }).limit(5))
    } catch (e) {
        console.log(e);
    }
})

app.delete(`/delExpense/:id`, async (req, res) => {
    try {
        expenseSchema.findByIdAndDelete(req.params.id, (err) => {
            if (err) console.log(err);
            else console.log("deleted succesfully");
        });
        // console.log("deleted successfully");
        return res.json(await expenseSchema.find({ userId: req.query.userid }).sort({ "_id": -1 }));
    }
    catch (e) {
        console.log(e.message);
    }
})

app.post("/updateExpense/:id", async (req, res) => {
    try {
        expenseSchema.findByIdAndUpdate(req.params.id, req.body, (err) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log("updated successfully");
            }
        })
        return res.json(await expenseSchema.find().sort({ "_id": -1 }));
    } catch (error) {
        console.log(error.message);
    }
})

app.get("/getCategory", async (req, res) => {
    try {
        return res.json(await CategoryScheme.find())
    } catch (e) {
        console.log(e.message);
    }
})

app.get("/getMonthlyData", async (req, res) => {
    try {
        return res.json(await ExpenseSchema.aggregate([{
            $group: {
                _id: {
                    userId: "$userId",
                    year: { $year: "$date" },
                    month: { $month: "$date" }
                },
                Total: { $sum: "$price" }
            }
        }]).sort({ "_id": 1 }))
    } catch (e) {
        console.log(e.message);
    }
})
app.get("/getMonthlyData1", async (req, res) => {
    try {
        return res.json(await ExpenseSchema.aggregate([{
            $project: {
                _id: {
                    userId: "$userId",
                    expense_name : "$expense_name",
                    price:"$price",
                    category:"$category",
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    date:"$date"
                },
                Total: { $sum: "$price" }
            }
        }]).sort({ "_id": 1 }))
    } catch (e) {
        console.log(e.message);
    }
})


app.get("/getSevendaysData", async (req, res) => {
    try {
        return res.json(await ExpenseSchema.aggregate([{
            $group: {
                _id: {
                    userId: "$userId",
                    dayofweek: { $dayOfWeek: "$date" },
                    week: { $week: "$date" },
                    currentweek: { $week: "$$NOW" }
                },
                Total: { $sum: "$price" }
            }
        }]))
    } catch (e) {
        console.log(e);
    }
})

app.get("/getSevendaysData1", async (req, res) => {
    try {
        return res.json(await ExpenseSchema.aggregate([{
            $project: {
                _id: {
                    userId: "$userId",
                    expense_name : "$expense_name",
                    price:"$price",
                    category:"$category",
                    dayofweek: { $dayOfWeek: "$date" },
                    week: { $week: "$date" },
                    currentweek: { $week: "$$NOW" },
                    date:"$date"
                },
                Total: { $sum: "$price" }
            }
        }]))
    } catch (e) {
        console.log(e);
    }
})

app.get("/getWeeklyData", async (req, res) => {
    try {
        return res.json(await ExpenseSchema.aggregate([
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        week: { $week: "$date" },
                        currentweek: { $week: "$$NOW" }
                    },
                    avg: {
                        $avg: "$price"
                    },
                    Total: {
                        $sum: "$price"
                    }
                }
            }
        ]))
    } catch (e) {
        console.log(e.message);
    }
}
)

app.listen(process.env.PORT, () => {
    console.log(`App Running at ${process.env.PORT}`);
})