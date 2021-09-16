const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
// create our Post model
// class Post extends Model {
//   static upvote(body, models) {
//     return models.Vote.create({
//       user_id: body.user_id,
//       post_id: body.post_id
//     }).then(() => {
//       return Post.findOne({
//         where: {
//           id: body.post_id
//         },
//         attributes: [
//           'id',
//           'post_url',
//           'title',
//           'created_at',
//           [
//             sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
//             'vote_count'
//           ]
//         ],
//         include: [
//           {
//             model: models.Comment,
//             attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
//             include: {
//               model: models.User,
//               attributes: ['username']
//             }
//           }
//         ]
//       });
//     });
//   }
// }

class Topics extends Model {}

// create fields/columns for Post model
Topics.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vote_tally: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date_last_voted: {
        type: DataTypes.DATE,
        allowNull: false
    }
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'topics'
  }
);

module.exports = Topics;