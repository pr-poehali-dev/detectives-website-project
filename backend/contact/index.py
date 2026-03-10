import os
import json
import requests

TELEGRAM_CHAT_ID = "@tormelatoninov"

def handler(event: dict, context) -> dict:
    """Принимает заявку с сайта и отправляет уведомление в Telegram @tormelatoninov"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    try:
        body = json.loads(event.get('body') or '{}')
        name = body.get('name', '').strip()
        telegram = body.get('telegram', '').strip()
        message = body.get('message', '').strip()

        if not name or not message:
            return {
                'statusCode': 400,
                'headers': cors,
                'body': json.dumps({'ok': False, 'error': 'Имя и сообщение обязательны'})
            }

        bot_token = os.environ['TELEGRAM_BOT_TOKEN']

        text = (
            "🔍 *Новая заявка с сайта Detective Adapter*\n\n"
            f"👤 *Имя:* {name}\n"
            f"📱 *Telegram:* {telegram or '—'}\n\n"
            f"📋 *Сообщение:*\n{message}"
        )

        tg_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        resp = requests.post(tg_url, json={
            'chat_id': TELEGRAM_CHAT_ID,
            'text': text,
            'parse_mode': 'Markdown'
        }, timeout=10)

        tg_data = resp.json()
        if not tg_data.get('ok'):
            return {
                'statusCode': 500,
                'headers': cors,
                'body': json.dumps({'ok': False, 'error': tg_data.get('description', 'Ошибка Telegram')})
            }

        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'ok': True})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors,
            'body': json.dumps({'ok': False, 'error': str(e)})
        }
