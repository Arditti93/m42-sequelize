require("dotenv").config()
const { Sequelize } = require("sequelize") 
const { DataTypes } = require("sequelize")

//Making a connection
const sequelize = new Sequelize(process.env.MYSQL_URI)

//Testing databse connection using sequelize authenticate method
const testConnecton = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnecton()  


//Defining our tables
const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}) 

const Invoice = sequelize.define('Invoice', {
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId:{
        type: DataTypes.INTEGER,
    },
}) 

//Create adding entries to our tables
const invoiceTable = async () => {
    await sequelize.sync()
    try {
        await Invoice.create({
            amount: 100,
            userId: 2
        })
        console.log("Invoice successfully created")
        await sequelize.close();
    } catch (error) {
        console.log(error)
        await sequelize.close();
    }
}

const usersTable = async () => {
    await sequelize.sync()
    try {
        await User.create({
            firstName: 'Tess'
        })
        console.log("User successfully created")

    await sequelize.close();

    } catch (error) {
        console.log(error)
        await sequelize.close();
    }
}

// usersTable()
// invoiceTable() 


const displayTables = async () => {
    try {
        //filter findAll to only output the id and firstName column from the Users table
        let usersList = await User.findAll({
            attributes: ['id', 'firstName']
        })
        console.log("Users Table")
        //Display Users table as table in the console
        console.table(usersList.map(value => value.dataValues)) 

        //filter findAll to only output the id, amount and userId from the invoices table
        let invoiceList = await Invoice.findAll({
            attributes: ['id', 'amount', 'userId']
        })
        console.log("Invoices Table")
        //Invoices table in a console table
        console.table(invoiceList.map(value => value.dataValues)) 

    } catch (error) {
        await sequelize.close()
        console.log(error)
    }
}

// displayTables()
//The Invoices table stores the userId of the user who created the invoice row.
//id is the primary key in the users table and the forigen key in invoices table 

//id is called userId in the invocies table

//The first method to query both table data at once is by writing a raw SQL query using

const rawJoin = async () => {
    const [results] = await sequelize.query(
        "SELECT * FROM Invoices JOIN Users on Invoices.userId = Users.id"
    )
    console.table(results.map(value => value))
}
// rawJoin()

// There are four types of association methods that you can use in Sequelize:
// hasOne()
// hasMany()
// belongsTo()
// belongsToMany()
// These four methods can be used to create One-To-One, One-To-Many, and Many-To-Many relationships between your models. 

// In the example we have, one User row can have many Invoices rows. This means you need to create a One-To-Many relation between the Users and the Invoices table.

const sequelizeJoin = async () => {
    User.hasMany(Invoice)
    Invoice.belongsTo(User)

     // By default, the include option will cause Sequelize to generate an SQL query with the LEFT OUTER JOIN clause.
    const leftOuterJoin = await User.findAll({
        include: Invoice
    })

    console.log(JSON.stringify(leftOuterJoin, null, 2))

    //To change the JOIN clause from LEFT OUTER JOIN to INNER JOIN, 
    //you need to add the required: true option to the include option.

    const innerJoin = await User.findAll({
        include: {model: Invoice, required: true}
    })
    console.log(JSON.stringify(innerJoin, null, 2))
    //With an INNER JOIN, the data from the Users row will 
    //be excluded when there are no related Invoices data for that row.

}
// sequelizeJoin() 

const addInvoice = async () => {
    //find userid of Alice
    let userId = await User.findAll({
        where: {
            firstName: 'Alice'
        },
        attributes: ['id']
    })
    let id = userId[0].dataValues.id
    // console.log(id)

    //find all invoices for the userId from above
    let findInvocies = await Invoice.findAll({
        where: {
            userId: id
        }
    })
    console.table(findInvocies.map(value => value.dataValues))
}

// addInvoice() 

const findInvoices = async () => {
    let user = "Alice"

    const [results] = await sequelize.query(
        `SELECT Invoices.id AS invoiceId, Invoices.amount, Users.firstName
        FROM Users INNER JOIN Invoices ON Invoices.userid = Users.id 
        WHERE Users.firstName = '${user}'
        `
    )
    console.table(results.map(value => value))
}

// findInvoices()

const caseStatments = async () => {

    const [results] = await sequelize.query(
        `SELECT amount, id,
        CASE
            WHEN amount < 350 THEN 'Invoice is less than 350'
            WHEN amount > 350 THEN 'invoice is greater than 350'
            ELSE 'invoice is a different amount'
            END AS 'invoices amount'
            FROM Invoices
        `
    )
    console.log(results)
}

caseStatments()
