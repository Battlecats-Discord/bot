import {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  Interaction,
  GuildMemberRoleManager,
} from 'discord.js';
import Bot from '../Components/Bot';
import VerifyCreate from '../Components/VerifyCreate';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    if (interaction.isCommand()) {
      const command = Bot.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        return interaction
          .reply({
            content: 'エラーが発生しました。\n' + error,
            ephemeral: true,
          })
          .catch(() => interaction.editReply('エラーが発生しました。\n' + error));
      }
    } else if (interaction.isButton()) {
      const targetMemberRoles = interaction.member!.roles as GuildMemberRoleManager;
      const buttonId = interaction.customId;

      if (buttonId.startsWith('rolepanel-')) {
        const panelType = interaction.customId.split('rolepanel-')[1];
        const panelData = require(`../Data/Rolepanel/${panelType}.json`);

        const selectOptions: any[] = [];
        for (const roleData of panelData.options) {
          selectOptions.push({
            label: roleData.name,
            value: roleData.id,
            emoji: roleData.emoji,
            default: targetMemberRoles.cache.has(roleData.id),
          });
        }

        interaction.reply({
          embeds: [new MessageEmbed().setDescription(panelData.description).setColor('BLURPLE')],
          components: [
            new MessageActionRow().addComponents(
              new MessageSelectMenu()
                .setCustomId(`rolepanel-${panelType}`)
                .setMinValues(0)
                .setMaxValues(selectOptions.length)
                .addOptions(selectOptions)
            ),
          ],
          ephemeral: true,
        });
      }

      if (buttonId === 'sendVerifyURL') {
        VerifyCreate(interaction);
      }
    } else if (interaction.isSelectMenu()) {
      if (interaction.customId.startsWith('rolepanel-')) {
        const panelType = interaction.customId.split('rolepanel-')[1];
        const panelData = require(`../Data/Rolepanel/${panelType}.json`);

        const panelRoles = panelData.options.map((option: { id: string }) => option.id);
        const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
        const currentRoles = memberRoles.cache
          .map((role) => role.id)
          .filter((role) => panelRoles.includes(role));

        const addRoles = interaction.values.filter((value) => !currentRoles.includes(value));
        const removeRoles = currentRoles.filter((value) => !interaction.values.includes(value));

        memberRoles.add(addRoles);
        memberRoles.remove(removeRoles);

        interaction.update({
          embeds: [
            new MessageEmbed()
              .setTitle(':white_check_mark: 設定を保存しました')
              .setDescription(
                (addRoles[0]
                  ? `${addRoles.map((role) => `<@&${role}>`).join(', ')} を付与しました。`
                  : '') +
                  '\n' +
                  (removeRoles[0]
                    ? `${removeRoles.map((role) => `<@&${role}>`).join(', ')} を削除しました。`
                    : '')
              )
              .setColor('GREEN'),
          ],
          components: [],
        });
      }
    }
  },
};
