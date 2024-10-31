const { MessageEmbed } = require('discord.js');

class EmbedGenerator {
  constructor() {
    this.embed = new MessageEmbed();
  }

  setTitle(title) {
    this.embed.setTitle(title);
    return this;
  }

  setDescription(description) {
    this.embed.setDescription(description);
    return this;
  }

  setThumbnail(thumbnailUrl) {
    this.embed.setThumbnail(thumbnailUrl);
    return this;
  }

  setImage(imageUrl) {
    this.embed.setImage(imageUrl);
    return this;
  }

  setColor(color) {
    this.embed.setColor(color);
    return this;
  }

  addFields(fields) {
    fields.forEach((field) => {
      this.embed.addFields(field);
    });
    return this;
  }

  setTimestamp() {
    this.embed.setTimestamp();
    return this;
  }

  setFooter(text, iconURL) {
    this.embed.setFooter({ text, iconURL });
    return this;
  }

  get() {
    return this.embed;
  }
}

module.exports = { EmbedGenerator };