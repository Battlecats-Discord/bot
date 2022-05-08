import { MessageEmbed, TextChannel } from 'discord.js';
import Bot from './Components/Bot';
import Web from './Web';
import dotenv from 'dotenv';
import fs from 'fs';
import config from './config.json';
import path from 'path';

// .envから値の読み込み
dotenv.config();

const client = Bot.client;

// MySQLサーバーへ接続
Bot.db.connect();

setInterval(() => {
  Bot.db.query('SELECT * FROM `shibari`', async (e: any, rows: any[]) => {
    if (!rows || !rows[0]) return;

    for (const row of rows) {
      if (Date.parse(row.date) - 1000 * 60 * 60 * 9 <= Date.now()) {
        const channel = client.channels.resolve(config.channels.shibari) as TextChannel;

        channel.send({
          embeds: [new MessageEmbed().setDescription(row.text).setColor('BLURPLE')],
        });

        Bot.db.query('DELETE FROM `shibari` WHERE `ID` = ?', [row.ID]);
      }
    }
  });
}, 60000);

const commandFiles = fs
  .readdirSync(path.resolve(__dirname, 'Commands'))
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./Commands/${file}`);
  Bot.commands.set(command.data.name, command);
}

const messageCommandFiles = fs
  .readdirSync(path.resolve(__dirname, 'MessageCommands'))
  .filter((file) => file.endsWith('.js'));

for (const file of messageCommandFiles) {
  const command = require(`./MessageCommands/${file}`);
  Bot.messageCommands.set(command.name, command);
}

const eventFiles = fs
  .readdirSync(path.resolve(__dirname, 'Events'))
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./Events/${file}`);
  if (event.once) {
    client.once(event.name, (...args: any) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any) => event.execute(...args));
  }
}

Web();

client.login(config.token);
