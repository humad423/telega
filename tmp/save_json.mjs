import fs from 'fs';
const botToken = '6942227080:AAEyh81XLqU7tTAh5Us1pIfs0fimN41QU5I';
const chatId = '@telegram';

async function testFetch() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`);
        const data = await response.json();
        fs.writeFileSync('d:/telgr/tmp/full_response.json', JSON.stringify(data, null, 2));
        console.log('JSON written to d:/telgr/tmp/full_response.json');
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testFetch();
