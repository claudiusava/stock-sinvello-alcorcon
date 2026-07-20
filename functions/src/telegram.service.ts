import axios from "axios";
import {defineSecret} from "firebase-functions/params";

const telegramBotToken = defineSecret("TELEGRAM_BOT_TOKEN");
const telegramChatId = defineSecret("TELEGRAM_CHAT_ID");

export class TelegramService {
  async sendMessage(text: string): Promise<void> {
    const token = telegramBotToken.value();
    const chatId = telegramChatId.value();

    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text,
      },
    );
  }
}

export {telegramBotToken, telegramChatId};