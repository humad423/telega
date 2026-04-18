const botToken = '6942227080:AAEyh81XLqU7tTAh5Us1pIfs0fimN41QU5I';
const numericId = '-1001005640892'; // @telegram

async function testFetch() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${numericId}`);
        const data = await response.json();
        console.log('--- NUMERIC ID TEST RESULT ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('------------------------------');
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testFetch();
