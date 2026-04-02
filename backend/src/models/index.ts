import { User } from './User.js';
import { Article } from './Article.js';
import { Insight } from './Insight.js';
import { Feedback } from './Feedback.js';
import sequelize from '../db/sequelize.js';

User.hasMany(Insight, { foreignKey: 'userId', as: 'insights' });
Insight.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Article.hasMany(Insight, { foreignKey: 'articleId', as: 'insights' });
Insight.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

Insight.hasMany(Feedback, { foreignKey: 'insightId', as: 'feedback', onDelete: 'CASCADE' });
Feedback.belongsTo(Insight, { foreignKey: 'insightId', as: 'insight' });

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize DB connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
  } catch (error) {
    console.error('❌ DB connection/sync failed:', error);
    throw error; // Still throw to prevent start without DB
  }
}

export { User, Article, Insight, Feedback, sequelize, initDatabase };