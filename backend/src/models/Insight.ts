import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize.js';

export class Insight extends Model {
  declare id: string;
  declare userId: string | null;
  declare articleId: string | null;
  declare summary: string;
  declare sentiment: string | null;
  declare tags: string[];
  declare keyPoints: string[];
  declare createdAt: Date;
}

Insight.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sentiment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    keyPoints: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'insights',
  }
);
