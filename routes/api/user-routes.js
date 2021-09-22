const router = require('express').Router();
const { User, Topics, Votes } = require('../../models');

// get all users
router.get('/', (req, res) => {
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
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
  User.findOne({
    attributes: { exclude: ['password'] },
    where: {
      id: req.params.id
    }
  })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
  // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
  User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
  })
      .then(dbUserData => {
          req.session.save(() => {
              req.session.user_id = dbUserData.id;
              req.session.username = dbUserData.username;
              req.session.loggedIn = true;

              res.json(dbUserData);
          });
      });
});

router.post('/login', (req, res) => {
  User.findOne({
      where: {
          email: req.body.email
      }
  }).then(dbUserData => {
      if (!dbUserData) {
          res.status(400).json({ message: 'No user with that email address!' });
          return;
      }

      const validPassword = dbUserData.checkPassword(req.body.password);

      if (!validPassword) {
          res.status(400).json({ message: 'Incorrect password!' });
          return;
      }

      req.session.save(() => {
        console.log('why you no work');
          // declare session variables
          req.session.user_id = dbUserData.id;
          req.session.username = dbUserData.username;
          console.log(req.session.loggedIn);
          req.session.loggedIn = true;
          console.log(req.session.loggedIn);

          res.json({ user: dbUserData, message: 'You are now logged in!' });
      });
  });
});

router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  }
  else {
    res.status(404).end();
  }
});

router.put('/:id', (req, res) => {
  // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}

  // pass in req.body instead to only update what's passed through
  User.update(req.body, {
    individualHooks: true,
    where: {
      id: req.params.id
    }
  })
    .then(dbUserData => {
      if (!dbUserData[0]) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', (req, res) => {
  User.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
