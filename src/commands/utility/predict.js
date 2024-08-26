const { SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('predict')
        .setDescription('Replies with the author prediction')
        .addStringOption((option) =>
            option
                .setName('text')
                .setDescription('The text to predict')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            console.log(
                `[PREDICTION REQUEST] User ${interaction.user.tag} with text: "${interaction.options.getString('text')}"\n`
            );

            const response = await axios.get(process.env.PREDICT_API_URL, {
                params: {
                    text: interaction.options.getString('text'),
                    id: process.env.MODEL_ID
                }
            });

            console.log('[PREDICTION RESPONSE] Success!\n');

            if (response.data == 'Unseen token') {
                await interaction.reply(
                    `Sorry, I have not seen "${interaction.options.getString('text')}" before. I don't know who would say that.`
                );
            } else {
                // Sort the predictions by probability
                const predictions = response.data
                    .sort((a, b) => b[1] - a[1])
                    .map((prediction) => [
                        prediction[0],
                        prediction[1].toFixed(2)
                    ]);

                await interaction.reply(
                    `"${interaction.options.getString('text')}" sounds like **${predictions[0][0]}** (${predictions[0][1]}% confidence)\n` +
                        '\nOther probabilities: \n' +
                        predictions
                            .slice(1)
                            .map(
                                ([username, confidence]) =>
                                    `**${username}** : (${confidence}%)`
                            )
                            .join('\n')
                );
            }
        } catch (err) {
            console.log(err);
            await interaction.reply(
                'Neigh! I encountered an error while trying to predict the text. Please contact your nearest raccoon or try again later.'
            );
        }
    }
};
