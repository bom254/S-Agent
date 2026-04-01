import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize.js';

export class Article extends Model {
  declare id: string;
  declare source: string;
  declare title: string;
  declare url: string;
  declare publishedAt: Date | null;
  declare content: string | null;
  declare sentiment: string | null;
  declare metadata: Record<string, unknown> | null;
  declare createdAt: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sentiment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'articles',
  }
);
