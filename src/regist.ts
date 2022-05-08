import path from 'path';
import * as dotenv from 'dotenv';
import config from './config.json';

dotenv.config();

const fs = require('fs');
const { REST } = require('@discordjs/rest');
import { Routes } from 'discord-api-types/v9';
const clientId = '931813258879455243';

const commands = [];
const commandFiles = fs
  .readdirSync(path.resolve(__dirname, 'Commands'))
  .filter((file: any) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./Commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
  try {
    // テスト鯖
    await rest.put(Routes.applicationGuildCommands(clientId, '971063863506264074'), {
      body: commands,
    });

    //await rest.put(Routes.applicationCommands(clientId), { body: [] });

    console.log('コマンドを登録しました。');
  } catch (error) {
    console.error(error);
  }
})();
