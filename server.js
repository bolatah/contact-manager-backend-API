const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ContactsManager = require("./database/SQLiteContactsManager");
const UsersManager = require("./database/SQLiteUsersManager");

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";

const app = express();

app.use(cors());
app.use(express.json());

const contactsManager = new ContactsManager();
const usersManager = new UsersManager();

// Route for user-register
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // validate user input
    if (!(username && email && phone && password)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    const oldUser = await usersManager.getUserByEmail(email);
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // encrypt the user password and add user
    bcrypt.hash(password, 10, async (err, hash) => {
      const user = {
        username: username,
        email: email,
        phone: phone,
        password: hash,
      };
      await usersManager.addUser(user);
      const token = jwt.sign(
        { user_id: user.id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
      // return new user
      res.status(201).json(user);
    });
  } catch (err) {
    console.log(err);
  }
});

// Route for user-login
app.post("/api/users/login", async (req, res) => {
  try {
    // get user input
    const { username, email, password } = req.body;

    // validate user input
    if (!(username && password)) {
      res.status(400).send("All input is required");
    }

    // validate if user exist in our database
    const user = await usersManager.getUserByUsername(username);
    console.log(user);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user.id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

//Route for log-out
// app.post("api/users/logout", async (req, res) => {
//   if (error) throw error;
//   console.log("User logout");
//   res.redirect("/");
// });

const auth = require("./middleware/auth");

// Route for getting all users
app.get("/api/users", async (req, res, err) => {
  try {
    const users = await usersManager.getUsers();
    users.forEach((user) => {
      user.href = `/api/users/${user.id}`;
    });
    res.status(200).send(users);
    console.log("getting all users");
  } catch (err) {
    console.log(err);
  }
});

//Route for getting an user by id
app.get("/api/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await usersManager.getUserById(id);
  if (user) {
    res.status(200).send(user);
    console.log("showing an user");
  } else {
    res.status(404).send();
  }
});

// Route for adding contact
app.post("/api/contacts", auth, async (req, res) => {
  const contact = req.body;
  const id = await contactsManager.addContact(contact);
  contact.href = `/api/contacts/${id}`;
  res.status(201).location(`/api/contacts/${id}`).send(contact);
});

//Route for showing all contacts
app.get("/api/contacts", auth, async (req, res) => {
  const contacts = await contactsManager.getContacts();
  contacts.forEach((contact) => {
    contact.href = `/api/contacts/${contact.id}`;
  });
  res.status(200).send(contacts);
});

// Route for showing a contact by id
app.get("/api/contacts/:id", auth, async (req, res) => {
  const id = parseInt(req.params.id);
  const contact = await contactsManager.getContact(id);
  if (contact) {
    res.status(200).send(contact);
  } else {
    res.status(404).send();
  }
});

// Route for updating a contact
app.put("/api/contacts/:id", auth, async (req, res) => {
  const id = parseInt(req.params.id);
  const existingContact = await contactsManager.getContact(id);
  if (existingContact) {
    const contact = req.body;
    await contactsManager.updateContact(id, contact);
    res.status(200).send();
  } else {
    const contact = req.body;
    const id = await contactsManager.addContact(contact);
    res.status(200).location(`/api/contacts/${id}`).send();
  }
});

// Route for deleting a contact
app.delete("/api/contacts/:id", auth, async (req, res) => {
  const id = parseInt(req.params.id);
  await contactsManager.deleteContact(id);
  res.status(200).send();
});

// End of routes
const server = app.listen(PORT, () => {
  console.log(`web service laueft unter http://${HOST}:${PORT}`);
});
