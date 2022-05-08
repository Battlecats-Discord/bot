import { Client, Collection } from 'discord.js';
import { createConnection } from 'mysql';
import * as dotenv from 'dotenv';
import config from '../config.json';

// .envから値の読み込み
dotenv.config();

export default class Bot {
  static client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_VOICE_STATES'],
  });
  static db = createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    charset: 'utf8mb4',
  });
  static commands: Collection<String, any> = new Collection();
  static messageCommands: Collection<String, any> = new Collection();
  static pins: any = [];
}
