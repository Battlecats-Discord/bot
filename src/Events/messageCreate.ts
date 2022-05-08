import type { Message } from 'discord.js';

module.exports = {
  name: 'messageCreate',
  async execute(message: Message) {
    if (!message.guild) return;

    // Botによるメッセージは無視
    if (message.author.bot) return;

    // お知らせ自動公開
    if (message.channel.type === 'GUILD_NEWS') {
      message.crosspost();
    }
  },
};
