const router = require('express').Router();
const nodemailer = require('nodemailer');
const { User, Topics, Votes } = require('../../models');

// get all users
router.get('/', (req, res) =>
{
  User.findAll({
    attributes: { exclude: ['password'] },
    include: {
      model: Topics,
      attributes: ['id', 'topic', 'vote_tally', 'user_id'],
      model: Votes,
      attributes: ['id', 'topic_id', 'user_id', 'rank', 'item_name']
    }
  })
    .then(dbUserData => res.json(dbUserData))
    .catch(err =>
    {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/:id', (req, res) =>
{
  User.findOne({
    attributes: { exclude: ['password'] },
    where: {
      id: req.params.id
    }
  })
    .then(dbUserData =>
    {
      if (!dbUserData)
      {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err =>
    {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/', (req, res) =>
{
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })
    .then(dbUserData =>
    {
      req.session.save(() =>
      {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
        res.json(dbUserData);
      });
      sendEmailNotificaiton();
    });

  async function sendEmailNotificaiton()
  {
    try
    {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "goatmeattop5@gmail.com",
          pass: "1234!@#$qwer"
        }
      }); 

      console.log("transporter created");

      transporter.verify(function (error, success)
      {
        if (error)
        {
          console.log(error);
        } else
        {
          console.log("Server is ready to take our messages");
        }
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: "goatmeattop5@gmail.com", // sender address
        to: req.body.email, // list of receivers
        subject: "Top 5 Signup", // Subject line
        text: "Thanks for signing up to the Top5 Website!" // plain text body, can use this or the html body
        // html: "<b>Something Changed</b>", // html body
      });
      console.log("email sent", info.messageId);
    }
    catch (error)
    {
      console.log(error, "message error");
    }
  };
});

router.post('/login', (req, res) =>
{
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(dbUserData =>
  {
    if (!dbUserData)
    {
      res.status(400).json({ message: 'No user with that email address!' });
      return;
    }

    const validPassword = dbUserData.checkPassword(req.body.password);

    if (!validPassword)
    {
      res.status(400).json({ message: 'Incorrect password!' });
      return;
    }

    req.session.save(() =>
    {
      console.log('why you no work');
      // declare session variables
      req.session.user_id = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json({ user: dbUserData, message: 'You are now logged in!' });
    });
  });
});

router.post('/logout', (req, res) =>
{
  if (req.session.loggedIn)
  {
    req.session.destroy(() =>
    {
      res.status(204).end();
    });
  }
  else
  {
    res.status(404).end();
  }
});

router.put('/:id', (req, res) =>
{
  User.update(req.body, {
    individualHooks: true,
    where: {
      id: req.params.id
    }
  })
    .then(dbUserData =>
    {
      if (!dbUserData[0])
      {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err =>
    {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', (req, res) =>
{
  User.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbUserData =>
    {
      if (!dbUserData)
      {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err =>
    {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
